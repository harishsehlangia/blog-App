import crypto from 'crypto';
import bcrypt from 'bcrypt';
import User from '../Schema/User.js';
import LoginAttempt from '../Schema/LoginAttempt.js';
import AuthCode from '../Schema/AuthCode.js';
import passport from 'passport';
import { emailRegex, passwordRegex } from '../utils/regex.js';
import { generateUsername } from '../utils/helpers.js';
import { generateTokenPair, generateAccessToken, verifyRefreshToken } from '../services/token.service.js';
import { generateOtp, verifyOtp } from '../services/otp.service.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service.js';
import { AUTH } from '../constants/auth.constants.js';
import { ERRORS } from '../constants/error-messages.js';

// ─────────────────────────────────────────────
// Signup — creates unverified user, sends OTP
// ─────────────────────────────────────────────
export const signup = async (req, res) => {
    try {
        let { fullname, email, password } = req.body;

        // Input validation
        if (!fullname || fullname.length < 3) {
            return res.status(422).json({ error: ERRORS.FULLNAME_TOO_SHORT });
        }
        if (!email || !email.length) {
            return res.status(422).json({ error: ERRORS.EMAIL_REQUIRED });
        }
        if (!emailRegex.test(email)) {
            return res.status(422).json({ error: ERRORS.EMAIL_INVALID });
        }
        if (!passwordRegex.test(password)) {
            return res.status(422).json({ error: ERRORS.PASSWORD_WEAK });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ "personal_info.email": email.toLowerCase() });
        if (existingUser) {
            // If user exists but is unverified, allow re-registration
            if (!existingUser.personal_info.isEmailVerified) {
                // Update the existing unverified user with new data
                const hashed_password = await bcrypt.hash(password, AUTH.SALT_ROUNDS);
                const username = await generateUsername(email);

                existingUser.personal_info.fullname = fullname;
                existingUser.personal_info.password = hashed_password;
                existingUser.personal_info.username = username;
                await existingUser.save();

                // Generate and send OTP
                const otp = await generateOtp(email.toLowerCase());
                await sendVerificationEmail(email, otp);

                return res.status(200).json({
                    message: "Verification OTP sent to your email",
                    email: email.toLowerCase(),
                });
            }
            return res.status(409).json({ error: ERRORS.EMAIL_EXISTS });
        }

        // Hash password and create user
        const hashed_password = await bcrypt.hash(password, AUTH.SALT_ROUNDS);
        const username = await generateUsername(email);

        const user = new User({
            personal_info: {
                fullname,
                email: email.toLowerCase(),
                password: hashed_password,
                username,
                isEmailVerified: false,
            },
            provider: 'local',
        });

        await user.save();

        // Generate and send OTP
        const otp = await generateOtp(email.toLowerCase());
        await sendVerificationEmail(email, otp);

        return res.status(200).json({
            message: "Verification OTP sent to your email",
            email: email.toLowerCase(),
        });

    } catch (err) {
        console.error('[Signup Error]', err.message);

        if (err.code === 11000) {
            return res.status(409).json({ error: ERRORS.EMAIL_EXISTS });
        }
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        return res.status(500).json({ error: ERRORS.SERVER_ERROR });
    }
};

// ─────────────────────────────────────────────
// Verify Email — validates OTP, returns tokens
// ─────────────────────────────────────────────
export const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(422).json({ error: ERRORS.OTP_REQUIRED });
        }

        // Verify the OTP
        await verifyOtp(email.toLowerCase(), otp);

        // Mark email as verified
        const user = await User.findOneAndUpdate(
            { "personal_info.email": email.toLowerCase() },
            { "personal_info.isEmailVerified": true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: ERRORS.USER_NOT_FOUND });
        }

        // Generate tokens and store hashed refresh token
        const tokens = generateTokenPair(user._id);
        const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, AUTH.SALT_ROUNDS);
        await User.updateOne({ _id: user._id }, { refreshToken: hashedRefreshToken });

        return res.status(200).json({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            profile_img: user.personal_info.profile_img,
            username: user.personal_info.username,
            fullname: user.personal_info.fullname,
        });

    } catch (err) {
        console.error('[Verify Email Error]', err.message);
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        return res.status(500).json({ error: ERRORS.SERVER_ERROR });
    }
};

// ─────────────────────────────────────────────
// Resend OTP — with 60-second cooldown
// ─────────────────────────────────────────────
export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(422).json({ error: ERRORS.EMAIL_REQUIRED });
        }

        const user = await User.findOne({ "personal_info.email": email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ error: ERRORS.USER_NOT_FOUND });
        }

        if (user.personal_info.isEmailVerified) {
            return res.status(400).json({ error: ERRORS.EMAIL_ALREADY_VERIFIED });
        }

        // Generate and send new OTP (cooldown enforced inside generateOtp)
        const otp = await generateOtp(email.toLowerCase());
        await sendVerificationEmail(email, otp);

        return res.status(200).json({
            message: "Verification OTP resent to your email",
        });

    } catch (err) {
        console.error('[Resend OTP Error]', err.message);
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        return res.status(500).json({ error: ERRORS.SERVER_ERROR });
    }
};

// ─────────────────────────────────────────────
// Signin — with brute-force protection
// ─────────────────────────────────────────────
export const signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(422).json({ error: ERRORS.INVALID_CREDENTIALS });
        }

        const identifier = email.toLowerCase().trim();

        // Check brute-force lockout
        const recentAttempts = await LoginAttempt.countDocuments({ identifier });
        if (recentAttempts >= AUTH.MAX_LOGIN_ATTEMPTS) {
            return res.status(429).json({ error: ERRORS.ACCOUNT_LOCKED });
        }

        // Find user by email OR username
        const user = await User.findOne({
            $or: [
                { "personal_info.email": identifier },
                { "personal_info.username": identifier },
            ]
        }).select('+personal_info.password');

        if (!user) {
            // Record failed attempt
            await LoginAttempt.create({
                identifier,
                expiresAt: new Date(Date.now() + AUTH.LOGIN_LOCKOUT_MS),
            });
            return res.status(401).json({ error: ERRORS.INVALID_CREDENTIALS });
        }

        // Check if this is a Google-only account
        if (user.google_auth) {
            return res.status(403).json({ error: ERRORS.LOCAL_ACCOUNT_EXISTS });
        }

        // Check if email is verified
        if (!user.personal_info.isEmailVerified) {
            return res.status(403).json({
                error: ERRORS.EMAIL_NOT_VERIFIED,
                email: user.personal_info.email,
                needsVerification: true,
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.personal_info.password);

        if (!isPasswordValid) {
            // Record failed attempt
            await LoginAttempt.create({
                identifier,
                expiresAt: new Date(Date.now() + AUTH.LOGIN_LOCKOUT_MS),
            });

            const attemptsLeft = AUTH.MAX_LOGIN_ATTEMPTS - (recentAttempts + 1);
            return res.status(401).json({
                error: attemptsLeft > 0
                    ? `${ERRORS.INVALID_CREDENTIALS} (${attemptsLeft} attempts remaining)`
                    : ERRORS.ACCOUNT_LOCKED,
            });
        }

        // Success — clear all login attempts for this identifier
        await LoginAttempt.deleteMany({ identifier });

        // Generate tokens and store hashed refresh token
        const tokens = generateTokenPair(user._id);
        const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, AUTH.SALT_ROUNDS);
        await User.updateOne({ _id: user._id }, { refreshToken: hashedRefreshToken });

        return res.status(200).json({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            profile_img: user.personal_info.profile_img,
            username: user.personal_info.username,
            fullname: user.personal_info.fullname,
        });

    } catch (err) {
        console.error('[Signin Error]', err.message);
        return res.status(500).json({ error: ERRORS.SERVER_ERROR });
    }
};

// ─────────────────────────────────────────────
// Google Auth — Passport OAuth 2.0 redirect flow
// ─────────────────────────────────────────────

/**
 * Step 1: Initiates Google OAuth — redirects user to Google consent screen.
 * GET /api/auth/google
 */
export const googleAuthRedirect = passport.authenticate('google', {
    scope: ['email', 'profile'],
    session: false,
});

/**
 * Step 2: Google callback — uses Passport's custom callback pattern
 * so we can handle errors/failures ourselves and always redirect
 * to the frontend (never to a backend route).
 * GET /api/auth/google/callback
 */
export const googleAuthCallback = (req, res, next) => {
    passport.authenticate('google', { session: false }, async (err, user, info) => {
        const frontendUrl = process.env.FRONTEND_URL;

        try {
            // Passport error (strategy threw)
            if (err) {
                console.error('[Google Auth Error]', err.message);
                return res.redirect(
                    `${frontendUrl}/auth/callback?error=${encodeURIComponent(ERRORS.GOOGLE_AUTH_FAILED)}`
                );
            }

            // Authentication failed (e.g. email registered with password)
            if (!user) {
                const message = info?.message || ERRORS.GOOGLE_AUTH_FAILED;
                return res.redirect(
                    `${frontendUrl}/auth/callback?error=${encodeURIComponent(message)}`
                );
            }

            // Generate a short-lived, single-use authorization code
            // instead of passing tokens directly in the URL.
            const code = crypto.randomBytes(32).toString('hex');

            await AuthCode.create({
                code,
                userId: user._id,
                expiresAt: new Date(Date.now() + AUTH.AUTH_CODE_EXPIRY_MS),
            });

            // Redirect with ONLY the opaque code — no tokens in the URL
            return res.redirect(`${frontendUrl}/auth/callback?code=${code}`);

        } catch (error) {
            console.error('[Google Auth Callback Error]', error.message);
            return res.redirect(
                `${frontendUrl}/auth/callback?error=${encodeURIComponent(ERRORS.GOOGLE_AUTH_FAILED)}`
            );
        }
    })(req, res, next);
};

// ─────────────────────────────────────────────
// Exchange Auth Code — trades a one-time code for tokens
// ─────────────────────────────────────────────
export const exchangeAuthCode = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(422).json({ error: 'Authorization code is required' });
        }

        // Find and delete the code atomically (single-use)
        const authCode = await AuthCode.findOneAndDelete({ code });

        if (!authCode) {
            return res.status(401).json({ error: 'Invalid or expired authorization code' });
        }

        // Check expiry (belt-and-suspenders — TTL index handles cleanup)
        if (authCode.expiresAt < new Date()) {
            return res.status(401).json({ error: 'Authorization code has expired' });
        }

        // Load the user
        const user = await User.findById(authCode.userId);
        if (!user) {
            return res.status(404).json({ error: ERRORS.USER_NOT_FOUND });
        }

        // Generate tokens and store hashed refresh token
        const tokens = generateTokenPair(user._id);
        const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, AUTH.SALT_ROUNDS);
        await User.updateOne({ _id: user._id }, { refreshToken: hashedRefreshToken });

        return res.status(200).json({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            profile_img: user.personal_info.profile_img,
            username: user.personal_info.username,
            fullname: user.personal_info.fullname,
        });

    } catch (err) {
        console.error('[Exchange Auth Code Error]', err.message);
        return res.status(500).json({ error: ERRORS.SERVER_ERROR });
    }
};

// ─────────────────────────────────────────────
// Forgot Password — sends reset OTP
// ─────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(422).json({ error: ERRORS.EMAIL_REQUIRED });
        }

        const user = await User.findOne({ "personal_info.email": email.toLowerCase() });

        // Always return success to prevent email enumeration
        if (!user || user.google_auth) {
            return res.status(200).json({ message: ERRORS.PASSWORD_RESET_SENT });
        }

        const otp = await generateOtp(email.toLowerCase());
        await sendPasswordResetEmail(email, otp);

        return res.status(200).json({ message: ERRORS.PASSWORD_RESET_SENT });

    } catch (err) {
        console.error('[Forgot Password Error]', err.message);
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        return res.status(500).json({ error: ERRORS.SERVER_ERROR });
    }
};

// ─────────────────────────────────────────────
// Reset Password — verifies OTP + updates password
// ─────────────────────────────────────────────
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(422).json({ error: "Email, OTP, and new password are required" });
        }

        if (!passwordRegex.test(newPassword)) {
            return res.status(422).json({ error: ERRORS.PASSWORD_WEAK });
        }

        // Verify the OTP
        await verifyOtp(email.toLowerCase(), otp);

        // Hash and update the password
        const hashedPassword = await bcrypt.hash(newPassword, AUTH.SALT_ROUNDS);

        const user = await User.findOneAndUpdate(
            { "personal_info.email": email.toLowerCase() },
            { "personal_info.password": hashedPassword }
        );

        if (!user) {
            return res.status(404).json({ error: ERRORS.USER_NOT_FOUND });
        }

        return res.status(200).json({ message: ERRORS.PASSWORD_RESET_SUCCESS });

    } catch (err) {
        console.error('[Reset Password Error]', err.message);
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        return res.status(500).json({ error: ERRORS.SERVER_ERROR });
    }
};

// ─────────────────────────────────────────────
// Refresh Token — returns new access token
// ─────────────────────────────────────────────
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.status(401).json({ error: ERRORS.REFRESH_TOKEN_INVALID });
        }

        // Verify JWT signature
        const decoded = verifyRefreshToken(token);
        if (!decoded) {
            return res.status(401).json({ error: ERRORS.REFRESH_TOKEN_INVALID });
        }

        // Find user and verify stored refresh token matches
        const user = await User.findById(decoded.id).select('+refreshToken');
        if (!user || !user.refreshToken) {
            return res.status(401).json({ error: ERRORS.REFRESH_TOKEN_INVALID });
        }

        const isMatch = await bcrypt.compare(token, user.refreshToken);
        if (!isMatch) {
            return res.status(401).json({ error: ERRORS.REFRESH_TOKEN_INVALID });
        }

        // Issue new access token only
        const newAccessToken = generateAccessToken(user._id);

        return res.status(200).json({ access_token: newAccessToken });

    } catch (err) {
        console.error('[Refresh Token Error]', err.message);
        return res.status(500).json({ error: ERRORS.SERVER_ERROR });
    }
};

// ─────────────────────────────────────────────
// Logout — invalidates refresh token
// ─────────────────────────────────────────────
export const logout = async (req, res) => {
    try {
        await User.updateOne(
            { _id: req.user },
            { $unset: { refreshToken: 1 } }
        );

        return res.status(200).json({ message: "Logged out successfully" });

    } catch (err) {
        console.error('[Logout Error]', err.message);
        return res.status(500).json({ error: ERRORS.SERVER_ERROR });
    }
};

// ─────────────────────────────────────────────
// Change Password — for authenticated users
// ─────────────────────────────────────────────
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)) {
            return res.status(422).json({ error: ERRORS.PASSWORD_WEAK });
        }

        const user = await User.findOne({ _id: req.user }).select('+personal_info.password');

        if (!user) {
            return res.status(404).json({ error: ERRORS.USER_NOT_FOUND });
        }

        if (user.google_auth) {
            return res.status(403).json({ error: ERRORS.GOOGLE_PASSWORD_CHANGE });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.personal_info.password);
        if (!isMatch) {
            return res.status(403).json({ error: ERRORS.CURRENT_PASSWORD_INCORRECT });
        }

        const hashedPassword = await bcrypt.hash(newPassword, AUTH.SALT_ROUNDS);
        await User.updateOne({ _id: req.user }, { "personal_info.password": hashedPassword });

        return res.status(200).json({ message: "Password changed successfully" });

    } catch (err) {
        console.error('[Change Password Error]', err.message);
        return res.status(500).json({ error: ERRORS.SERVER_ERROR });
    }
};

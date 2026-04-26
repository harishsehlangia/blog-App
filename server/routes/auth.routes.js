import { Router } from 'express';
import passport from 'passport';
import {
    signup,
    signin,
    googleAuthRedirect,
    googleAuthCallback,
    verifyEmail,
    resendOtp,
    forgotPassword,
    resetPassword,
    refreshToken,
    logout,
    changePassword,
} from '../controllers/auth.controller.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { verifyJWT } from '../middleware/auth.js';

const router = Router();

// ── Public routes (no JWT required) ──────────────
router.post("/signup",          authLimiter, signup);
router.post("/signin",          authLimiter, signin);
router.post("/verify-email",    authLimiter, verifyEmail);
router.post("/resend-otp",      authLimiter, resendOtp);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password",  authLimiter, resetPassword);
router.post("/refresh-token",   refreshToken);

// ── Google OAuth 2.0 (server-side redirect flow) ──
router.get("/api/auth/google", googleAuthRedirect);
router.get("/api/auth/google/callback", googleAuthCallback);

// ── Protected routes (JWT required) ──────────────
router.post("/change-password", verifyJWT, changePassword);
router.post("/logout",          verifyJWT, logout);

export default router;

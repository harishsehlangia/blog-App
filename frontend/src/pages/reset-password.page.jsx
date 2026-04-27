import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import usePageTitle from "../common/usePageTitle";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import { Toaster, toast } from "react-hot-toast";
import api from "../common/api";

const ResetPassword = () => {

    usePageTitle("Reset Password");

    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email;

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const inputRefs = useRef([]);

    // Redirect if no email in state
    useEffect(() => {
        if (!email) {
            navigate("/forgot-password", { replace: true });
        }
    }, [email, navigate]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const newOtp = [...otp];
        pasted.split("").forEach((char, i) => {
            newOtp[i] = char;
        });
        setOtp(newOtp);
        const lastIndex = Math.min(pasted.length, 5);
        inputRefs.current[lastIndex]?.focus();
    };

    const handleReset = (e) => {
        e.preventDefault();

        const otpString = otp.join("");
        if (otpString.length !== 6) {
            return toast.error("Please enter the complete 6-digit OTP");
        }

        const form = new FormData(document.getElementById("resetForm"));
        const newPassword = form.get("newPassword");
        const confirmPassword = form.get("confirmPassword");

        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
        if (!passwordRegex.test(newPassword)) {
            return toast.error("Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters");
        }

        if (newPassword !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        setLoading(true);

        api.post("/reset-password", {
            email,
            otp: otpString,
            newPassword
        })
        .then(({ data }) => {
            toast.success(data.message || "Password reset successfully!");
            setSuccess(true);
        })
        .catch(({ response }) => {
            toast.error(response?.data?.error || "Reset failed");
        })
        .finally(() => setLoading(false));
    };

    if (!email) return null;

    return (
        <AnimationWrapper keyValue="reset-password">
            <section className="h-cover flex items-center justify-center">
                <Toaster />
                {
                    !success ? (
                        <form id="resetForm" className="w-[80%] max-w-[400px]" onSubmit={handleReset}>

                            <h1 className="text-4xl font-gelasio text-center mb-4">
                                Reset password
                            </h1>

                            <p className="text-dark-grey text-lg text-center mb-2">
                                Enter the code sent to
                            </p>
                            <p className="text-black font-medium text-lg text-center mb-8">
                                {email}
                            </p>

                            {/* OTP Inputs */}
                            <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={el => inputRefs.current[index] = el}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={e => handleChange(index, e.target.value)}
                                        onKeyDown={e => handleKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-grey rounded-lg focus:border-black focus:outline-none bg-grey/30 transition-colors"
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>

                            <InputBox
                                name="newPassword"
                                type="password"
                                placeholder="New Password"
                                icon="key"
                            />

                            <InputBox
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm Password"
                                icon="key"
                            />

                            <button
                                className="btn-dark center mt-8 w-full max-w-[300px]"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>

                        </form>
                    ) : (
                        <div className="w-[80%] max-w-[400px] text-center">

                            <div className="text-6xl mb-6">✅</div>

                            <h1 className="text-4xl font-gelasio mb-4">
                                Password reset!
                            </h1>

                            <p className="text-dark-grey text-lg mb-10">
                                Your password has been reset successfully. You can now sign in with your new password.
                            </p>

                            <Link
                                to="/signin"
                                className="btn-dark center w-full max-w-[300px] inline-block"
                            >
                                Sign In
                            </Link>

                        </div>
                    )
                }
            </section>
        </AnimationWrapper>
    );
};

export default ResetPassword;

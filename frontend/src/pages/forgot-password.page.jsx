import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import usePageTitle from "../common/usePageTitle";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import { Toaster, toast } from "react-hot-toast";
import api from "../common/api";

const ForgotPassword = () => {

    usePageTitle("Forgot Password");

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        const form = new FormData(document.getElementById("formElement"));
        const emailVal = form.get("email");

        if (!emailVal || !emailVal.length) {
            return toast.error("Enter your email address");
        }

        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(emailVal)) {
            return toast.error("Email is invalid");
        }

        setLoading(true);
        setEmail(emailVal);

        api.post("/forgot-password", { email: emailVal })
        .then(({ data }) => {
            toast.success(data.message || "Reset OTP sent!");
            setSent(true);
        })
        .catch(({ response }) => {
            toast.error(response?.data?.error || "Something went wrong");
        })
        .finally(() => setLoading(false));
    };

    const handleContinue = () => {
        navigate("/reset-password", { state: { email } });
    };

    return (
        <AnimationWrapper keyValue="forgot-password">
            <section className="h-cover flex items-center justify-center">
                <Toaster />
                {
                    !sent ? (
                        <form id="formElement" className="w-[80%] max-w-[400px]">

                            <h1 className="text-4xl font-gelasio text-center mb-4">
                                Forgot password?
                            </h1>

                            <p className="text-dark-grey text-lg text-center mb-10">
                                Enter your email and we'll send you a reset code
                            </p>

                            <InputBox
                                name="email"
                                type="text"
                                placeholder="Email"
                                icon="mail"
                            />

                            <button
                                className="btn-dark center mt-8 w-full max-w-[300px]"
                                type="submit"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send Reset Code"}
                            </button>

                            <p className="mt-8 text-dark-grey text-xl text-center">
                                Remember your password?
                                <Link to="/signin" className="underline text-black text-xl ml-1">
                                    Sign in
                                </Link>
                            </p>

                        </form>
                    ) : (
                        <div className="w-[80%] max-w-[400px] text-center">

                            <div className="text-6xl mb-6">📧</div>

                            <h1 className="text-4xl font-gelasio mb-4">
                                Check your email
                            </h1>

                            <p className="text-dark-grey text-lg mb-2">
                                We sent a password reset code to
                            </p>
                            <p className="text-black font-medium text-lg mb-10">
                                {email}
                            </p>

                            <button
                                className="btn-dark center w-full max-w-[300px]"
                                onClick={handleContinue}
                            >
                                Enter Reset Code
                            </button>

                            <p className="mt-6 text-dark-grey text-base">
                                Didn't receive it?{" "}
                                <button
                                    type="button"
                                    onClick={() => setSent(false)}
                                    className="underline text-black"
                                >
                                    Try again
                                </button>
                            </p>

                        </div>
                    )
                }
            </section>
        </AnimationWrapper>
    );
};

export default ForgotPassword;

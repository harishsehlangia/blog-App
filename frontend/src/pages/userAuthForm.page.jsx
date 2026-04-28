import { useContext } from "react";
import usePageTitle from "../common/usePageTitle";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../common/api";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";
import Icon from "../components/Icon";


const UserAuthForm = ( {type} ) => {

    const { userAuth: { access_token }, setUserAuth } = useContext(UserContext)
    const navigate = useNavigate();

    usePageTitle(type === 'sign-in' ? 'Sign In' : 'Sign Up');

    const handleSubmit = (e) => {

        e.preventDefault();

        let serverRoute = type == "sign-in" ? "/signin" : "/signup"

        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
        let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

        //formData
        let form = new FormData(document.getElementById("formElement"));
        let formData = {};

        for(let [key, value] of form.entries()){
            formData[key] = value;
        }

        let { fullname, email, password } = formData;

        // Form Validation
        if(fullname){
            if(fullname.length < 3){
                return toast.error("Fullname must be at least 3 letters long")
            }
        }
        if(!email.length){
            return toast.error("Enter Email");
        }
        if(!emailRegex.test(email)){
            return toast.error("Email is invalid" );
        }
        if(!passwordRegex.test(password)){
            return toast.error("Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters");
        }

        api.post(serverRoute, formData)
        .then(({ data }) => {

            if (type === "sign-up") {
                // Signup returns { message, email } — redirect to OTP verification
                toast.success(data.message || "OTP sent to your email!");
                navigate("/verify-otp", { state: { email: data.email } });
            } else {
                // Signin — check if email needs verification
                if (data.needsVerification) {
                    toast.error("Please verify your email first");
                    navigate("/verify-otp", { state: { email: data.email } });
                } else {
                    // Successful sign-in — store tokens and redirect
                    storeInSession("user", JSON.stringify(data));
                    setUserAuth(data);
                }
            }

        })
        .catch(({ response }) => {
            if (response?.data?.needsVerification) {
                // Email not verified — redirect to OTP page
                toast.error("Please verify your email first");
                navigate("/verify-otp", { state: { email: response.data.email } });
            } else {
                toast.error(response?.data?.error || "Something went wrong");
            }
        })

    }

    const handleGoogleAuth = (e) => {
        e.preventDefault();
        // Redirect to server-side Google OAuth (Passport.js handles the flow)
        window.location.href = `${import.meta.env.VITE_SERVER_DOMAIN}api/auth/google`;
    }

    return(
        access_token ?
        <Navigate to="/" />
        :
        <AnimationWrapper keyValue={type}>
            <section className="h-cover flex items-center justify-center">
                <div className="flex w-full max-w-[900px] mx-auto max-lg:flex-col">
                    
                    {/* Left: Brand panel */}
                    <div className="hidden lg:flex flex-col justify-center flex-1 pr-16">
                        <div className="mb-8">
                            <span className="inline-block px-3 py-1 rounded-full bg-brand/10 text-brand text-sm font-semibold mb-6">
                                {type == "sign-in" ? "Welcome back" : "Get started free"}
                            </span>
                            <h1 className="text-5xl font-bold leading-tight mb-4">
                                {type == "sign-in" 
                                    ? <>Where ideas <br/><span className="text-brand">come alive.</span></> 
                                    : <>Start your <br/><span className="text-brand">writing journey.</span></>
                                }
                            </h1>
                            <p className="text-dark-grey text-2xl leading-relaxed">
                                {type == "sign-in" 
                                    ? "Sign in to discover stories, share your perspective, and connect with a community of thinkers."
                                    : "Join a community of writers and readers. Share your stories with the world."
                                }
                            </p>
                        </div>
                        <div className="flex items-center gap-6 text-dark-grey">
                            <div className="flex items-center gap-2">
                                <Icon name="edit_note" className="text-brand" />
                                <span className="text-sm">Rich Editor</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Icon name="dark_mode" className="text-brand" />
                                <span className="text-sm">Dark Mode</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Icon name="notifications" className="text-brand" />
                                <span className="text-sm">Real-time</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Auth form */}
                    <div className="w-full max-w-[400px] lg:max-w-[420px] mx-auto lg:mx-0">
                        <form id="formElement" className="w-full bg-surface border border-border rounded-radius-xl p-8 lg:p-10" style={{ boxShadow: 'var(--shadow-lg)' }}>
                            <h1 className="text-3xl font-bold mb-2 lg:hidden">
                                {type == "sign-in" ? "Welcome back" : "Join us today"}
                            </h1>
                            <h1 className="text-2xl font-bold mb-2 hidden lg:block">
                                {type == "sign-in" ? "Sign in to Notelys" : "Create your account"}
                            </h1>
                            <p className="text-dark-grey text-sm mb-8">
                                {type == "sign-in" ? "Enter your credentials to continue" : "Fill in your details to get started"}
                            </p>

                            {
                                type != "sign-in" ?
                                <InputBox 
                                    name="fullname"
                                    type="text"
                                    placeholder="Full name"
                                    icon="person"
                                />
                                : ""
                            }

                            <InputBox 
                                name="email"
                                type="email"
                                placeholder="Email"
                                icon="mail"
                            />

                            <InputBox 
                                name="password"
                                type="password"
                                placeholder="Password"
                                icon="key"
                            />

                            <button
                                className="btn-dark center mt-6 w-full"
                                type="submit"
                                onClick={handleSubmit}
                            >
                                {type.replace("-", " ")}
                            </button>

                            <div className="relative w-full flex items-center gap-2 my-8 opacity-10 uppercase text-black font-bold">
                                <hr className="w-1/2 border-black" />
                                <p className="text-sm">or</p>
                                <hr className="w-1/2 border-black" />
                            </div>

                            <button className="flex items-center justify-center gap-3 w-full py-3 px-6 rounded-full border border-border bg-white hover:bg-grey text-black font-medium transition-all hover:shadow-sm"
                                onClick={handleGoogleAuth}
                            >
                                <img src={googleIcon} className="w-5 h-5" alt="Google" />
                                Continue with Google
                            </button>

                            {
                            
                            type == "sign-in" ?
                            <>
                                <p className="mt-6 text-dark-grey text-sm text-center">
                                    Don't have an account?
                                    <Link to="/signup" className="text-brand font-semibold ml-1 hover:underline">
                                        Sign up
                                    </Link>
                                </p>
                                <p className="mt-2 text-dark-grey text-sm text-center">
                                    <Link to="/forgot-password" className="text-dark-grey hover:text-brand transition-colors">
                                        Forgot password?
                                    </Link>
                                </p>
                            </>
                            :
                            <p className="mt-6 text-dark-grey text-sm text-center">
                                Already a member?
                                <Link to="/signin" className="text-brand font-semibold ml-1 hover:underline">
                                    Sign in
                                </Link>
                            </p>
                            
                            }
                        </form>
                    </div>
                </div>

        </section>
        </AnimationWrapper>

    )
}

export default UserAuthForm;
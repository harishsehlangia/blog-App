import { useContext } from "react";
import usePageTitle from "../common/usePageTitle";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import api from "../common/api";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";


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
                <Toaster />
                <form id="formElement" className="w-[80%] max-w-[400px]">
                    <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
                        {type == "sign-in" ? "Welcome back" : "Join us today"}
                    </h1>

                    {
                        type != "sign-in" ?
                        <InputBox 
                            name="fullname"
                            type="text"
                            placeholder="full name"
                            icon="person"
                        />
                        : ""
                    }

                    <InputBox 
                        name="email"
                        type="text"
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
                        className="btn-dark center mt-14"
                        type="sumbmit"
                        onClick={handleSubmit}
                    >
                        {type.replace("-", " ")}
                    </button>

                    <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
                        <hr className="w-1/2 border-black" />
                        <p>or</p>
                        <hr className="w-1/2 border-black" />
                    </div>

                    <button className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
                        onClick={handleGoogleAuth}
                    >
                        <img src={googleIcon} className="w-5" />
                        continue with google
                    </button>

                    {
                    
                    type == "sign-in" ?
                    <>
                        <p className="mt-6 text-dark-grey text-xl text-center">
                            Don't have an account ?
                            <Link to="/signup" className="underline text-black text-xl ml-1">
                                Join us today
                            </Link>
                        </p>
                        <p className="mt-3 text-dark-grey text-base text-center">
                            <Link to="/forgot-password" className="underline text-black">
                                Forgot password?
                            </Link>
                        </p>
                    </>
                    :
                    <p className="mt-6 text-dark-grey text-xl text-center">
                        Already a member ?
                        <Link to="/signin" className="underline text-black text-xl ml-1">
                            Sign in here.
                        </Link>
                    </p>
                    
                    }
                </form>

        </section>
        </AnimationWrapper>

    )
}

export default UserAuthForm;
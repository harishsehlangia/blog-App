import { Link } from "react-router-dom";
import lightPageNotFoundImg from "../imgs/404-light.png";
import darkPageNotFoundImg from "../imgs/404-dark.png";
import lightFullLogo from "../imgs/full-logo-light.png";
import darkFullLogo from "../imgs/full-logo-dark.png";
import { useContext } from "react";
import { ThemeContext } from "../App";
import Icon from "../components/Icon";

const PageNotFound = () => {

    let { theme } = useContext(ThemeContext);

    return(
        <section className="h-cover relative p-10 flex flex-col items-center gap-12 text-center">

            <div className="relative">
                <img src={ theme === "light" ? darkPageNotFoundImg : lightPageNotFoundImg } className="select-none w-72 aspect-square object-cover rounded-radius-lg" alt="Page not found" />
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-brand/10 text-brand font-bold text-sm px-4 py-1.5 rounded-full whitespace-nowrap">
                    404 — Not Found
                </div>
            </div>
            
            <div>
                <h1 className="text-4xl font-bold mb-4">Page not found</h1>
                <p className="text-dark-grey text-xl leading-7 max-w-md mx-auto">
                    The page you're looking for doesn't exist. Head back to the <Link to="/" className="text-brand font-semibold hover:underline">home page</Link>
                </p>
            </div>

            <Link to="/" className="btn-brand py-3 px-8 flex items-center gap-2">
                <Icon name="home" className="text-xl" />
                Back to Home
            </Link>

            <div className="mt-auto">
                <img src={ theme === "light" ? darkFullLogo : lightFullLogo } className="h-8 object-contain block mx-auto select-none" alt="Notelys logo" />
                <p className="mt-5 text-dark-grey text-sm">Read millions of stories around the world</p>
            </div>

        </section>
    )
}

export default PageNotFound;
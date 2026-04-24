import { useContext, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import darkLogo from "../imgs/logo-dark.png";
import lightLogo from "../imgs/logo-light.png";
import { ThemeContext, UserContext } from "../App";
import UserNavigationPanel from "./user-navigation.component";
import api from "../common/api";
import { storeInSession } from "../common/session";
import Icon from "./Icon";

const Navbar = () => {

    const [ searchBoxVisibility, setSearchBoxVisibility ] = useState(false)
    const [ userNavPanel, setUserNavPanel ] = useState(false);
    const { userAuth, userAuth: { access_token, profile_img, new_notificatoin_available }, setUserAuth } =  useContext(UserContext);

    let { theme, setTheme } = useContext(ThemeContext);

    useEffect(() => {

        if(access_token){
            api.get("/new-notification")
            .then(({ data }) => {
                setUserAuth({ ...userAuth, ...data })
            })
            .catch(err => {
                console.log(err);
            })
        }

    }, [access_token])

    let navigate = useNavigate();

    const handleUserNavPanel = () => {
        setUserNavPanel(currentVal => !currentVal);
    }

    const handleSearch = (e) => {
        let query = e.target.value;

        if(e.keyCode == 13 && query.length){
            navigate(`/search/${query}`)
        }
    }

    const handleBlur = () => {
        setTimeout(() => {
            setUserNavPanel(false);
        }, 300);
    }

    const changeTheme = () => {
        let newTheme = theme == "light" ? "dark": "light";

        setTheme(newTheme);

        document.body.setAttribute("data-theme", newTheme);

        storeInSession("theme", newTheme);
    }

    return(

        <>
            <nav className="navbar z-50">

                <Link to="/" className="flex-none w-10">
                    <img src={ theme == "light" ? darkLogo : lightLogo } className="w-full"/>
                </Link>

                <div className={"absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0     md:block md:relative md:inset-0 md:p-0 md:w-auto md:show " + (searchBoxVisibility ? "show" : "hide")}>
                    <input 
                        type="text"
                        placeholder="Search"
                        className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey   md:pl-12"
                        onKeyDown={handleSearch}  
                    />

                    <Icon name="search" className="absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey" />
                </div>

                <div className="flex items-center gap-3 md:gap-6 ml-auto">
                    <button className="md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center"
                    onClick={()=>setSearchBoxVisibility(currentVal => !currentVal)}
                    >
                        <Icon name="search" className="text-xl" />
                    </button>

                    <Link to="/editor" className="hidden md:flex gap-2 link items-center">
                        <Icon name="edit_note" />
                        <p>Write</p>
                    </Link>

                    <button 
                        className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10 flex items-center justify-center"
                        onClick={changeTheme}
                    >
                        <Icon name={theme == "light" ? "dark_mode" : "light_mode"} className="text-2xl" />
                    </button>


                    {
                        access_token ?
                        <>
                            <Link to="/dashboard/notifications">
                                <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10 flex items-center justify-center">
                                    <Icon name="notifications" className="text-2xl" />
                                    {
                                        new_notificatoin_available ? 
                                        <span className="bg-red w-3 h-3 rounded-full absolute z-10 top-2 right-2"></span> : " "
                                    }
                                </button>
                            </Link>

                            <div className="relative" onClick={handleUserNavPanel} onBlur={handleBlur}>
                                <button className="w-12 h-12 mt-1">
                                    <img src={profile_img} 
                                    className="w-full h-full object-cover rounded-full"/>
                                </button>

                                {
                                    userNavPanel ? <UserNavigationPanel /> : ""
                                }

                            </div>
                        </>
                        :
                        <>    
                            <Link to="/signin" className="btn-dark py-2">
                                Sign In
                            </Link>

                            <Link to="/signup" className="btn-light py-2 hidden md:block">
                                Sign Up
                            </Link>
                        </>
                    }


                </div>

            </nav>
        
            <Outlet />
        </>

    )
}

export default Navbar;
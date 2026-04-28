import { useContext } from "react";
import AnimationWrapper from "../common/page-animation";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { removeFromSession } from "../common/session";
import Icon from "./Icon";

const UserNavigationPanel = () => {

    const { userAuth: { username }, setUserAuth } = useContext(UserContext);

    const signOutUser = () => {
        removeFromSession("user");
        setUserAuth({ access_token: null })
    }

    return (
        <AnimationWrapper
        className="absolute right-0 z-50"
            transition={{ duration: 0.2 }}
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
        >
            <div className="dropdown-panel">
                
                <Link to="/editor" className="flex gap-2 link md:hidden pl-8 py-4 items-center">
                    <Icon name="edit_note" />
                    <p>Write</p>
                </Link>

                <Link to={`/user/${username}`} className="link pl-8 py-4 flex items-center gap-3">
                    <Icon name="person" className="text-xl text-dark-grey" />
                    Profile
                </Link>

                <Link to="/dashboard/blogs" className="link pl-8 py-4 flex items-center gap-3">
                    <Icon name="dashboard" className="text-xl text-dark-grey" />
                    Dashboard
                </Link>

                <Link to="/settings/edit-profile" className="link pl-8 py-4 flex items-center gap-3">
                    <Icon name="settings" className="text-xl text-dark-grey" />
                    Settings
                </Link>

                <div className="border-t border-border" />

                <button className="text-left p-4 hover:bg-grey w-full pl-8 py-4 transition-colors"
                    onClick={signOutUser}
                >
                    <h1 className="font-semibold text-xl mb-1">Sign Out</h1>
                    <p className="text-dark-grey text-sm">@{username}</p>
                </button>

            </div>
        </AnimationWrapper>
    )
}

export default UserNavigationPanel;
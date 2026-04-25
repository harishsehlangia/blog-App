import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar.component";
import { createContext, useEffect, useState, lazy, Suspense } from "react";
import { lookInSession } from "./common/session";
import Loader from "./components/loader.component";

// Lazy load all pages — only downloaded when the user navigates to them
const UserAuthForm = lazy(() => import("./pages/userAuthForm.page"));
const Editor = lazy(() => import("./pages/editor.pages"));
const HomePage = lazy(() => import("./pages/home.page"));
const SearchPage = lazy(() => import("./pages/search.page"));
const PageNotFound = lazy(() => import("./pages/404.page"));
const ProfilePage = lazy(() => import("./pages/profile.page"));
const BlogPage = lazy(() => import("./pages/blog.page"));
const SideNav = lazy(() => import("./components/sidenavbar.component"));
const ChangePassword = lazy(() => import("./pages/change-password.page"));
const EditProfile = lazy(() => import("./pages/edit-profile.page"));
const Notifications = lazy(() => import("./pages/notifications.page"));
const ManageBlogs = lazy(() => import("./pages/manage-blogs.page"));

export const UserContext = createContext({});

export const ThemeContext = createContext({});

const App = () => {

    const [userAuth, setUserAuth] = useState({});
    const [ theme, setTheme ] = useState("light");

    useEffect(() => {

        let userInSession = lookInSession("user");

        let themeInSession = lookInSession("theme");

        userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({ access_token: null });

        if(themeInSession){
            setTheme(() => {
                document.body.setAttribute('data-theme', themeInSession);

                return themeInSession;
            })
        }else{
            document.body.setAttribute('data-theme', theme);    
        }

    }, [])

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <UserContext.Provider value={{userAuth, setUserAuth}}>
                <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path="/editor" element={<Editor/>} />
                        <Route path="/editor/:blog_id" element={<Editor/>} />
                        <Route path="/" element={<Navbar />} >
                            <Route index element={<HomePage />} />
                            <Route path="dashboard" element={<SideNav />} >
                                <Route path="blogs" element={<ManageBlogs />} />
                                <Route path="notifications" element={<Notifications />} />
                            </Route>
                            <Route path="settings" element={<SideNav />} >
                                <Route path="edit-profile" element={<EditProfile />} />
                                <Route path="change-password" element={<ChangePassword />} />
                            </Route>
                            <Route path="signin" element={<UserAuthForm type="sign-in"/>} />
                            <Route path="signup" element={<UserAuthForm type="sign-up" />} />
                            <Route path="search/:query" element={<SearchPage />} />
                            <Route path="user/:id" element={<ProfilePage />} />
                            <Route path="blog/:blog_id" element={<BlogPage />} />
                            <Route path="*" element={<PageNotFound />} />
                        </Route>
                        
                    </Routes>
                </Suspense>
            </UserContext.Provider>
        </ThemeContext.Provider>
    )
}

export default App;
import { Outlet } from "react-router-dom";

const SideNav = () => {
    return(
        <>
        
            <h1>Side NavBar</h1>
            <Outlet />
        
        </>
    )
}

export default SideNav;
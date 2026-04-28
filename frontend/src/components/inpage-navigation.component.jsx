import { useEffect, useRef, useState } from "react";

export let activeTabLineRef;
export let activeTabRef;

const InPageNavigation = ({ routes, defaultHidden = [], defaultActiveIndex = 0, children }) => {
    
    let [ inPageNavIndex, setInPageNavIndex ] = useState(defaultActiveIndex);

    let [ isResizeEventAdded, setIsResizeEventAdded ] = useState(false);
    let [ width, setWidth ] = useState(window.innerWidth);

    activeTabLineRef = useRef();
    activeTabRef = useRef();

    const changePageState = (btn, i) => {
        
        let { offsetWidth, offsetLeft } = btn;

        activeTabLineRef.current.style.width = offsetWidth + "px";
        activeTabLineRef.current.style.left = offsetLeft + "px";

        setInPageNavIndex(i)
    }

    useEffect(() => {

        if(width > 766 && inPageNavIndex != defaultActiveIndex){
            changePageState(activeTabRef.current, defaultActiveIndex);
        }


        if(!isResizeEventAdded){
            window.addEventListener('resize', () => {
                if(!isResizeEventAdded){
                    setIsResizeEventAdded(true);
                }
                setWidth(window.innerWidth);
            })
        }

    }, [width])
    
    return(
        <>
            <div className="relative mb-8 bg-white border-b border-border flex flex-nowrap overflow-x-auto">

                {/* Create buttons "home" & "trending blogs" */}
                {
                    routes.map((route, i) => {
                        return(
                            <button
                            ref={ i == defaultActiveIndex ? activeTabRef : null }
                            key={i}
                            className={"p-4 px-5 capitalize font-medium text-sm tracking-wide " + ( inPageNavIndex == i ? "text-black" : "text-dark-grey hover:text-black/70 " ) + (defaultHidden.includes(route) ? "md:hidden " : " ") + "transition-colors"}
                            onClick={(e) => { changePageState(e.target, i) }}
                            >
                                { route }
                            </button>
                        )
                    })
                }

                <hr ref={activeTabLineRef} className="absolute bottom-0 duration-300 border-brand border-[1.5px] rounded-full" />

            </div>
            
            { Array.isArray(children) ? children[inPageNavIndex] : children }

        </>
    )
}

export default InPageNavigation;
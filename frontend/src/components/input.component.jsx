import { useState } from "react";
import Icon from "./Icon";

const InputBox = ({ name, type, id, value, placeholder, icon, disable=false, className="" }) => {
    
    const [passwordVisible, setPasswordVisible] = useState(false)
    
    return(
        <div className="relative w-[100%] mb-4">
            <input
                name={name}
                type={type == "password" ? passwordVisible ? "text" : "password" : type }
                placeholder={placeholder}
                defaultValue={value}
                id={id}
                disabled={disable}
                className={`input-box ${className}`}
            />

            <Icon name={icon} className="input-icon" />

            {
                type == "password" ?
                <Icon 
                    name={!passwordVisible ? "visibility_off" : "visibility"} 
                    className="input-icon left-[auto] right-4 cursor-pointer hover:text-brand transition-colors"
                    ariaLabel={passwordVisible ? "Hide password" : "Show password"}
                    onClick={()=>setPasswordVisible(currentVal => !currentVal)}
                />
                : ""
            }

        </div>
    )
}

export default InputBox;
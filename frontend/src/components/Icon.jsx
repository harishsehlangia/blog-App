const Icon = ({ name, className = "", filled = false, ariaLabel = "", onClick = null }) => {
    return (
        <span
            className={`material-symbols-outlined ${filled ? "filled" : ""} ${className}`.trim()}
            aria-label={ariaLabel || name}
            role="img"
            onClick={onClick}
        >
            {name}
        </span>
    );
};

export default Icon;

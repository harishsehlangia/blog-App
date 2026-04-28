const Loader = () => {
    return (
        <div className="w-full mx-auto my-8 px-4">
            {/* Skeleton blog card */}
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-8 items-center pb-6 mb-6 border-b border-border animate-pulse" style={{ animationDelay: `${i * 150}ms` }}>
                    <div className="w-full">
                        <div className="flex gap-3 items-center mb-5">
                            <div className="skeleton w-7 h-7 rounded-full flex-none" />
                            <div className="skeleton h-3.5 w-32 rounded-full" />
                            <div className="skeleton h-3.5 w-20 rounded-full" />
                        </div>
                        <div className="skeleton h-5 w-[85%] rounded-full mb-3" />
                        <div className="skeleton h-5 w-[60%] rounded-full mb-4" />
                        <div className="skeleton h-3.5 w-full rounded-full mb-2 max-sm:hidden" />
                        <div className="skeleton h-3.5 w-[70%] rounded-full mb-5 max-sm:hidden" />
                        <div className="flex gap-4 mt-4">
                            <div className="skeleton h-8 w-20 rounded-full" />
                            <div className="skeleton h-8 w-14 rounded-full" />
                        </div>
                    </div>
                    <div className="skeleton h-28 aspect-square rounded-radius-md flex-none" />
                </div>
            ))}
        </div>
    )
}

export default Loader;
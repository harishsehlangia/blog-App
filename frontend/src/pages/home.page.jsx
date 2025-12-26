import AnimationWrapper from "../common/page-animation";

const HomePage = () => {
    return(
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-10">
                {/* latest blogs div */}
                <div className="w-full">

                    <InPageNavigation></InPageNavigation>

                </div>

                {/* filter and tending blogs div */}
                <div>

                </div>
            </section>
        </AnimationWrapper>
    )
}

export default HomePage;
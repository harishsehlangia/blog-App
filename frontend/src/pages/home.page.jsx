import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";

const HomePage = () => {
    return(
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-10">
                {/* latest blogs div */}
                <div className="w-full">

                    <InPageNavigation routes={["home", "trending blogs"]} defaultHidden={["trending blogs"]}>

                        <h1>Latest Blog Here</h1>

                        <h1>Trending Blog Here</h1>

                    </InPageNavigation>

                </div>

                {/* filter and tending blogs div */}
                <div>

                </div>
            </section>
        </AnimationWrapper>
    )
}

export default HomePage;
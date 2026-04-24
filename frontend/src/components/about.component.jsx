import { Link } from "react-router-dom";
import { getFullDay } from "../common/date";
import Icon from "./Icon";
import SocialIcon from "./SocialIcon";

const AboutUser = ({ className, bio, social_links, joinedAt }) => {
    return(
        <div className={"md:w-[90%] md:mt-7 " + className}>
            <p className="text-xl leading-7">{ bio.length ? bio : "Nothing to read here" }</p>

            <div className="flex gap-x-7 gap-y-2 flex-wrap my-7 items-center text-dark-grey">
                {
                    Object.keys(social_links).map((key) => {

                        let link = social_links[key];

                        if (!link) return null;

                        if (key === 'website') {
                            return (
                                <Link to={link} key={key} target="_blank" aria-label="Website">
                                    <Icon name="language" className="text-2xl hover:text-black" />
                                </Link>
                            );
                        }

                        return <SocialIcon key={key} platform={key} url={link} className="!w-6 !h-6" />;
                    })
                }
            </div>

            <p className="text-xl leading-7 text-dark-grey">Joined on {getFullDay(joinedAt)}</p>

        </div>
    )
}

export default AboutUser;
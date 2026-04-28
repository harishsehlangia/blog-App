import { Link } from "react-router-dom";
import { getDay } from "../common/date";

const MinimalBlogPost = ({ blog, index }) => {
    
    let { title, blog_id: id, author: { personal_info: { fullname, username, profile_img } }, publishedAt } = blog;

    return(
        <Link to={`blog/${id}`} className="flex gap-5 mb-6 p-3 -mx-3 rounded-radius-md hover:bg-grey/50 transition-colors group">
            <h1 className={"blog-index " + (index < 3 ? "!text-brand/20" : "")}>{index < 10 ? "0" + (index + 1) : index + 1}</h1>

            <div>
                <div className="flex gap-2 items-center mb-4">
                    <img src={profile_img} className="w-6 h-6 rounded-full flex-none border border-border" alt={fullname}/>
                    <p className="line-clamp-1 text-sm">{fullname}</p>
                    <span className="text-dark-grey text-sm">·</span>
                    <p className="min-w-fit text-dark-grey text-sm">{ getDay(publishedAt) }</p>
                </div>

                <h1 className="blog-title group-hover:text-brand transition-colors">{title}</h1>
            </div>
        </Link>
    )
}

export default MinimalBlogPost;
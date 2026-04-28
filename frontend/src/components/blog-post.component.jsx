import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import Icon from "./Icon";

const BlogPostCard = ({ content, author }) => {

   let { publishedAt, tags, title, des, banner, activity: { total_likes }, blog_id: id, content: blogContent } = content;

   let { fullname, profile_img, username } = author;

   // Estimate read time from description length (rough heuristic)
   const wordCount = des ? des.split(/\s+/).length * 8 : 0; // multiply by factor since des is truncated
   const readTime = Math.max(1, Math.ceil(wordCount / 200));
    
    return(
        <Link to={`/blog/${id}`} className="card group flex gap-8 items-center p-5 mb-5">
            <div className="w-full">
                <div className="flex gap-2 items-center mb-4">
                    <img src={profile_img} className="w-7 h-7 rounded-full flex-none border border-border" alt={fullname}/>
                    <p className="line-clamp-1 font-medium text-sm">{fullname}</p>
                    <span className="text-dark-grey text-sm">·</span>
                    <p className="min-w-fit text-dark-grey text-sm">{ getDay(publishedAt) }</p>
                </div>

                <h1 className="blog-title group-hover:text-brand transition-colors">{title}</h1>

                <p className="my-3 text-xl font-merriweather leading-7 text-dark-grey max-sm:hidden md:max-[1100px]:hidden line-clamp-2">{des}</p>

                <div className="flex gap-4 mt-5 items-center">
                    <span className="py-1.5 px-4 bg-grey text-sm rounded-full capitalize border border-transparent group-hover:border-border transition-colors">{tags[0]}</span>
                    <span className="text-dark-grey text-sm">{readTime} min read</span>
                    <span className="ml-auto flex items-center gap-1.5 text-dark-grey text-sm">
                        <Icon name="favorite" className="text-xl" />
                        { total_likes }
                    </span>
                </div>

            </div>

            <div className="h-28 aspect-square bg-grey rounded-radius-md flex-none overflow-hidden">
                <img src={banner} className="w-full h-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" alt={title}/>
            </div>
        </Link>
        
    )
}

export default BlogPostCard;
import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import api from "../common/api";
import Icon from "./Icon";

const BlogStats = ({ stats }) => {
    return (
        <div className="flex gap-2 max-lg:mb-6 max-lg:pb-6 border-border max-lg:border-b">
            {
                Object.keys(stats).map((key, i) => {
                    return !key.includes("parent") ? 
                    <div key={i} className={"flex flex-col items-center w-full h-full justify-center p-4 px-6 " + (i != 0 ? " border-border border-l " : "")}>
                        <h1 className="text-xl lg:text-2xl mb-2 font-semibold">{stats[key].toLocaleString()}</h1>
                        <p className="max-lg:text-dark-grey capitalize text-sm">{key.split("_")[1]}</p>
                    </div> : ""
                })
            }
        </div>
    )
}

export const ManagePublishedBlogsCard = ({ blog }) => {

    let { banner, blog_id, title, publishedAt, activity } = blog;

    let { userAuth: { access_token } } = useContext(UserContext);

    let [ showStat, setShowStat ] = useState(false);

    return (
        <>
            <div className="flex gap-10 border-b mb-6 max-md:px-4 border-border pb-6 items-center">

                <img src={banner} className="max-md:hidden lg:hidden xl:block w-28 h-28 flex-none bg-grey object-cover rounded-radius-md" alt={title} />

                <div className="flex flex-col justify-between py-2 w-full min-w-[300px]">

                    <div>
                        <Link to={`/blog/${blog_id}`} className="blog-title mb-4 hover:text-brand transition-colors">{title}</Link>

                        <p className="line-clamp-1 text-dark-grey text-sm mt-1">Published on {getDay(publishedAt)}</p>
                    </div>

                    <div className="flex gap-6 mt-3">
                        <Link to={`/editor/${blog_id}`} className="text-dark-grey hover:text-brand transition-colors flex items-center gap-1 text-sm font-medium">
                            <Icon name="edit" className="text-xl" />
                            Edit
                        </Link>

                        <button className="lg:hidden text-dark-grey hover:text-brand transition-colors flex items-center gap-1 text-sm font-medium" onClick={() => setShowStat(preVal => !preVal)}>
                            <Icon name="bar_chart" className="text-xl" />
                            Stats
                        </button>

                        <button 
                            className="text-red hover:text-red/80 transition-colors flex items-center gap-1 text-sm font-medium" 
                            onClick={(e) => deleteBlog(blog, access_token, e.target)}
                        >
                            <Icon name="delete" className="text-xl" />
                            Delete
                        </button>

                    </div>
                    
                </div>

                <div className="max-lg:hidden">
                    <BlogStats stats={activity} />
                </div>

            </div>

            {
                showStat ? <div className="lg:hidden"><BlogStats stats={activity} /></div> : ""
            }

        </>
    )
}

export const ManageDraftBlogPost = ({ blog }) => {

    let { title, des, blog_id, index } = blog;

    let { userAuth: { access_token } } = useContext(UserContext);

    index++;

    return (
        <div className="flex gap-5 lg:gap-10 pb-6 border-b mb-6 border-border">

            <h1 className="blog-index text-center pl-4 md:pl-6 flex-none">{ index < 10 ? "0" + index : index }</h1>

            <div>

                <h1 className="blog-title mb-3">{title}</h1>

                <p className="line-clamp-2 text-dark-grey text-sm">{ des.length ? des : "No Description" }</p>

                <div className="flex gap-6 mt-3">
                    <Link to={`/editor/${blog_id}`} className="text-dark-grey hover:text-brand transition-colors flex items-center gap-1 text-sm font-medium">
                        <Icon name="edit" className="text-xl" />
                        Edit
                    </Link>

                    <button 
                        className="text-red hover:text-red/80 transition-colors flex items-center gap-1 text-sm font-medium" 
                        onClick={(e) => deleteBlog(blog, access_token, e.target)}
                    >
                        <Icon name="delete" className="text-xl" />
                        Delete
                    </button>

                </div>

            </div>
        </div>
    )
}

const deleteBlog = (blog, access_token, target) => {

    let { index, blog_id, setStateFun } = blog;

    target.setAttribute("disabled", true);

    api.post("/delete-blog", { blog_id })
    .then(({ data }) => {

        target.removeAttribute("disabled");

        setStateFun(preVal => {

            let { deletedDocCount, totalDocs, results } = preVal;

            results.splice(index, 1);

            if(!deletedDocCount){
                deletedDocCount = 0;
            }

            if(!results.length &&  totalDocs - 1 > 0){
                return null
            }

            return { ...preVal, totalDocs: totalDocs - 1, deletedDocCount: deletedDocCount + 1 }

        })

    })
    .catch(err => {
        target.removeAttribute("disabled");
    })

}
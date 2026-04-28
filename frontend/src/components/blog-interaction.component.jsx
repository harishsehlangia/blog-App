import { useContext, useEffect } from "react";
import { BlogContext } from "../pages/blog.page";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import toast from "react-hot-toast";
import api from "../common/api";
import Icon from "./Icon";


const BlogInteraction = () => {

    let { blog,
        blog: {
            _id, title, blog_id, activity, 
            activity: { total_likes, total_comments }, 
            author: {
                 personal_info: { username: author_username } 
            }
        },
        setBlog, isLikedByUser, setLikedByUser, setCommentsWrapper } = useContext(BlogContext);

    let { userAuth: { username, access_token } } = useContext(UserContext);

    useEffect(() => {

        if(access_token){
            // make request to server to get liked information
            api.post("/isliked-by-user", { _id })
            .then(({ data: {result} }) => {
                setLikedByUser(Boolean(result));
            })
            .catch(err => {
            })
        }

    }, [])

    const handleLike = () => {
        if(access_token){
            // like the blog
            setLikedByUser(preVal => !preVal);

            const newLikes = !isLikedByUser ? total_likes + 1 : total_likes - 1;

            setBlog({ ...blog, activity: { ...activity, total_likes: newLikes } })

            api.post("/like-blog", { _id, isLikedByUser })
            .catch(err => {
            })

        }
        else{
            // user is not logged in and trying to like the blog
            toast.error("Please login to like this blog");
        }
    }

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(location.href);
            toast.success("Link copied to clipboard!");
        } catch {
            toast.error("Failed to copy link");
        }
    }

    return (
        <>

            <hr className="border-border my-2" />

            <div className="flex gap-6 justify-between py-1">
                <div className="flex gap-3 items-center">

                    <button 
                        onClick={handleLike}
                        className={"w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 " + ( isLikedByUser ? "bg-red/10 text-red" : "bg-grey hover:bg-grey/80" )}
                    >
                        <Icon name="favorite" filled={isLikedByUser} />
                    </button>
                    <p className="text-xl text-dark-grey">{total_likes}</p>


                    <button 
                        onClick={() => setCommentsWrapper(preVal => !preVal)}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-grey hover:bg-grey/80 transition-colors"
                    >
                        <Icon name="chat_bubble" />
                    </button>
                    <p className="text-xl text-dark-grey">{total_comments}</p>

                </div>

                <div className="flex gap-6 items-center">

                    {
                        username == author_username ?
                        <Link to={`/editor/${blog_id}`} className="text-dark-grey hover:text-brand transition-colors flex items-center gap-1.5 text-sm font-medium">
                            <Icon name="edit" className="text-xl" />
                            Edit
                        </Link> : ""
                    }

                    <button 
                        onClick={handleShare}
                        className="text-dark-grey hover:text-brand transition-colors flex items-center gap-1.5 text-sm font-medium"
                    >
                        <Icon name="link" className="text-xl" />
                        Share
                    </button>

                    <Link to={`https://x.com/intent/tweet?text=Read${title}&url=${location.href}`} aria-label="Share on X" className="text-dark-grey hover:text-black transition-colors">
                        <svg role="img" viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                        </svg>
                    </Link>
                </div>
            </div>

            <hr className="border-border my-2" />
        </>
    )
}

export default BlogInteraction;
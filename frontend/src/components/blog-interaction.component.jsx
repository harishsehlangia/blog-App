import { useContext, useEffect } from "react";
import { BlogContext } from "../pages/blog.page";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
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
                console.log(err);
            })
        }

    }, [])

    const handleLike = () => {
        if(access_token){
            // like the blog
            setLikedByUser(preVal => !preVal);

            !isLikedByUser ? total_likes++ : total_likes--;

            setBlog({ ...blog, activity: { ...activity, total_likes } })

            api.post("/like-blog", { _id, isLikedByUser })
            .then(({ data }) => {
                console.log(data);
            })
            .catch(err => {
                console.log(err);
            })

        }
        else{
            // user is not logged in and trying to like the blog
            toast.error("Please login to like this blog");
        }
    }

    return (
        <>
            <Toaster />
            <hr className="border-grey my-2" />

            <div className="flex gap-6 justify-between">
                <div className="flex gap-3 items-center">

                    <button 
                        onClick={handleLike}
                        className={"w-10 h-10 rounded-full flex items-center justify-center " + ( isLikedByUser ? "bg-red/20 text-red" : "bg-grey/80" )}
                    >
                        <Icon name="favorite" filled={isLikedByUser} />
                    </button>
                    <p className="text-xl text-dark-grey">{total_likes}</p>


                    <button 
                        onClick={() => setCommentsWrapper(preVal => !preVal)}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80"
                    >
                        <Icon name="chat_bubble" />
                    </button>
                    <p className="text-xl text-dark-grey">{total_comments}</p>

                </div>

                <div className="flex gap-6 items-center">

                    {
                        username == author_username ?
                        <Link to={`/editor/${blog_id}`} className="underline hover:text-purple">Edit</Link> : ""
                    }

                    <Link to={`https://x.com/intent/tweet?text=Read${title}&url=${location.href}`} aria-label="Share on X">
                        <svg role="img" viewBox="0 0 24 24" className="w-5 h-5 fill-current text-dark-grey hover:text-black" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                        </svg>
                    </Link>
                </div>
            </div>

            <hr className="border-grey my-2" />
        </>
    )
}

export default BlogInteraction;
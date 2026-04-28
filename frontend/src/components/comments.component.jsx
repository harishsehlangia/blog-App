import { useContext } from "react";
import { BlogContext } from "../pages/blog.page";
import CommentField from "./comment-field.component";
import api from "../common/api";
import Icon from "./Icon";
import NoDataMessage from "./nodata.component";
import AnimationWrapper from "../common/page-animation";
import CommentCard from "./comment-card.component";

export const fetchComments = async ({ skip=0, blog_id, setParentCommentCountFun, comment_array = null }) => {

    let res;

    await api.post("/get-blog-comments", { blog_id, skip })
    .then(({ data }) => {

        data.map(comment => {
            comment.childrenLevel = 0;
        })

        setParentCommentCountFun(preVal => preVal + data.length)

        if(comment_array == null){
            res = { results: data }
        } 
        else{
            res = { results: [ ...comment_array, ...data ] }
        }

    })

    return res;

}

const CommentsContainer = () => {

    let { blog, blog: { _id, title, comments: { results: commentsArr }, activity: { total_parent_comments } }, commentsWrapper, setCommentsWrapper, totalParentCommentsLoaded, setTotalParentCommentsLoaded, setBlog } = useContext(BlogContext);

    const loadMoreComments = async () => {

        let newCommentsArr = await fetchComments({ skip: totalParentCommentsLoaded, blog_id: _id, setParentCommentCountFun: setTotalParentCommentsLoaded, comment_array: commentsArr })

        setBlog({ ...blog, comments: newCommentsArr })

    }

    return(
        <>
            {/* Backdrop overlay */}
            <div 
                className={"fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 " + (commentsWrapper ? "opacity-100" : "opacity-0 pointer-events-none")}
                onClick={() => setCommentsWrapper(false)}
            />

            <div className={"max-sm:w-full fixed " + ( commentsWrapper ? "top-0 sm:right-0" : "top-[100%] sm:right-[-100%]" ) + " duration-500 ease-out max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-xl p-8 px-16 overflow-y-auto overflow-x-hidden"}>
                
                <div className="relative">
                    <h1 className="text-xl font-semibold">Comments</h1>
                    <p className="text-sm mt-1 w-[70%] text-dark-grey line-clamp-1">{title}</p>

                    <button 
                        onClick={() => setCommentsWrapper(preVal => !preVal)}
                        className="absolute top-0 right-0 flex justify-center items-center w-10 h-10 rounded-full bg-grey hover:bg-grey/80 transition-colors"
                    >
                        <Icon name="close" className="text-xl" />
                    </button>
                </div>

                <hr className="border-border my-8 w-[120%] -ml-10" />

                <CommentField action="Comment" />

                {
                    commentsArr && commentsArr.length ? 
                    commentsArr.map((comment, i) => {
                        return <AnimationWrapper key={i}>
                            <CommentCard index={i} leftVal={comment.childrenLevel*4} commentData={comment} />
                        </AnimationWrapper>
                    }) : <NoDataMessage message="No Comments" />
                }

                {
                    total_parent_comments > totalParentCommentsLoaded ? 
                    <button 
                        onClick={loadMoreComments}
                        className="text-brand font-medium p-2 px-4 hover:bg-brand/5 rounded-full flex items-center gap-2 mt-4 text-sm border border-brand/20 hover:border-brand/40 transition-all"
                    >
                        Load More
                    </button>
                    : ""
                }

            </div>
        </>
    )
}

export default CommentsContainer;
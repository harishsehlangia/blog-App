import api from "../common/api";
import usePageTitle from "../common/usePageTitle";
import { createContext, useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { getDay } from "../common/date";
import BlogInteraction from "../components/blog-interaction.component";
import BlogPostCard from "../components/blog-post.component";
import BlogContent from "../components/blog-content.component";
import CommentsContainer, { fetchComments } from "../components/comments.component";


export const blogStructure = {
    title: '',
    des: '',
    content: [],
    author: { personal_info: { } },
    banner: '',
    publishedAt: ''
}

export const BlogContext = createContext({  })

const BlogPage = () => {

    let { blog_id } = useParams()

    const [ blog, setBlog ] = useState(blogStructure);
    const [ similarBlogs, setSimilarBlogs ] = useState(null);
    const [ loading, setLoading ] = useState(true);
    const [ isLikedByUser, setLikedByUser ] = useState(false);
    const [ commentsWrapper, setCommentsWrapper ] = useState(false);
    const [ totalParentCommentsLoaded, setTotalParentCommentsLoaded ] = useState(0);
    const [ readingProgress, setReadingProgress ] = useState(0);

    let { title, content, banner, author: { personal_info: { fullname, username: author_username, profile_img } }, publishedAt } = blog;

    usePageTitle(title || 'Blog');

    // Reading progress bar
    const handleScroll = useCallback(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
            setReadingProgress((scrollTop / docHeight) * 100);
        }
    }, []);

    useEffect(() => {
        if (!loading) {
            window.addEventListener('scroll', handleScroll, { passive: true });
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [loading, handleScroll]);

    const fetchBlog = () => {
        api.post("/get-blog", { blog_id })
        .then(async ({ data: { blog } }) => {
            
            blog.comments = await fetchComments({ blog_id: blog._id, setParentCommentCountFun: setTotalParentCommentsLoaded })

            setBlog(blog);

            api.post("/search-blogs", { tag: blog.tags[0], limit: 6, eliminate_blog: blog_id })
            .then(({ data }) => {
                setSimilarBlogs(data.blogs);

            })

            setLoading(false);
        })
        .catch(err => {
            setLoading(false);
        })
    }

    useEffect(() => {

        resetStates();

        fetchBlog();

    }, [blog_id])

    const resetStates = () => {
        setBlog(blogStructure);
        setSimilarBlogs(null);
        setLoading(true);
        setLikedByUser(false);
        setCommentsWrapper(false);
        setTotalParentCommentsLoaded(0);
        setReadingProgress(0);
    }

    return (
        <AnimationWrapper>
            {
                loading ? <Loader />
                :
                <BlogContext.Provider value={{ blog, setBlog, isLikedByUser, setLikedByUser, commentsWrapper, setCommentsWrapper, totalParentCommentsLoaded, setTotalParentCommentsLoaded }}>

                    {/* Reading Progress Bar */}
                    <div 
                        className="reading-progress" 
                        style={{ width: `${readingProgress}%` }}
                    />

                    <CommentsContainer />
                    
                    <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">

                        <img src={banner} className="aspect-video rounded-radius-lg" alt={title} />

                        <div className="mt-12">
                            <h2>{title}</h2>

                            <div className="flex max-sm:flex-col justify-between my-8">
                                <div className="flex gap-5 items-start">
                                    <img src={profile_img} className="w-12 h-12 rounded-full border-2 border-border" alt={fullname}/>

                                    <p className="capitalize">
                                        {fullname}
                                        <br />
                                        <Link to={`/user/${author_username}`} className="text-dark-grey text-sm hover:text-brand transition-colors">@{author_username}</Link>
                                    </p>

                                </div>
                                <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5 text-sm">Published on {getDay(publishedAt)}</p>
                            </div>
                        </div>

                        <BlogInteraction />
                        
                        <div className="my-12 font-merriweather blog-page-content" style={{ lineHeight: '1.9' }}>
                            {
                                (content?.[0]?.blocks || content?.blocks || []).map((block, i) => {
                                    return <div key={i} className="my-4 md:my-8">
                                        <BlogContent block={block} />
                                    </div>
                                })
                            }
                        </div>

                        <BlogInteraction />

                        {
                            similarBlogs != null && similarBlogs.length ?
                                <>
                                    <h1 className="text-2xl mt-14 mb-10 font-semibold flex items-center gap-2">
                                        Similar Blogs
                                    </h1>

                                    {
                                        similarBlogs.map((blog, i) => {

                                            let { author: { personal_info } } = blog;

                                            return <AnimationWrapper key={i} transition={{duration: 0.4, delay: i*0.05}}>
                                                <BlogPostCard content={blog} author={personal_info} />
                                            </AnimationWrapper>

                                        })
                                    }
                                </>
                            : ""
                        }
                        
                    </div>
                </BlogContext.Provider>
            }
        </AnimationWrapper>
    )
}

export default BlogPage;
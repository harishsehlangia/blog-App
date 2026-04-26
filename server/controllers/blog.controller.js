import Blog from '../Schema/Blog.js';
import User from '../Schema/User.js';
import Notification from '../Schema/Notification.js';
import Comment from '../Schema/Comment.js';
import { nanoid } from 'nanoid';
import { escapeRegex } from '../utils/helpers.js';
import { deleteMultipleFromS3 } from '../config/s3.js';

// Latest Blogs
export const latestBlogs = (req, res) => {

    let { page } = req.body;

    let maxLimit = 5;

    Blog.find({ draft: false })
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({ "publishedAt": -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .limit(maxLimit)
    .skip((page - 1) * maxLimit)
    .then(blogs => {
        return res.status(200).json({ blogs })
    })
    .catch(err => {
        return res.status(500).json({ error: err.message })
    })

};

// All latest blogs count
export const allLatestBlogsCount = (req, res) => {

    Blog.countDocuments({ draft: false })
    .then(count => {
        return res.status(200).json({ totalDocs: count })
    })
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({ error: err.message })
    })

};

// Trending blogs
export const trendingBlogs = (req, res) => {

    Blog.find({ draft: false })
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({ "activity.total_read": -1, "activity.total_likes": -1, "publishedAt": -1 })
    .select("blog_id title publishedAt -_id")
    .limit(5)
    .then(blogs => {
        return res.status(200).json({ blogs })
    })
    .catch(err => {
        return res.status(500).json({ error: err.message })
    })

};

// Search blogs
export const searchBlogs = (req, res) => {

    let { tag, query, author, page, limit, eliminate_blog } = req.body;

    let findQuery;

    if(tag){
        findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
    }else if(query){
        findQuery = { draft: false, title: new RegExp(escapeRegex(query), 'i') }
    }else if(author){
        findQuery = { author, draft: false }
    }

    let maxLimit = limit ? limit : 2;

    Blog.find(findQuery)
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({ "publishedAt": -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then(blogs => {
        return res.status(200).json({ blogs })
    })
    .catch(err => {
        return res.status(500).json({ error: err.message })
    })

};

// Search blogs count
export const searchBlogsCount = (req, res) => {

    let { tag, author, query } = req.body;

    let findQuery;

    if(tag){
        findQuery = { tags: tag, draft: false };
    }else if(query){
        findQuery = { draft: false, title: new RegExp(escapeRegex(query), 'i') }
    }else if(author){
        findQuery = { author, draft: false }
    }

    Blog.countDocuments(findQuery)
    .then(count => {
        return res.status(200).json({ totalDocs: count })
    })
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({ error: err.message })
    })

};

// Create blog
export const createBlog = (req, res) => {

    let authorId = req.user;

    let { title, banner, content, des, tags, draft, id } = req.body;
    
    if(!title.length){
        return res.status(403).json({ error: "You must provide a title" });
    }

    if(!draft){
        
        if(!des.length || des.length > 200){
            return res.status(403).json({ error: "You must provide blog description under 200 characters" });
        }
    
        if(!banner.length){
            return res.status(403).json({ error: "You must provide blog banner to publish it" });
        }
    
        if(!content.blocks.length){
            return res.status(403).json({ error: "There must be some blog content to publish it" });
        }
    
        if(!tags.length || tags.length > 10){
            return res.status(403).json({ error: "Provide tags to publish the blog, maximum 10" });
        }
    }


    tags = tags.map(tag => tag.toLowerCase());

    let blog_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();

    if(id){

        Blog.findOneAndUpdate({ blog_id }, { title, des, banner, content, tags, draft: draft ? draft : false })
        .then(blog => {
            return res.status(200).json({ id: blog_id });
        })
        .catch(err => {
            return res.status(500).json({ error: err.message });
        })

    } else{
        
        let blog = new Blog({
            title, des, banner, content, tags, author: authorId, blog_id: blog_id, draft: Boolean(draft)
        })

        blog.save().then(blog => {

        let incrementVal = draft ? 0 : 1;

        User.findOneAndUpdate({ _id: authorId }, { $inc : { "account_info.total_posts" : incrementVal }, $push : { "blogs": blog._id } })
        .then(user => {
            return res.status(200).json({ id: blog.blog_id })
        })
        .catch(err => {
            return res.status(500).json({ error: "Failed to update total posts number" })
        })

        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })

    }

};

// Get blog
export const getBlog = (req, res) => {

    let { blog_id, draft, mode } = req.body;

    let incrementVal = mode != 'edit' ? 1 : 0;

    Blog.findOneAndUpdate({ blog_id }, { $inc : { "activity.total_reads": incrementVal } })
    .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
    .select("title des content banner activity publishedAt blog_id tags")
    .then(blog => {

        User.findOneAndUpdate({ "personal_info.username": blog.author.personal_info.username },
            {$inc : { "account_info.total_reads": incrementVal }
        })
        .catch(err => {
            return res.status(500).json({ error: err.message });
        })

        if(blog.draft && !draft){
            return res.status(500).json({ error: 'you can not access draft blogs' })
        }

        return res.status(200).json({ blog });
    })
    .catch(err => {
        return res.status(500).json({ error: err.message });
    })

};

// Like blog
export const likeBlog = (req, res) => {

    let user_id = req.user;

    let { _id, isLikedByUser } = req.body;

    let incrementVal = !isLikedByUser ? 1 : -1;

    Blog.findOneAndUpdate({ _id }, { $inc: { "activity.total_likes": incrementVal } })
    .then(blog => {

        if(!isLikedByUser){
            let like = new Notification({
                type: "like",
                blog: _id,
                notification_for: blog.author,
                user: user_id
            })

            like.save().then(notification => {
                return res.status(200).json({ liked_by_user: true })
            })
        }
        else{

            Notification.findOneAndDelete({ user: user_id, blog: _id, type: "like" })
            .then(data => {
                return res.status(200).json({ liked_by_user: false });
            })
            .catch(err => {
                return res.status(500).json({ error: err.message });
            })

        }

    })

};

// Is liked by user
export const isLikedByUser = (req, res) => {

    let user_id = req.user;

    let { _id } = req.body;

    Notification.exists({ user: user_id, type: "like", blog: _id })
    .then(result => {
        return res.status(200).json({ result });
    })
    .catch(err => {
        return res.status(500).json({ error: err.message });
    })

};

// User written blogs
export const userWrittenBlogs = (req, res) => {

    let user_id = req.user;

    let { page, draft, query, deletedDocCount } = req.body;

    let maxLimit = 5;
    let skipDocs = (page - 1) * maxLimit;

    if(deletedDocCount){
        skipDocs -= deletedDocCount;
    }

    Blog.find({ author: user_id, draft, title: new RegExp(escapeRegex(query), 'i') })
    .skip(skipDocs)
    .limit(maxLimit)
    .sort({publishedAt: -1})
    .select(" title banner publishedAt blog_id activity des draft -_id ")
    .then(blogs => {
        return res.status(200).json({ blogs });
    })
    .catch(err => {
        return res.status(500).json({ error: err.message });
    })
    
};

// User written blogs count
export const userWrittenBlogsCount = (req, res) => {

    let user_id = req.user;
    let { draft, query } = req.body;

    Blog.countDocuments({ author: user_id, draft, title: new RegExp(escapeRegex(query), 'i') })
    .then(count => {
        return res.status(200).json({ totalDocs: count });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({ err: err.message });
    })

};

// Delete blog
export const deleteBlog = (req, res) => {

    let user_id = req.user;
    let { blog_id } = req.body;

    Blog.findOneAndDelete({ blog_id, author: user_id })
    .then(blog => {

        if(!blog) {
            return res.status(403).json({ error: "You do not have permission to delete this blog" });
        }

        // Collect all S3 image URLs from the blog
        const imageUrls = [];

        // 1. Banner image
        if (blog.banner && blog.banner.includes('amazonaws.com')) {
            imageUrls.push(blog.banner);
        }

        // 2. Inline images from EditorJS content blocks
        if (blog.content) {
            const blocks = Array.isArray(blog.content)
                ? blog.content[0]?.blocks || []
                : blog.content?.blocks || [];

            blocks.forEach(block => {
                if (block.type === 'image' && block.data?.file?.url) {
                    const url = block.data.file.url;
                    if (url.includes('amazonaws.com')) {
                        imageUrls.push(url);
                    }
                }
            });
        }

        // 3. Fire-and-forget S3 cleanup (non-blocking)
        if (imageUrls.length > 0) {
            deleteMultipleFromS3(imageUrls)
                .catch(err => console.error('S3 cleanup failed:', err.message));
        }

        Notification.deleteMany({ blog: blog._id }).then(data => console.log("notification deleted"));

        Comment.deleteMany({ blog_id: blog._id }).then(data => console.log("comments deleted"));

        User.findOneAndUpdate({ _id: user_id }, { $pull: { blog: blog._id }, $inc: { "account_info.total_posts": -1 } })
        .then(user => console.log("Blog deleted"));

        return res.status(200).json({ status: "done" });

    })
    .catch(err => {
        return res.status(500).json({ error: err.message });
    })

};

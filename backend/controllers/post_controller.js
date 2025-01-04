import User from '../models/user.js';
import Post from '../models/post.js';
import Notification from '../models/notification.js';
export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!text && !img) {
            return res.status(400).json({ message: "Text or image is required" });
        }

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }
        const newPost = new Post({
            user: userId,
            text,
            img,
        });

        await newPost.save();

        res.status(201).json({ message: "Post created successfully" });
    } catch (error) {
        console.log("Error in createPost: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deletePost = async (req, res) => {
    const { id } = req.params;

    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "You can't delete this post" });
        }

        if (post.img) {
            const postImageId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(postImageId);
        }
        await Post.findByIdAndDelete(id);
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.log("Error in deletePost: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id.toString();

        if (!text) {
            return res.status(400).json({ message: "Text is required" });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = {
            user: userId,
            text
        };
        post.comments.push(comment);
        await post.save();
        res.status(201).json({ message: "Comment added successfully" });
    } catch (error) {
        console.log("Error in commentOnPost: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id: postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost) {
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
            return res.status(200).json({ message: "Post unliked successfully" });
        } else {
            post.likes.push(userId);
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
            await post.save();

            // Validate 'to' field before creating notification
            if (post.user.toString() !== userId.toString()) {
                const notification = new Notification({
                    type: "like",
                    from: userId,
                    to: post.user,
                });
                await notification.save();
            }

            return res.status(200).json({ message: "Post liked successfully" });
        }
    } catch (error) {
        console.error("Error in likeUnlikePost:", error.stack);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password",
        }).populate({
            path: "comments.user",
            select: "-password",
        });
        if (posts.length === 0) {
            return res.status(404).json({ message: "No posts found" });
        }

        res.status(200).json({ posts });
    } catch (error) {
        console.error("Error in getAllPosts:", error.stack);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getLikedPosts = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } }).populate({
            path: "user",
            select: "-password",
        }).populate({
            path: "comments.user",
            select: "-password",
        });

        if (likedPosts.length === 0) {
            return res.status(404).json({ message: "No liked posts found" });
        }

        res.status(200).json({ likedPosts });
    } catch (error) {
        console.error("Error in getLikedPosts:", error.stack);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const feedPosts = await Post.find({ user: { $in: user.following } })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });

        if (feedPosts.length === 0) {
            return res.status(404).json({ message: "No following posts found" });
        }

        res.status(200).json({ feedPosts });
    } catch (error) {
        console.error("Error in getFollowingPosts:", error.stack);
        res.status(500).json({ message: "Internal server error" });
    }
};

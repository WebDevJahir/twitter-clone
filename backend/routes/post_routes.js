import express from 'express';

import { protectRoute } from '../middleware/protectRoute.js';

import { getAllPosts, createPost, deletePost, commentOnPost, likeUnlikePost, getLikedPosts, getFollowingPosts } from '../controllers/post_controller.js';

const router = express.Router();
router.get("/all", protectRoute, getAllPosts);
router.get("/following/user/posts", protectRoute, getFollowingPosts);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.post("/create", protectRoute, createPost);
router.get("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.delete("/:id", protectRoute, deletePost);

export default router;
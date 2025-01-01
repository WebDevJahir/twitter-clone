import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { getUserProfile, followUnfollowUser, getSuggestedUsers } from '../controllers/user_controller.js';

const router = express.Router();
console.log("User routes");
router.get("/profile/:username", protectRoute, getUserProfile);
router.get('/suggested', protectRoute, getSuggestedUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);

export default router;
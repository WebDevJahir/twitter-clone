import express from 'express';

import { protectRoute } from '../middleware/protectRoute.js';   // Import the protectRoute middleware
import { getNotifications, deleteNotifications, deleteNotification } from '../controllers/notification_controller.js';   // Import the getNotifications and deleteNotification controllers


const router = express.Router();

router.get("/", protectRoute, getNotifications);   // Add the protectRoute middleware to the getNotifications route
router.delete("/delete", protectRoute, deleteNotifications);   // Add the protectRoute middleware to the deleteNotification route
router.delete("delete/:id", protectRoute, deleteNotification);   // Add the protectRoute middleware to the deleteNotification route

export default router;
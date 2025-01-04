import Notification from "../models/notification.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const notifications = await Notification.find({ to: userId }).populate({
            path: "from",
            select: "username profileImg",
        }).sort({ createdAt: -1 });

        await Notification.updateMany({ to: userId }, { read: true });
        res.status(200).json({ notifications });
    } catch (error) {
        console.error("Error in getNotifications:", error.stack);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteNotifications = async (req, res) => {
    try {
        const { id } = req.user._id;
        await Notification.deleteMany({ to: userId });

        res.status(200).json({ message: "Notifications deleted successfully" });
    } catch (error) {
        console.error("Error in deleteNotification:", error.stack);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findById(id);
        const userId = req.user._id;
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        if (notification.to.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this notification" });
        }

        await notification.delete();
        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        console.error("Error in deleteNotification:", error.stack);
        res.status(500).json({ message: "Internal server error" });
    }
};
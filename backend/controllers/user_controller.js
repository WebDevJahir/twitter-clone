import Notification from '../models/notification.js';
import User from '../models/user.js';

export const getUserProfile = async (req, res) => {
    const username = req.params.username;
    try {
        const user = await User.findOne({ username }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getUserProfile: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const followUnfollowUser = async (req, res) => {
    console.log("Follow/Unfollow user");
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if (id === req.user._id.toString()) {
            return res.status(400).json({ message: "You can't follow/unfollow yourself" });
        }

        if (!userToModify || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const isFollowing = currentUser.following.includes(id);

        if (!isFollowing) {
            await User.findByIdAndUpdate(id, {
                $push: { followers: req.userId }
            });

            await User.findByIdAndUpdate(req.user._id, {
                $push: { following: id }
            });

            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id,
            });

            await newNotification.save();

            res.status(200).json({ message: "User followed successfully" });
        } else {
            await User.findByIdAndUpdate(id, {
                $pull: { followers: req.user._id }
            });
            await User.findByIdAndUpdate(req.user._id, {
                $pull: { following: id }
            });

            await Notification.deleteOne({
                type: "follow",
                from: req.user._id,
                to: userToModify._id,
            });


            res.status(200).json({ message: "User unfollowed successfully" });
        }
    } catch (error) {
        console.log("Error in followUnfollowUser: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        const usreFollowedByMe = await User.findById(userId).select("following");

        const users = await user.aggregate([
            {
                $match: {
                    _id: { $ne: userId }
                },
            },
            {
                $sample: { size: 10 }
            },
        ]);

        const fiteredUsers = users.filter(user => !usreFollowedByMe.following.includes(user._id));
        const suggestedUsers = fiteredUsers.slice(0, 4);
        suggestedUsers.forEach(user => {
            user.password = nullW;
        });
        res.status(200).json(suggestedUsers);

    } catch (error) {
        console.log("Error in getSuggestedUsers: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
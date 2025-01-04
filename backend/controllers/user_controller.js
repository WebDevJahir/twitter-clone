import Notification from '../models/notification.js';
import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';

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
        console.log(req.user);
        const userId = req.user._id;

        // Get the list of users followed by the current user
        const userFollowedByMe = await User.findById(userId).select("following");

        if (!userFollowedByMe) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find suggested users
        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }, // Exclude the current user
                },
            },
            {
                $sample: { size: 10 }, // Randomize and limit the result
            },
        ]);

        // Filter out users already followed by the current user
        const filteredUsers = users.filter(
            (user) => !userFollowedByMe.following.includes(user._id.toString())
        );

        // Limit to 4 suggested users
        const suggestedUsers = filteredUsers.slice(0, 4);

        // Exclude sensitive fields
        const sanitizedUsers = suggestedUsers.map(({ _id, name, email }) => ({
            _id,
            name,
            email,
        }));

        res.status(200).json(sanitizedUsers);
    } catch (error) {
        console.error("Error in getSuggestedUsers: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateUser = async (req, res) => {
    let { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
    let { profileImg, coverImg } = req.body;

    try {
        let user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Password update logic
        if (currentPassword || newPassword) {
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ message: "Please provide both current and new passwords" });
            }

            const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ message: "Password must be at least 6 characters long" });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Profile image update logic
        if (profileImg) {
            if (user.profileImg) {
                await cloudinary.uploader.destroy(
                    user.profileImg.split("/").pop().split(".")[0]
                );
            }
            const uploadedProfileImgRes = await cloudinary.uploader.upload(profileImg);
            user.profileImg = uploadedProfileImgRes.secure_url;
        }

        // Cover image update logic
        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(
                    user.coverImg.split("/").pop().split(".")[0]
                );
            }
            const uploadedCoverImgRes = await cloudinary.uploader.upload(coverImg);
            user.coverImg = uploadedCoverImgRes.secure_url;
        }

        // Update other fields
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;

        // Save updated user
        await user.save();

        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        console.log("Error in updateUser: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

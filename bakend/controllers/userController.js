import User from "../models/userModel.js";
import bcrypt from 'bcryptjs'
import {v2 as cloudinary} from 'cloudinary'
import Notification from "../models/notificationModel.js";

export const getUserProfile = async (req, res) => {
         const {username} = req.body
    try {
        const user = await User.findOne({username}).select("-password")

        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);

    } catch (error) {
        console.log("Error in getUserProfile: ", error.message);
		res.status(500).json({ error: error.message });
    }
}

export const getSuggestedUsers = async (req, res) => {
   try {
    const userId = req.user._id
    const userFollowedByMe = await User.findById(userId).select("following")

    const users = await User.aggregate([
        {
            $match : { id : { $ne: userId}}
        },
        {$sample : { size :10 }}
    ])

    const filteredUsers = users.filter((user) => !userFollowedByMe.following.includes(user._id))
    const  suggestedUsers = filteredUsers.slice(0, 4)

    suggestedUsers.forEach((user) => (user.password = null))

    res.status(200).json(suggestedUsers);
   } catch (error) {
    console.log("Error in getSuggestedUsers: ", error.message);
		res.status(500).json({ error: error.message });
   }
}
export const followUnfollowUsers = async (req, res) => {
    try {

        const { id } = req.params;

        const userToModify = await User.findById(id)

        const currentUser = await User.findById(req.user._id)

        if(id === req.user._id.toString()) {
            return res.status(400).json({ error: "You can't follow/unfollow yourself" });
        }

        if(!userToModify || !currentUser) {
            return res.status(400).json({ error: "User not found" });
        }

        const isfollowing = currentUser.following.includes(id)

        if(isfollowing) {

            await User.findByIdAndUpdate(id, { $pull : { followers: req.user._id } })

            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

            res.status(200).json({ message: "User unfollowed successfully" });

        } else {
            {
                await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });

                await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

                const newNotification = new Notification({
                    type: "follow",          // Type of notification: "follow".
                    from: req.user._id,      // Who is following (current user ID).
                    to: userToModify._id,    // Who is being followed (target user ID).
                });

                await newNotification.save();

                res.status(200).json({ message: "User followed successfully" });
            }
        }
    } catch (error) {
        console.log("Error in followUnfollowUser: ", error.message);
		res.status(500).json({ error: error.message });
}
}


export const updateUser = async (req, res) => {
    const { fullName, username, email, bio, link, newPassword, currentPassword } = req.body;
    let { profileImg, coverImg } = req.body;
    const userId = req.user._id;

    try {
        // Find the user by ID
        let user = await User.findById(userId);
        if (!user) return res.status(400).json({ message: "User not found" });

        // Check if password change request is valid
        if (!currentPassword && newPassword || !newPassword && currentPassword) {
            return res.status(400).json({ message: "Password mismatch, try again" });
        }

        // Verify current password and update new password
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) return res.status(404).json({ message: "Password does not match" });
            if (newPassword.length < 6) {
                return res.status(400).json({ message: "Password length must be at least 6 characters" });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Handle profile image upload
        if (profileImg) {
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split(".")[0]);
            }
            const uploadResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadResponse.secure_url;
        }

        // Handle cover image upload
        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split('/').pop().split(".")[0]);
            }
            const uploadResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadResponse.secure_url;
        }

        // Update user details
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.coverImg = coverImg || user.coverImg;
        user.profileImg = profileImg || user.profileImg;
        user.bio = bio || user.bio;
        user.link = link || user.link;

        // Save the updated user
        user = await user.save();

        // Remove password from response
        user.password = null;

        // Return the updated user data
        return res.status(200).json(user);
    } catch (error) {
        console.log("Error in updateUser: ", error.message);
        res.status(500).json({ error: error.message });
    }
};

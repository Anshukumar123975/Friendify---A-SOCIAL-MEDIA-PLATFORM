import mongoose from "mongoose"; // Import mongoose
import { User } from "../models/user.models.js"; 
import { friends } from "../models/friends.models.js";

export const sendRequestSent = async (req, res) => {
    const { requestTo } = req.body; // Extract the target user ID from the request body
    const requestFrom = req.user._id; // The ID of the authenticated user making the request
    const avatar = req.user.avatar;

    console.log(avatar);
    console.log(requestTo); // Debugging log for requestTo
    console.log(requestFrom); // Debugging log for requestFrom

    try {
        // Prevent sending a friend request to oneself
        if (requestFrom.toString() === requestTo.toString()) {
            return res.status(400).json({ message: "You can't add yourself as a friend." });
        }

        // Validate if both IDs are valid ObjectId
        if (!mongoose.isValidObjectId(requestFrom) || !mongoose.isValidObjectId(requestTo)) {
            return res.status(400).json({ message: "Invalid user ID format provided." });
        }

        // Check if a friend request already exists in either direction
        const existingRequest = await friends.findOne({
            $or: [
                { requestFrom: requestFrom, requestTo: requestTo },
                { requestFrom: requestTo, requestTo: requestFrom },
            ],
        });

        if (existingRequest) {
            return res.status(400).json({ message: "A friend request is already sent or received." });
        }

        // Create a new friend request
        const newFriendRequest = new friends({
            requestFrom,
            requestTo,
            avatar,
            status: 0, // Pending status
        });

        await newFriendRequest.save(); // Save the friend request to the database

        return res.status(200).json({ newFriendRequest, message: "Friend request sent successfully." });
    } catch (error) {
        console.error("Error sending friend request:", error);
        res.status(500).json({ message: "An internal server error occurred." });
    }
};

export const showRequest = async (req, res) => {
    const userId = req.user._id; // Authenticated user's ID

    try {
        // Validate if the ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID format." });
        }

        // Find all pending friend requests for the user
        const pendingRequests = await friends.find({
            requestTo: userId,
            status: 0, // Pending status
        }).populate('requestFrom', 'username avatar'); // Populate sender details (e.g., name, email)
        console.log(pendingRequests);
        // If no requests are found, return a message
        if (!pendingRequests || pendingRequests.length === 0) {
            return res.status(200).json({ message: "No pending friend requests." });
        }

        // Return the list of pending friend requests
        res.status(200).json({ pendingRequests });
    } catch (error) {
        console.error("Error fetching pending friend requests:", error);
        res.status(500).json({ message: "An internal server error occurred." });
    }
};

export const acceptRequest = async(req,res) => {
    const { requestId } = req.body; // Extract the friend request ID from the request body

    try {
        // Validate the provided request ID
        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({ message: "Invalid request ID format." });
        }

        // Update the status of the friend request to '1' (Accepted)
        const acceptedRequest = await friends.findByIdAndUpdate(
            requestId,               // The ID of the document to update
            { status: 1 },           // Set the status to '1' (Accepted)
            { new: true }            // Return the updated document
        );

        if (!acceptedRequest) {
            return res.status(404).json({ message: "Friend request not found." });
        }

        // Respond with a success message and the updated document
        res.status(200).json({
            message: "Friend request accepted successfully.",
            acceptedRequest,
        });
    } catch (error) {
        console.error("Error accepting friend request:", error);
        res.status(500).json({ message: "An internal server error occurred." });
    }
}

export const allFriends = async(req,res) => {
    try {
        // Extract userId from the request (e.g., from req.user or req.query)
        const userId = req.user?.id || req.query.userId;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        // Fetch friends where the user is either the requestTo or requestFrom with status 1
        const acceptedFriends = await friends
            .find({
                status: 1,
                $or: [
                    { requestTo: userId },
                    { requestFrom: userId }
                ]
            })
            .populate("requestTo", "username avatar")
            .populate("requestFrom", "username avatar");

        res.status(200).json({ success: true, data: acceptedFriends });
    } catch (error) {
        console.error("Error fetching accepted friends:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
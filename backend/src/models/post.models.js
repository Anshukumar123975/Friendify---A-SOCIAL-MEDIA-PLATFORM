import mongoose from "mongoose"
const postSchema = new mongoose.Schema({
    username: {
        type: String,
        default: " ",
    },
    avatar: {
        type: String,
        default: "image.jpg"
    },
    content: {
        type: String,
        required: true,
    },
    media: {
        type: String,
    },
    like: {
        type: Number,
        default: 0,
    },
    comment: {
        type: [String],
        default: [],
    },
    likedBy: { 
        type: [mongoose.Schema.Types.ObjectId],  // Array of user IDs who have liked the post
        default: []
    },
    timestamp: { type: Date, default: Date.now },
},{timestamps: true }
)

export const Post = mongoose.model("Post",postSchema); 
import { Post } from "../models/post.models.js";  // Adjust the path to your Post model
import { User } from "../models/user.models.js";  // Adjust the path to your User model
import multer from "multer";
import path from "path"
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const JWT_SECRET = "anshu";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
export const createPostController = async (req, res) => {
  const {content, userid} = req.body;  // Destructure username along with content
  const media = req.file?.path;

  // Validate input
  if (!content) {
    return res.status(400).json({ message: "Username and content are required" });
  }

  try {
    // Ensure the user exists in the database before creating a post
    const user = await User.findById(userid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let mediaUrl = null;
        if (req.file) {
            const localFilePath = req.file.path;
            const uploadResponse = await uploadOnCloudinary(localFilePath);

            if (uploadResponse) {
                mediaUrl = uploadResponse.url; // Use the uploaded file's Cloudinary URL
            }
        }
        console.log(userid)
    // Create a new post
    const newPost = new Post({
      username: user.username,
      avatar:user.avatar,
      content,
      media: mediaUrl,
    });

    // Save the post to the database
    await newPost.save();

    // Respond with the created post
    res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getAllPostsController = async (req, res) => {
  try {
    // Fetch all posts from the database
    const posts = await Post.find().sort({ timestamp: -1 });

    if (posts.length === 0) {
      return res.status(404).json({ message: "No posts found" });
    }

    // Return the posts
    res.status(200).json({
      message: "Posts fetched successfully",
      posts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Like a post
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params; // Get post ID from URL
    const post = await Post.findById(postId); // Find the post

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Increment like count
    post.like += 1;
    await post.save();

    res.status(200).json({ message: "Post liked successfully", post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to like post", error: error.message });
  }
};

// Comment on a post
export const commentOnPost = async (req, res) => {
  try {
    const { postId } = req.params; // Get post ID from URL
    const { comment } = req.body; // Get the comment from the body
    const post = await Post.findById(postId); // Find the post

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Add the new comment to the post's comment array
    post.comment.push(comment);
    await post.save();

    res.status(200).json({ message: "Comment added successfully", post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to comment on post", error: error.message });
  }
};

// Controller to handle like functionality
export const Like = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);

    // Check if the user has already liked the post
    if (post.likedBy.includes(req.body.userId)) {
      // If already liked, unlike it (remove userId from likedBy array)
      post.likedBy = post.likedBy.filter(userId => userId !== req.body.userId);
      post.like -= 1; // Decrease the like count
    } else {
      // If not liked yet, add userId to likedBy array
      post.likedBy.push(req.body.userId);
      post.like += 1; // Increase the like count
    }

    // Save the updated post
    await post.save();

    res.status(200).json({ message: "Post like toggled successfully", post });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Failed to like the post" });
  }
};


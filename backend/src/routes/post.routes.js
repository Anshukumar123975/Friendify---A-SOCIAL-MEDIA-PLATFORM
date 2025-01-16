import express from "express";
import { createPostController,
    getAllPostsController, likePost, commentOnPost, Like } from "../controllers/post.controllers.js"; // Adjust the path to your controllers
import {upload} from "../middlewares/multer.middlewares.js";

const router = express.Router();

router.post("/create", upload.single("media"), createPostController);
router.get('/',getAllPostsController);
// Like a post
router.put("/:postId/like", Like);

// Comment on a post
router.put("/:postId/comment", commentOnPost);
// Toggle like/unlike
// Like post
  
  
export default router;

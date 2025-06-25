import express from "express";
import {
  createPost,
  getAllPosts,
  deletePost,
} from "../controllers/post.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import { likePost, unlikePost } from "../controllers/post.controller.js";

const router = express.Router();

// 🔐 Create a new post
router.post("/", verifyJWT, createPost);

// 🧾 Get all posts (public or protected as needed)
router.get("/", getAllPosts);

// Like a post
router.post("/:postId/like", verifyJWT, likePost);

// Unlike a post
router.post("/:postId/unlike", verifyJWT, unlikePost);

// 🗑️ Delete a post (only author)
router.delete("/:postId", verifyJWT, deletePost);

export default router;

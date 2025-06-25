import express from "express";
import { addComment, getCommentsForPost } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// POST /api/v1/comments/:postId → add comment to post
router.post("/:postId", verifyJWT, addComment);

// GET /api/v1/comments/:postId → get all comments for post
router.get("/:postId", getCommentsForPost);

export default router;

import express from "express";
import { addComment, 
        getCommentsForPost,
        deleteComment,
        updateComment
     } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// POST /api/v1/comments/:postId → add comment to post
router.post("/:postId", verifyJWT, addComment);

// GET /api/v1/comments/:postId → get all comments for post
router.get("/:postId", getCommentsForPost);


//delte comment
router.delete("/:commentId", verifyJWT, deleteComment);

//edit comment
router.put("/:commentId", verifyJWT, updateComment);


export default router;

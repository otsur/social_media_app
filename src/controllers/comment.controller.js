import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// ========== ADD COMMENT ==========
export const addComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  if (!text) {
    throw new ApiError(400, "Comment text is required");
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const comment = await Comment.create({
    text,
    post: postId,
    author: req.user._id,
  });

  post.comments.push(comment._id);
  await post.save();

  return res.status(201).json(new ApiResponse(201, comment, "Comment added"));
});

// ========== GET COMMENTS FOR POST ==========
export const getCommentsForPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const comments = await Comment.find({ post: postId })
    .populate("author", "username profilePic")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, comments));
});

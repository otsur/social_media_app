import Post from "../models/post.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Comment from "../models/comment.model.js";

// ========== CREATE POST ==========
export const createPost = asyncHandler(async (req, res) => {
  const { caption, mediaUrl, mediaType } = req.body;

  if (!mediaUrl || !mediaType) {
    throw new ApiError(400, "mediaUrl and mediaType are required");
  }

  const post = await Post.create({
    caption,
    mediaUrl,
    mediaType,
    author: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, post, "Post created successfully"));
});

// ========== GET ALL POSTS ==========
export const getAllPosts = asyncHandler(async (req, res) => {
  
  const limit = parseInt(req.query.limit) || 5;
  const skip = parseInt(req.query.skip) || 0;
  
  const posts = await Post.find()
    .populate("author", "username email profilePic")
    .populate({
      path: "comments",
      populate: { path: "author", select: "username profilePic"},
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(200).json(new ApiResponse(200, posts));
});


// ========== LIKE A POST ==========
export const likePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const userId = req.user._id.toString();
  if (post.likes.includes(userId)) {
    return res.status(400).json(new ApiResponse(400, null, "Post already liked"));
  }

  post.likes.push(userId);
  await post.save();

  return res.status(200).json(new ApiResponse(200, post, "Post liked"));
});

// ========== UNLIKE A POST ==========
export const unlikePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const userId = req.user._id.toString();
  if (!post.likes.includes(userId)) {
    return res.status(400).json(new ApiResponse(400, null, "Post not liked yet"));
  }

  post.likes = post.likes.filter(id => id.toString() !== userId);
  await post.save();

  return res.status(200).json(new ApiResponse(200, post, "Post unliked"));
});


// ========== DELETE POST ==========
export const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // Only the owner can delete
  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this post");
  }

  await Post.findByIdAndDelete(postId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Post deleted successfully"));
});

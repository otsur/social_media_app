import User from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

import {v2 as cloudinary} from "cloudinary";

export const getCurrentUser = asyncHandler(async(req, res) => {
   const user = await User.findById(req.user._id).select("-password"); // Optional: Exclude password
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res.status(200).json(
    new ApiResponse(200, user, "User details fetched successfully")
  );
});



// GET USER BY ID
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(new ApiResponse(200, user, "User fetched"));
});


// ========== FOLLOW A USER ==========
export const followUser = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const targetUserId = req.params.id;

  if (currentUserId.toString() === targetUserId) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const currentUser = await User.findById(currentUserId);
  const targetUser = await User.findById(targetUserId);

  if (!targetUser) {
    throw new ApiError(404, "User to follow not found");
  }

  if (currentUser.following.includes(targetUserId)) {
    throw new ApiError(400, "You are already following this user");
  }

  currentUser.following.push(targetUserId);
  targetUser.followers.push(currentUserId);

  await currentUser.save();
  await targetUser.save();

  res.status(200).json(new ApiResponse(200, null, "User followed"));
});

// ========== UNFOLLOW A USER ==========
export const unfollowUser = asyncHandler(async (req, res) => {

  // delete later-------------------------------

  console.log("UNFOLLOW HIT:", req.user._id, "→", req.params.id);

  // delete later-------------------------
  const currentUserId = req.user._id;
  const targetUserId = req.params.id;

  const currentUser = await User.findById(currentUserId);
  const targetUser = await User.findById(targetUserId);

  if (!targetUser) {
    throw new ApiError(404, "User to unfollow not found");
  }

  currentUser.following = currentUser.following.filter(
    (id) => id.toString() !== targetUserId
  );

  targetUser.followers = targetUser.followers.filter(
    (id) => id.toString() !== currentUserId.toString()
  );

  await currentUser.save();
  await targetUser.save();

  res.status(200).json(new ApiResponse(200, null, "User unfollowed"));
});



// ========== UPDATE USER PROFILE ==========
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { username, email, bio } = req.body;
  let profilePic;

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "profilePics",
    });
    profilePic = result.secure_url;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      username,
      email,
      bio,
      ...(profilePic && { profilePic }), // update only if profilePic exists
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated"));
});

// //update profile
// export const updateProfile = asyncHandler(async (req, res) => {
//   const userId = req.user._id;
//   const { username, bio, profilePic } = req.body;

//   const user = await User.findById(userId);
//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   if (username) user.username = username;
//   if (bio !== undefined) user.bio = bio;
//   if (profilePic) user.profilePic = profilePic;

//   await user.save();

//   return res.status(200).json(new ApiResponse(200, user, "Profile updated successfully"));
// });


//update profile picture
export const uploadProfilePicture = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "profilePics",
  });

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { profilePic: result.secure_url },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile picture updated"));
});


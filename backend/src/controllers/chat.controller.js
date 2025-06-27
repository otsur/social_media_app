import Chat from "../models/chat.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import User from "../models/User.model.js";

// Get or create one-on-one chat
export const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(400, "UserId param not sent");
  }

  let chat = await Chat.findOne({
    isGroupChat: false,
    $and: [
      { members: { $elemMatch: { $eq: req.user._id } } },
      { members: { $elemMatch: { $eq: userId } } },
    ],
  }).populate("members", "-password");

  if (!chat) {
    chat = await Chat.create({
      members: [req.user._id, userId],
    });
    await chat.populate("members", "-password");
  }

  return res.status(200).json(new ApiResponse(200, chat, "Chat accessed"));
});

// Get all chats for logged-in user
export const fetchChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ members: { $elemMatch: { $eq: req.user._id } }, })
    .populate("members", "-password")
    .populate({
      path: "latestMessage",
      populate: {
        path: "sender",
        select: "username profilePic",
      },
    })
    .sort({ updatedAt: -1 });

  return res.status(200).json(new ApiResponse(200, chats));
});

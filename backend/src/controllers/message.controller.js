import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

// Send message
export const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    throw new ApiError(400, "Missing content or chatId");
  }

  const newMessage = await Message.create({
    sender: req.user._id,
    content,
    chat: chatId,
  });

  const populatedMessage = await newMessage.populate("sender", "username profilePic");
  await populatedMessage.populate("chat");
  await Chat.findByIdAndUpdate(chatId, { latestMessage: populatedMessage });

  return res.status(201).json(new ApiResponse(201, populatedMessage, "Message sent"));
});

// Get all messages in a chat
export const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const messages = await Message.find({ chat: chatId })
    .populate("sender", "username profilePic")
    .populate("chat");

  return res.status(200).json(new ApiResponse(200, messages, "Messages fetched"));
});

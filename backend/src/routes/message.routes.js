import express from "express";
import { getMessages, sendMessage } from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, sendMessage);
router.get("/:chatId", verifyJWT, getMessages);

export default router;

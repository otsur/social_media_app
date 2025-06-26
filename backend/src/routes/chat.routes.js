import express from "express";
import { accessChat, fetchChats } from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, accessChat);
router.get("/", verifyJWT, fetchChats);

export default router;

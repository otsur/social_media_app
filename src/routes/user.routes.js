import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getCurrentUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", verifyJWT, getCurrentUser);

export default router;

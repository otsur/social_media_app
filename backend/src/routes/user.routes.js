import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getCurrentUser,
         followUser,
         unfollowUser,
         getUserById,
         updateProfile,
         uploadProfilePicture,
 } from "../controllers/user.controller.js";

import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/me", verifyJWT, getCurrentUser);

router.post("/:id/follow", verifyJWT, followUser);

router.post("/:id/unfollow", verifyJWT, unfollowUser);

router.get("/:id", getUserById);

router.put("/update", verifyJWT, updateProfile);

router.post("/upload-profile-pic", verifyJWT, upload.single("file"), uploadProfilePicture);

export default router;

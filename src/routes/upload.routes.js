import express from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// POST /api/v1/upload
router.post("/", verifyJWT, upload.single("file"), (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({
      success: false,
      message: "File upload failed",
    });
  }

  return res.status(200).json({
    success: true,
    message: "File uploaded successfully",
    url: req.file.path,
  });
});

export default router;

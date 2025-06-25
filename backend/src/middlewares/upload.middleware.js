import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isImage = file.mimetype.startsWith("image");
    const isVideo = file.mimetype.startsWith("video");

    return {
      folder: "social_media_uploads",
      resource_type: isVideo ? "video" : "image",
      format: isImage ? "jpg" : "mp4", // default format fallback
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

// Initialize multer with Cloudinary storage
const upload = multer({ storage });

export { upload };

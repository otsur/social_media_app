import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import authRoutes from "./routes/auth.routes.js"

import userRoutes from "./routes/user.routes.js";

import postRoutes from "./routes/post.routes.js";

import commentRoutes from "./routes/comment.routes.js";

import uploadRoutes from "./routes/upload.routes.js";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true,limit: "16kb"}))
app.use(express.static("public"))

app.use(cookieParser())

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/upload", uploadRoutes);

export { app }
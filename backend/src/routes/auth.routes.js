import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";

const router = express.Router();

console.log("REGISTER:", typeof registerUser); 
console.log("LOGIN:", typeof loginUser); 

router.post("/register", registerUser);

router.post("/login", loginUser);

export default router;

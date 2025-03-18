import express from "express";
import { createPost } from "../controllers/book.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, createPost);

export default router;

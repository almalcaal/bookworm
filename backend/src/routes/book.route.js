import express from "express";
import { createPost, getPosts } from "../controllers/book.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, createPost);
router.get("/", protectRoute, getPosts);

export default router;

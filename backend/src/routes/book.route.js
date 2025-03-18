import express from "express";
import {
  createPost,
  getPosts,
  getCurrentUserPosts,
  deletePost,
} from "../controllers/book.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, createPost);
router.get("/", protectRoute, getPosts);
router.get("/users", protectRoute, getCurrentUserPosts);
router.delete("/:postId", protectRoute, deletePost);

export default router;

import cloudinary from "../lib/cloudinary.js";
import Book from "../models/book.model.js";

// @desc            Create a new post
// @route           POST /api/books
// @access          Private
export const createPost = async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;

    if (!image || !title || !caption || !rating) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    const newBook = new Book({
      title,
      caption,
      rating,
      image: imageUrl,
      user: req.user._id,
    });

    res.status(201).json({ newBook });
  } catch (err) {
    console.log(`ERROR in createPost controller`, err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc            Get posts
// @route           GET /api/books
// @access          Private
export const getPosts = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1) * limit;

    // newest to oldest posts
    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    if (books.length === 0) {
      return res.status(200).json([]);
    }

    const totalBooks = await Book.countDocuments();

    res.status(200).json({
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (err) {
    console.log("ERROR in getPosts controller", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc            Get current user posts
// @route           GET /api/books/users
// @access          Private
export const getCurrentUserPosts = async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(books);
  } catch (err) {
    console.log("ERROR in getCurrentUserPosts controller", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc            Delete post by id
// @route           DELETE /api/books/:postId
// @access          Private
export const deletePost = async (req, res) => {
  try {
    const book = await Book.findById(req.params.postId);
    if (!book) return res.status(404).json({ message: "Post not found" });

    // check if user owns the post
    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // delete image from cloudinary
    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryErr) {
        console.log("ERROR deleting image from cloudinary", cloudinaryErr);
      }
    }

    await book.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.log("ERROR in deletePost controller", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

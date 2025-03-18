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

    res.status(201).json({ data: newBook });
  } catch (err) {
    console.log(`ERROR in createPost controller`, err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

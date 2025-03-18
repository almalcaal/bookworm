import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";

// @desc            Register a new user
// @route           POST /api/auth/register
// @access          Public
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Full name, email and password are required inputs" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    if (username.length < 3) {
      return res
        .status(400)
        .json({ message: "Username must be at least 3 characters" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already in use" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const randomImage = `https://api.dicebear.com/9.x/thumbs/svg?seed=${username}`;

    const user = await User.create({
      username,
      email,
      password,
      profileImage: randomImage,
    });

    if (user) {
      await user.save();

      //   token will be used to authenticate user giving them permission to CRUD book posts. so client will be using the token and the server will check who owns the token
      const token = generateToken(user._id);
      res.status(201).json({
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          profilePic: user.profilePic,
        },
      });
    }
  } catch (err) {
    console.log(`ERROR in registerUser controller`, err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc            Authenticate user / get token
// @route           POST /api/auth/login
// @access          Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const correctPassword = await user.comparePassword(password);
    if (!correctPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    console.log("Error in loginUser controller", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};





const express = require("express");
const router = express.Router();

const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// ==========================================
// REGISTER ROUTE
// ==========================================

router.post(
  "/register",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required"),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
  ],

  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array()
        });
      }

      const { name, password } = req.body;
      const email = req.body.email?.trim().toLowerCase();

      // Check existing user
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(409).json({
          message: "User already exists"
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = new User({
        name,
        email,
        password: hashedPassword
      });

      await user.save();

      return res.status(201).json({
        message: "User registered successfully"
      });

    } catch (err) {
      console.error("Registration error:", err);

      if (err.code === 11000) {
        return res.status(409).json({
          message: "Email already registered"
        });
      }

      return res.status(500).json({
        message: "Registration failed",
        error: err.message
      });
    }
  }
);

// ==========================================
// LOGIN ROUTE
// ==========================================

router.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required"),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
  ],

  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array()
        });
      }

      const email = req.body.email?.trim().toLowerCase();
      const { password } = req.body;

      // Check JWT secret
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is missing");

        return res.status(500).json({
          message: "Server authentication configuration error"
        });
      }

      // Find user
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({
          message: "User not found"
        });
      }

      // Compare password
      const isMatch = await bcrypt.compare(
        password,
        user.password
      );

      if (!isMatch) {
        return res.status(400).json({
          message: "Invalid password"
        });
      }

      // Generate JWT
      const token = jwt.sign(
        {
          user: {
            id: user._id.toString()
          }
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d"
        }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });

    } catch (err) {
      console.error("Login error:", err);

      return res.status(500).json({
        message: "Login failed",
        error: err.message
      });
    }
  }
);

// ==========================================
// PROFILE ROUTE
// ==========================================

router.get(
  "/profile",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
        .select("-password");

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      return res.status(200).json({
        message: "Profile fetched successfully",
        user
      });

    } catch (err) {
      console.error("Profile error:", err);

      return res.status(500).json({
        message: "Unable to fetch profile",
        error: err.message
      });
    }
  }
);

// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;

const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { protect } = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();

// Generate access token (short-lived)
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Generate refresh token (long-lived)
const generateRefreshToken = () => {
  return uuidv4();
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new patient account
 *     tags: [Auth]
 */
router.post("/register", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const refreshToken = generateRefreshToken();
    const user = await User.create({ username, password, refreshToken });

    if (user) {
      logger.info(`[AUTH] New user registered: ${username}`);
      res.status(201).json({
        _id: user._id,
        username: user.username,
        token: generateAccessToken(user._id),
        refreshToken: user.refreshToken,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to access dashboard
 *     tags: [Auth]
 */
router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (user && (await user.matchPassword(password))) {
      // Rotate refresh token on login
      user.refreshToken = generateRefreshToken();
      await user.save();

      logger.info(`[AUTH] User logged in: ${username}`);
      res.json({
        _id: user._id,
        username: user.username,
        token: generateAccessToken(user._id),
        refreshToken: user.refreshToken,
      });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Auth]
 */
router.post("/refresh", async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  try {
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Rotate refresh token
    user.refreshToken = generateRefreshToken();
    await user.save();

    logger.info(`[AUTH] Token refreshed for: ${user.username}`);
    res.json({
      token: generateAccessToken(user._id),
      refreshToken: user.refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user info
 *     tags: [Auth]
 */
router.get("/me", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user).select("-password -refreshToken").lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

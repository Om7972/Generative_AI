const express = require("express");
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const HealthProfile = require("../models/HealthProfile");
const bcrypt = require("bcryptjs");

const router = express.Router();

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get current user profile + health profile
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Profile data
 */
router.get("/", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    let healthProfile = await HealthProfile.findOne({ user: req.user }).lean();
    if (!healthProfile) {
      healthProfile = await HealthProfile.create({ user: req.user });
      healthProfile = healthProfile.toObject();
    }

    res.json({ user, healthProfile });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/profile/user:
 *   put:
 *     summary: Update user account details
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Updated user
 */
router.put("/user", protect, async (req, res, next) => {
  try {
    const { displayName, email, avatar, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (displayName !== undefined) user.displayName = displayName;
    if (email !== undefined) user.email = email;
    if (avatar !== undefined) user.avatar = avatar;

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to set a new password" });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      user.password = newPassword; // pre-save hook will hash it
    }

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/profile/health:
 *   put:
 *     summary: Update health profile demographics and medical context
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Updated health profile
 */
router.put("/health", protect, async (req, res, next) => {
  try {
    const { age, weight, gender, conditions, allergies } = req.body;

    let healthProfile = await HealthProfile.findOne({ user: req.user });
    if (!healthProfile) {
      healthProfile = new HealthProfile({ user: req.user });
    }

    if (age !== undefined) healthProfile.age = age;
    if (weight !== undefined) healthProfile.weight = weight;
    if (gender !== undefined) healthProfile.gender = gender;
    if (conditions !== undefined) healthProfile.conditions = conditions;
    if (allergies !== undefined) healthProfile.allergies = allergies;

    await healthProfile.save();
    res.json(healthProfile);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

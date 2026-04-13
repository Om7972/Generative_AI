const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    email: { type: String, default: "", trim: true },
    displayName: { type: String, default: "" },
    avatar: { type: String, default: "" },
    refreshToken: { type: String, default: null },
    notificationPrefs: {
      emailReminders: { type: Boolean, default: false },
      browserNotifications: { type: Boolean, default: true },
      dailySummary: { type: Boolean, default: true },
    },
    streakCount: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastAdherenceDate: { type: String, default: null }, // YYYY-MM-DD
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

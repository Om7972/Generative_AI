const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.id;
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

const admin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (user && (user.isAdmin || user.email === "odhumkeakr@gmail.com")) {
      return next();
    }
    return res.status(403).json({ message: "Not authorized as an admin" });
  } catch (error) {
    return res.status(403).json({ message: "Not authorized, admin verification failed" });
  }
};

module.exports = { protect, admin };

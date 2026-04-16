 require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const logger = require("./utils/logger");
const swaggerSpec = require("./docs/swagger");
const errorHandler = require("./middleware/error");
const { initCronJobs } = require("./services/cronService");

const authRoutes = require("./routes/auth");
const medicationRoutes = require("./routes/medications");
const aiRoutes = require("./routes/ai");
const reminderRoutes = require("./routes/reminders");
const profileRoutes = require("./routes/profile");
const aiCoachRoutes = require("./routes/aiCoachRoutes");

const app = express();

// ── CORS (must be BEFORE other middleware) ──
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : true,   // allow any origin in dev
  credentials: true
}));

// ── Body parser ──
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Security ──
app.use(helmet({
  contentSecurityPolicy: false, // disable for dev / Swagger UI
}));

// Rate Limiting — separate limits for AI-heavy endpoints
const generalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 500,
  message: { message: "Too many requests from this IP, please try again later." }
});
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: { message: "AI rate limit reached. Please wait a few minutes." }
});

const coachLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50, // 50 requests per minute for chat
  message: { message: "Coach is a bit busy. Please wait a moment." }
});

app.use("/api", generalLimiter);
app.use("/api/ai/coach", coachLimiter);
app.use("/api/ai", aiLimiter);

// Note: express-mongo-sanitize, xss-clean, hpp all removed
// They crash on modern Node.js (read-only req.query getter)
// Mongoose schema validation provides sufficient protection

// ── Logging ──
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

// ── Swagger ──
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/ai/coach", aiCoachRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    version: "2.0.0",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ── Error Handler ──
app.use(errorHandler);

// ── Database ──
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info("Connected securely to MongoDB");
    // Initialize cron jobs after DB connection
    initCronJobs();
  })
  .catch((err) => logger.error(`MongoDB Connect Failure: ${err.message}`));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  logger.info(`API Docs: http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  mongoose.connection.close().then(() => process.exit(0));
});

module.exports = app; // Export for Vercel serverless

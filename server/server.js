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

const authRoutes = require("./routes/auth");
const medicationRoutes = require("./routes/medications");
const aiRoutes = require("./routes/ai");
const reminderRoutes = require("./routes/reminders");
const profileRoutes = require("./routes/profile");

const app = express();

// ── CORS (must be BEFORE other middleware) ──
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : true,   // allow any origin in dev
  credentials: true
}));

// ── Body parser ──
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Security ──
app.use(helmet({
  contentSecurityPolicy: false, // disable for dev / Swagger UI
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 200,
  message: { message: "Too many requests from this IP, please try again later." }
});
app.use("/api", limiter);

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

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

// ── Error Handler ──
app.use(errorHandler);

// ── Database ──
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected securely to MongoDB"))
  .catch((err) => logger.error(`MongoDB Connect Failure: ${err.message}`));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

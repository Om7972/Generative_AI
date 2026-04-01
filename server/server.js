require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const logger = require("./utils/logger");
const swaggerSpec = require("./docs/swagger");
const errorHandler = require("./middleware/error");

const authRoutes = require("./routes/auth");
const medicationRoutes = require("./routes/medications");
const aiRoutes = require("./routes/ai");
const reminderRoutes = require("./routes/reminders");

const app = express();

// Security Middleware (Helmet.js)
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again later."
});
app.use("/api", limiter);

// Prevent XSS attacks
app.use(xss());

// Prevent HTTP param pollution
app.use(hpp());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// CORS execution pipeline
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json());

// Request logging via Morgan + Winston
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) }}));
}

// Swagger API Documentation Endpoint
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount Routers
app.use("/api/auth", authRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reminders", reminderRoutes);

// Custom Error Handling Middleware
app.use(errorHandler);

// Establish Database Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected securely to MongoDB Cluster"))
  .catch((err) => logger.error(`MongoDB Connect Failure: ${err.message}`));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server successfully deployed in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

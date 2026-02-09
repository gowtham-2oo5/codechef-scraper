require('dotenv').config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger/config.json");

const app = express();
const PORT = process.env.PORT || 8800;

/** ============================
 * Middleware
 ============================ **/
app.use(cors());
app.use(express.json());

/** ============================
 * API Routes
 ============================ **/
app.use("/api/whole", require("./routes/all"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/ratings", require("./routes/ratings"));
app.use("/api/recent", require("./routes/recent"));
app.use("/api/upcoming", require("./routes/upcoming"));

/** ============================
 * Swagger Documentation
 ============================ **/
app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/** ============================
 * Health Check Endpoint
 ============================ **/
app.get("/health", (_, res) => res.send("OK"));

/** ============================
 * Error Handling Middleware
 ============================ **/
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "production" ? "Something went wrong" : err.message
  });
});

/** ============================
 * 404 Not Found Handler
 ============================ **/
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Not Found",
    message: "The requested endpoint does not exist"
  });
});

/** ============================
 * Start Server & Graceful Shutdown
 ============================ **/
const server = app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);

const gracefulShutdown = (signal) => {
  console.log(`${signal} signal received: closing HTTP server`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

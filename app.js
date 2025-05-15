const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger/config.json");
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
 * Debug Chrome Cache & Puppeteer
 ============================ **/
app.get('/debug/chrome', (req, res) => {
  try {
    const cacheDir = process.env.PUPPETEER_CACHE_DIR || '/opt/render/.cache/puppeteer';
    const results = {
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        PUPPETEER_CACHE_DIR: process.env.PUPPETEER_CACHE_DIR,
        PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH,
        PUPPETEER_DOWNLOAD_BASE_URL: process.env.PUPPETEER_DOWNLOAD_BASE_URL,
        PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD
      },
      cacheDirExists: fs.existsSync(cacheDir),
      cacheDirContents: []
    };

    if (results.cacheDirExists) {
      try {
        const chromeFiles = execSync(`find ${cacheDir} -type f -name "chrome" | xargs ls -la`, { encoding: 'utf8' });
        results.chromeExecutables = chromeFiles.trim().split('\n');
      } catch (e) {
        results.findError = e.message;
      }

      try {
        const cacheContents = execSync(`find ${cacheDir} -type f | head -10`, { encoding: 'utf8' });
        results.cacheDirContents = cacheContents.trim().split('\n');
      } catch (e) {
        results.cacheDirError = e.message;
      }
    }

    try {
      const installOutput = execSync('npx puppeteer browsers install chrome@136.0.7103.92', { encoding: 'utf8' });
      results.installAttempt = installOutput;
    } catch (e) {
      results.installError = e.message;
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error in debug endpoint", message: err.message });
  }
});

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

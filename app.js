const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger/config.json");

const app = express();
const PORT = process.env.PORT || 8800;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/whole", require("./routes/all"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/ratings", require("./routes/ratings"));
app.use("/api/recent", require("./routes/recent"));

// Swagger Docs
app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health
app.get("/health", (_, res) => res.send("OK"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "production" ? "Something went wrong" : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Not Found",
    message: "The requested endpoint does not exist"
  });
});

const server = app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Add this route to your app.js
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
    
    // Check if cache directory exists and what's in it
    if (results.cacheDirExists) {
      try {
        const findResult = execSync(`find ${cacheDir} -type f -name "chrome" | xargs ls -la`, 
                                   { encoding: 'utf8' });
        results.chromeExecutables = findResult.trim().split('\n');
      } catch (e) {
        results.findError = e.message;
      }
      
      try {
        // Check for any files in the cache directory
        const findAnyResult = execSync(`find ${cacheDir} -type f | head -10`, 
                                      { encoding: 'utf8' });
        results.cacheDirContents = findAnyResult.trim().split('\n');
      } catch (e) {
        results.cacheDirError = e.message;
      }
    }
    
    // Try to install Chrome from the debug endpoint
    try {
      results.installAttempt = execSync('npx puppeteer browsers install chrome@136.0.7103.92', 
                                      { encoding: 'utf8' });
    } catch (e) {
      results.installError = e.message;
    }
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ 
      error: "Error in debug endpoint", 
      message: err.message 
    });
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

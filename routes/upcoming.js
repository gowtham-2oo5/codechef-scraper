const express = require("express");
const router = express.Router();
const fetchUpcoming = require("../scrapers/fetchUpcoming");

router.get("/", async (req, res) => {
  console.log("Fetching upcoming contests, routes/upcoming.js");
  try {
    const result = await fetchUpcoming();
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "An unexpected error occurred while processing your request",
      status: 500
    });
  }
});

module.exports = router; 
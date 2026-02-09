const express = require("express");
const cache = require("../utils/cache");
const fetchUpcoming = require("../scrapers/fetchUpcoming");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const cacheKey = "upcoming:contests";
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    const data = await fetchUpcoming();
    
    if (data.success) {
      await cache.set(cacheKey, data, 1800); // Cache for 30 minutes
    }
    
    res.json(data);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: err.message
    });
  }
});

module.exports = router;

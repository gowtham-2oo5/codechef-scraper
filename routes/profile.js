const express = require("express");
const cache = require("../utils/cache");
const fetchProfile = require("../scrapers/fetchProfile");

const router = express.Router();

router.get("/:handle", async (req, res) => {
  const { handle } = req.params;

  if (!handle) {
    return res.status(400).json({
      success: false,
      error: "Invalid Input",
      message: "Username is required",
    });
  }

  try {
    const cacheKey = `profile:${handle}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    const data = await fetchProfile(handle);
    
    if (data.success) {
      await cache.set(cacheKey, data);
    }
    
    res.status(data.status || 200).json(data);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: err.message,
    });
  }
});

module.exports = router;

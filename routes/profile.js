const express = require("express");
const router = express.Router();
const fetchProfile = require("../scrapers/fetchProfile");

router.get("/:handle", async (req, res) => {
  try {
    const { handle } = req.params;
    const result = await fetchProfile(handle);
    res.status(result.status || (result.success ? 200 : 500)).json(result);
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

const express = require("express");
const router = express.Router();
const fetchRatings = require("../scrapers/fetchRatings");

router.get("/:handle", async (req, res) => {
  const { handle } = req.params;
  const result = await fetchRatings(handle);
  res.status(result.success ? 200 : 500).json(result);
});

module.exports = router;

const express = require("express");
const router = express.Router();
const fetchProfile = require("../scrapers/fetchProfile");

router.get("/:handle", async (req, res) => {
  const { handle } = req.params;
  const result = await fetchProfile(handle);
  res.status(result.success ? 200 : 500).json(result);
});

module.exports = router;

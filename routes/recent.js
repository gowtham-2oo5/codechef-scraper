const express = require("express");
const router = express.Router();
const fetchRecent = require("../scrapers/fetchRecent");

router.get("/:handle", async (req, res) => {
  const { handle } = req.params;
  const result = await fetchRecent(handle);
  res.status(result.success ? 200 : 500).json(result);
});

module.exports = router;

const express = require("express");
const router = express.Router();
const fetchAll = require("../scrapers/fetchAll");

router.get("/:handle", async (req, res) => {
  const { handle } = req.params;
  const result = await fetchAll(handle);
  res.status(result.success ? 200 : 500).json(result);
});

module.exports = router;

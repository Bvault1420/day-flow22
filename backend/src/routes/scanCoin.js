const express = require("express");
const { analyzeCoin } = require("../services/coinAnalyzer");
const { calculateCoinScore } = require("../services/riskEngine");

const router = express.Router();

router.post("/scan-coin", async (req, res) => {
  try {
    const { coin } = req.body;

    if (!coin || typeof coin !== "string" || !coin.trim()) {
      return res.status(400).json({ error: "coin symbol, name, or contract address is required" });
    }

    const analysis = await analyzeCoin(coin);
    const result = calculateCoinScore(analysis);

    return res.json(result);
  } catch (error) {
    console.error("Coin scan error:", error.message);
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;

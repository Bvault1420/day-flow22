const express = require("express");
const { analyzeWallet } = require("../services/walletAnalyzer");
const { calculateScore } = require("../services/riskEngine");

const router = express.Router();

router.post("/scan-wallet", async (req, res) => {
  try {
    const { wallet } = req.body;

    if (!wallet || typeof wallet !== "string" || !wallet.trim()) {
      return res.status(400).json({ error: "wallet address is required" });
    }

    const analysis = await analyzeWallet(wallet);
    const result = calculateScore(analysis);

    return res.json(result);
  } catch (error) {
    console.error("Scan error:", error.message);
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;

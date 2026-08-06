const express = require("express");
const { analyzeWallet } = require("../services/walletAnalyzer");
const { calculateScore } = require("../services/riskEngine");

const router = express.Router();

router.post("/scan-wallet", async (req, res) => {
  try {
    const { wallet } = req.body;

    if (!wallet || typeof wallet !== "string" || !wallet.trim()) {
      return res.status(400).json({ error: "wallet address or ENS name is required" });
    }

    const analysis = await analyzeWallet(wallet);
    const result = calculateScore(analysis);

    if (analysis.resolvedName) {
      result.details.resolvedName = analysis.resolvedName;
      result.details.inputQuery = wallet.trim();
    }

    return res.json(result);
  } catch (error) {
    console.error("Scan error:", error.message);
    const status = error.message.includes("could not be resolved") ? 400 : 500;
    return res.status(status).json({
      error: error.message || "Wallet scan failed. Please try again.",
    });
  }
});

module.exports = router;

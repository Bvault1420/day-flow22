const express = require("express");
const { analyzeCoin } = require("../services/coinAnalyzer");
const { calculateCoinScore, calculateScore } = require("../services/riskEngine");
const { analyzeWallet } = require("../services/walletAnalyzer");

const router = express.Router();

router.get("/coin/:query", async (req, res) => {
  try {
    const query = req.params.query;
    if (!query) return res.status(400).json({ error: "query required" });

    const analysis = await analyzeCoin(query);
    const result = calculateCoinScore(analysis);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.get("/wallet/:address", async (req, res) => {
  try {
    const address = req.params.address;
    if (!address) return res.status(400).json({ error: "address required" });

    const analysis = await analyzeWallet(address);
    const result = calculateScore(analysis);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;

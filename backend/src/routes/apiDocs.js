const express = require("express");

const router = express.Router();

router.get("/docs", (_req, res) => {
  res.json({
    name: "Wallet Reputation Score API",
    version: "1.2.0",
    description: "REST API für Wallet- und Coin-Risikoanalyse",
    baseUrl: "http://localhost:3001",
    endpoints: [
      {
        method: "GET",
        path: "/api/health",
        description: "Health check",
      },
      {
        method: "GET",
        path: "/api/docs",
        description: "Diese API-Dokumentation",
      },
      {
        method: "POST",
        path: "/api/scan-wallet",
        body: { wallet: "0x... oder vitalik.eth" },
        description: "Wallet Reputation Scan",
      },
      {
        method: "POST",
        path: "/api/scan-coin",
        body: { coin: "BTC, ETH, PEPE oder 0x contract" },
        description: "Coin Safety Scan (Multi-Source Pipeline)",
      },
      {
        method: "GET",
        path: "/api/v1/coin/:query",
        description: "Coin Scan via GET (für externe Integration)",
        example: "/api/v1/coin/BTC",
      },
      {
        method: "GET",
        path: "/api/v1/wallet/:address",
        description: "Wallet Scan via GET",
        example: "/api/v1/wallet/vitalik.eth",
      },
    ],
    dataSources: [
      "CoinGecko",
      "DexScreener",
      "CoinCap",
      "DefiLlama",
      "Mobula",
      "CoinMarketCap (optional, COINMARKETCAP_API_KEY)",
      "Ethereum RPC / Blockscout",
      "Blockchain.info / Mempool.space",
      "Solana RPC",
    ],
    envVars: {
      COINMARKETCAP_API_KEY: "Optional — CoinMarketCap Pro API Key",
      PORT: "Backend port (default 3001)",
    },
  });
});

module.exports = router;

const express = require("express");
const cors = require("cors");
const scanWalletRouter = require("./routes/scanWallet");
const scanCoinRouter = require("./routes/scanCoin");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "OPTIONS"],
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "wallet-reputation-api" });
});

app.use("/api", scanWalletRouter);
app.use("/api", scanCoinRouter);

app.listen(PORT, () => {
  console.log(`Wallet Reputation API running on http://localhost:${PORT}`);
});

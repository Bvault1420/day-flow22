const express = require("express");
const cors = require("cors");
const scanWalletRouter = require("./routes/scanWallet");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "wallet-reputation-api" });
});

app.use("/api", scanWalletRouter);

app.listen(PORT, () => {
  console.log(`Wallet Reputation API running on http://localhost:${PORT}`);
});

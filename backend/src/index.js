const express = require("express");
const cors = require("cors");
const scanWalletRouter = require("./routes/scanWallet");
const scanCoinRouter = require("./routes/scanCoin");
const apiDocsRouter = require("./routes/apiDocs");
const v1Router = require("./routes/v1");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "wallet-reputation-api",
    version: "1.2.0",
    pipeline: "multi-source",
  });
});

app.use("/api", apiDocsRouter);
app.use("/api", scanWalletRouter);
app.use("/api", scanCoinRouter);
app.use("/api/v1", v1Router);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Wallet Reputation API running on http://localhost:${PORT}`);
  console.log(`API Docs: http://localhost:${PORT}/api/docs`);
});

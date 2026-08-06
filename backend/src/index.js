const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const config = require("./config");
const { requireApiKey } = require("./middleware/apiKeyAuth");
const { validateWallet, validateCoin } = require("./middleware/validate");
const { createKey } = require("./services/apiKeyStore");
const { analyzeWallet } = require("./services/walletService");
const { analyzeCoin } = require("./services/coinService");

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.corsOrigins, methods: ["GET", "POST", "OPTIONS"] }));
app.use(express.json({ limit: "10kb" }));
app.use(rateLimit({ windowMs: config.rateLimit.windowMs, max: config.rateLimit.max, standardHeaders: true }));

const apiLimiter = rateLimit({ windowMs: config.apiKeyRateLimit.windowMs, max: config.apiKeyRateLimit.max });

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", version: "2.0.0", service: "wallet-reputation-api" });
});

app.get("/api/docs", (_req, res) => {
  res.json({
    version: "2.0.0",
    description: "Wallet Reputation API — für eigene Websites & Apps",
    authentication: "Header X-API-Key: wrs_... oder Authorization: Bearer wrs_...",
    endpoints: [
      { method: "POST", path: "/api/keys", body: { name: "My App", email: "you@mail.com" }, description: "API-Key erstellen (kostenlos)" },
      { method: "GET", path: "/api/v1/wallet/:address", auth: true, example: "/api/v1/wallet/vitalik.eth" },
      { method: "GET", path: "/api/v1/coin/:symbol", auth: true, example: "/api/v1/coin/BTC" },
      { method: "POST", path: "/api/scan-wallet", body: { wallet: "0x..." }, description: "Intern (Website)" },
      { method: "POST", path: "/api/scan-coin", body: { coin: "BTC" }, description: "Intern (Website)" },
    ],
    sources: ["CoinGecko", "DexScreener", "DefiLlama", "Blockchain RPCs"],
  });
});

app.post("/api/keys", apiLimiter, (req, res) => {
  const name = (req.body?.name || "Developer").toString().slice(0, 60);
  const email = (req.body?.email || "dev@local").toString().slice(0, 120);
  const { plainKey, meta } = createKey(name, email);
  res.json({
    message: "API-Key erstellt. Speichere ihn jetzt — er wird nicht erneut angezeigt!",
    apiKey: plainKey,
    meta,
  });
});

app.post("/api/scan-wallet", async (req, res) => {
  const v = validateWallet(req.body?.wallet);
  if (!v.valid) return res.status(400).json({ error: v.error });
  try {
    const result = await analyzeWallet(v.value);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/api/scan-coin", async (req, res) => {
  const v = validateCoin(req.body?.coin);
  if (!v.valid) return res.status(400).json({ error: v.error });
  try {
    const result = await analyzeCoin(v.value);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/v1/wallet/:address", requireApiKey, apiLimiter, async (req, res) => {
  const v = validateWallet(req.params.address);
  if (!v.valid) return res.status(400).json({ error: v.error });
  try {
    const result = await analyzeWallet(v.value);
    res.json({ ...result, apiKeyOwner: req.apiKeyOwner.name });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/v1/coin/:symbol", requireApiKey, apiLimiter, async (req, res) => {
  const v = validateCoin(req.params.symbol);
  if (!v.valid) return res.status(400).json({ error: v.error });
  try {
    const result = await analyzeCoin(v.value);
    res.json({ ...result, apiKeyOwner: req.apiKeyOwner.name });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Interner Serverfehler" });
});

app.listen(config.port, "0.0.0.0", () => {
  console.log(`API http://localhost:${config.port}`);
  console.log(`Docs  http://localhost:${config.port}/api/docs`);
});

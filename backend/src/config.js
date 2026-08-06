module.exports = {
  port: process.env.PORT || 3001,
  backendUrl: process.env.BACKEND_URL || "http://127.0.0.1:3001",
  corsOrigins: process.env.CORS_ORIGINS?.split(",") || [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 200,
  },
  apiKeyRateLimit: {
    windowMs: 60 * 1000,
    max: 30,
  },
  maxInputLength: 120,
};

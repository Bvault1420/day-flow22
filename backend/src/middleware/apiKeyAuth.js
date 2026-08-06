const { validateKey } = require("../services/apiKeyStore");

function requireApiKey(req, res, next) {
  const key =
    req.headers["x-api-key"] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, "");

  if (!key) {
    return res.status(401).json({
      error: "API-Key erforderlich. Header: X-API-Key oder Authorization: Bearer <key>",
    });
  }

  const owner = validateKey(key);
  if (!owner) {
    return res.status(403).json({ error: "Ungültiger oder deaktivierter API-Key" });
  }

  req.apiKeyOwner = owner;
  next();
}

module.exports = { requireApiKey };

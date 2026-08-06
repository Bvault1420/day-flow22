const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const KEYS_PATH = path.join(__dirname, "../data/api-keys.json");

function hashKey(key) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

function readKeys() {
  try {
    if (!fs.existsSync(KEYS_PATH)) return [];
    const raw = fs.readFileSync(KEYS_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeKeys(keys) {
  const dir = path.dirname(KEYS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(KEYS_PATH, JSON.stringify(keys, null, 2));
}

function generateApiKey() {
  return `wrs_${crypto.randomBytes(24).toString("hex")}`;
}

function createKey(name, email) {
  const plainKey = generateApiKey();
  const keys = readKeys();
  const entry = {
    id: crypto.randomUUID(),
    name: name.slice(0, 60),
    email: email.slice(0, 120),
    keyHash: hashKey(plainKey),
    prefix: plainKey.slice(0, 12) + "...",
    createdAt: new Date().toISOString(),
    active: true,
    usageCount: 0,
  };
  keys.push(entry);
  writeKeys(keys);
  return { plainKey, meta: { id: entry.id, name: entry.name, prefix: entry.prefix, createdAt: entry.createdAt } };
}

function validateKey(plainKey) {
  if (!plainKey || typeof plainKey !== "string") return null;
  const hash = hashKey(plainKey.trim());
  const keys = readKeys();
  const entry = keys.find((k) => k.keyHash === hash && k.active);
  if (!entry) return null;

  entry.usageCount = (entry.usageCount || 0) + 1;
  entry.lastUsedAt = new Date().toISOString();
  writeKeys(keys);

  return { id: entry.id, name: entry.name };
}

module.exports = { createKey, validateKey, readKeys };

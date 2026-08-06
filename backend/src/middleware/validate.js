const config = require("../config");

const WALLET_PATTERNS = {
  ethereum: /^0x[a-fA-F0-9]{40}$/,
  bitcoin: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
  ens: /^[a-z0-9-]+(\.[a-z0-9-]+)*\.eth$/i,
  solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
};

function sanitize(input) {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, config.maxInputLength);
}

function validateWallet(input) {
  const s = sanitize(input);
  if (!s) return { valid: false, error: "Wallet-Adresse erforderlich" };
  const lower = s.toLowerCase();
  if (WALLET_PATTERNS.ethereum.test(s)) return { valid: true, value: s };
  if (WALLET_PATTERNS.bitcoin.test(s)) return { valid: true, value: s };
  if (WALLET_PATTERNS.solana.test(s)) return { valid: true, value: s };
  if (WALLET_PATTERNS.ens.test(lower) || /^[a-z0-9-]+$/i.test(s)) return { valid: true, value: s };
  return { valid: false, error: "Ungültiges Wallet-Format" };
}

function validateCoin(input) {
  const s = sanitize(input);
  if (!s) return { valid: false, error: "Coin erforderlich" };
  if (/^0x[a-fA-F0-9]{40}$/.test(s)) return { valid: true, value: s };
  if (/^[a-zA-Z0-9 .-]{1,40}$/.test(s)) return { valid: true, value: s };
  return { valid: false, error: "Ungültiges Coin-Format" };
}

module.exports = { sanitize, validateWallet, validateCoin };

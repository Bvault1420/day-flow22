const SCAM_SYMBOLS = ["SCAM", "RUG", "HONEYPOT"];

function isScamSymbol(s) {
  return SCAM_SYMBOLS.includes((s || "").toUpperCase());
}

module.exports = { isScamSymbol };

/**
 * Dummy list of known scam / rug-pull token contract addresses.
 */
const SCAM_TOKENS = {
  ethereum: [
    "0xbadtoken00000000000000000000000000000001",
    "0xscam0000000000000000000000000000000001",
  ],
  solana: [
    "ScamToken1111111111111111111111111111111",
  ],
};

const SCAM_SYMBOLS = ["SCAM", "RUG", "HONEYPOT", "FAKEUSDT"];

function isScamToken(contractAddress, chain = "ethereum") {
  if (!contractAddress) return false;
  const list = SCAM_TOKENS[chain] || [];
  const normalized =
    chain === "ethereum" ? contractAddress.toLowerCase() : contractAddress;
  return list.some((a) => {
    const cmp = chain === "ethereum" ? a.toLowerCase() : a;
    return cmp === normalized;
  });
}

function isScamSymbol(symbol) {
  if (!symbol) return false;
  return SCAM_SYMBOLS.includes(symbol.toUpperCase());
}

module.exports = { SCAM_TOKENS, isScamToken, isScamSymbol };

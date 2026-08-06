const { analyzeEthereumWallet } = require("./blockchain/ethereum");
const { analyzeBitcoinWallet } = require("./blockchain/bitcoin");
const { analyzeSolanaWallet } = require("./blockchain/solana");

function detectChain(wallet) {
  const trimmed = wallet.trim();

  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    return "ethereum";
  }

  if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(trimmed)) {
    return "bitcoin";
  }

  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) {
    return "solana";
  }

  throw new Error(
    "Unrecognized wallet format. Supported: Ethereum (0x...), Bitcoin (1/3/bc1...), Solana (base58)"
  );
}

async function analyzeWallet(wallet) {
  const chain = detectChain(wallet);

  switch (chain) {
    case "ethereum":
      return analyzeEthereumWallet(wallet.trim());
    case "bitcoin":
      return analyzeBitcoinWallet(wallet.trim());
    case "solana":
      return analyzeSolanaWallet(wallet.trim());
    default:
      throw new Error("Unsupported chain");
  }
}

module.exports = { analyzeWallet, detectChain };

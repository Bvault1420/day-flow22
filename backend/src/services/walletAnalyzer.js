const { analyzeEthereumWallet } = require("./blockchain/ethereum");
const { analyzeBitcoinWallet } = require("./blockchain/bitcoin");
const { analyzeSolanaWallet } = require("./blockchain/solana");
const { resolveWalletInput } = require("./nameResolver");

function detectChain(wallet) {
  const trimmed = wallet.trim();

  if (/^0x[a-fA-F0-9]{40}$/i.test(trimmed)) {
    return "ethereum";
  }

  if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(trimmed)) {
    return "bitcoin";
  }

  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) {
    return "solana";
  }

  return null;
}

async function analyzeWallet(walletInput) {
  const { address, resolvedName } = await resolveWalletInput(walletInput);
  const chain = detectChain(address);

  if (!chain) {
    throw new Error("Could not determine blockchain for resolved address");
  }

  let analysis;

  switch (chain) {
    case "ethereum":
      analysis = await analyzeEthereumWallet(address);
      break;
    case "bitcoin":
      analysis = await analyzeBitcoinWallet(address);
      break;
    case "solana":
      analysis = await analyzeSolanaWallet(address);
      break;
    default:
      throw new Error("Unsupported chain");
  }

  if (resolvedName) {
    analysis.resolvedName = resolvedName;
  }

  return analysis;
}

module.exports = { analyzeWallet, detectChain };

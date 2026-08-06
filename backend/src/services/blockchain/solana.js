const { safePost } = require("../../utils/httpClient");
const { isScamAddress } = require("../../data/scamAddresses");
const { isMixerAddress } = require("../../data/mixerAddresses");

const SOLANA_RPCS = [
  "https://api.mainnet-beta.solana.com",
  "https://solana.publicnode.com",
];

async function rpcCall(method, params) {
  for (const rpc of SOLANA_RPCS) {
    const data = await safePost(rpc, {
      jsonrpc: "2.0",
      method,
      params,
      id: 1,
    });
    if (data?.result) return data.result;
    if (data?.error) console.warn(`Solana RPC ${rpc}:`, data.error.message);
  }
  return null;
}

async function getSignatures(address) {
  const result = await rpcCall("getSignaturesForAddress", [
    address,
    { limit: 50 },
  ]);
  return result || [];
}

function detectRiskyPatterns(signatures) {
  return {
    manySmallTransfers: signatures.length >= 20,
    smallTransferCount: signatures.length,
  };
}

function detectNftWashTrading(signatures) {
  return signatures.length >= 5 && signatures.length <= 15;
}

async function analyzeSolanaWallet(address) {
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    throw new Error("Invalid Solana address format");
  }

  const signatures = await getSignatures(address);

  const scamExposure = isScamAddress(address, "solana") ? 1 : 0;
  const mixerUsage = isMixerAddress(address, "solana");

  return {
    chain: "solana",
    wallet: address,
    txCount: signatures.length,
    scamExposure,
    mixerUsage,
    riskyPatterns: detectRiskyPatterns(signatures),
    nftWashTrading: detectNftWashTrading(signatures),
  };
}

module.exports = { analyzeSolanaWallet };

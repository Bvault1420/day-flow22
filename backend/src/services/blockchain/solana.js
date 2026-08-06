const axios = require("axios");
const { isScamAddress } = require("../../data/scamAddresses");
const { isMixerAddress } = require("../../data/mixerAddresses");

const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

async function rpcCall(method, params) {
  const { data } = await axios.post(SOLANA_RPC, {
    jsonrpc: "2.0",
    method,
    params,
    id: 1,
  });
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

async function getSignatures(address) {
  const result = await rpcCall("getSignaturesForAddress", [
    address,
    { limit: 50 },
  ]);
  return result || [];
}

function detectRiskyPatterns(signatures) {
  // Dummy: many signatures in short time suggests bot activity
  return {
    manySmallTransfers: signatures.length >= 20,
    smallTransferCount: signatures.length,
  };
}

function detectNftWashTrading(signatures) {
  // Dummy rule: moderate activity window
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

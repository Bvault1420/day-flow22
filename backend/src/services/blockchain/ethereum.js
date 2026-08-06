const axios = require("axios");
const { isScamAddress } = require("../../data/scamAddresses");
const { isMixerAddress } = require("../../data/mixerAddresses");

const ETH_RPC = "https://ethereum.publicnode.com";
const BLOCKSCOUT_API = "https://eth.blockscout.com/api/v2";

async function rpcCall(method, params) {
  const { data } = await axios.post(ETH_RPC, {
    jsonrpc: "2.0",
    method,
    params,
    id: 1,
  });
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

async function getTransactionCount(address) {
  const result = await rpcCall("eth_getTransactionCount", [address, "latest"]);
  return parseInt(result, 16);
}

async function fetchRecentTransactions(address) {
  try {
    const { data } = await axios.get(
      `${BLOCKSCOUT_API}/addresses/${address}/transactions`,
      { params: { filter: "to | from" }, timeout: 10000 }
    );
    return data.items || [];
  } catch {
    return [];
  }
}

function detectRiskyPatterns(transactions) {
  if (!transactions.length) return { manySmallTransfers: false, smallTransferCount: 0 };

  const smallTransfers = transactions.filter((tx) => {
    const value = parseFloat(tx.value || "0");
    return value > 0 && value < 0.01;
  });

  return {
    manySmallTransfers: smallTransfers.length >= 5,
    smallTransferCount: smallTransfers.length,
  };
}

function detectNftWashTrading(transactions) {
  // Dummy rule: 3+ NFT-like transfers (method contains transfer) in short window
  const nftTransfers = transactions.filter(
    (tx) =>
      tx.method?.toLowerCase().includes("transfer") ||
      tx.tx_types?.includes("token_transfer")
  );
  return nftTransfers.length >= 3 && nftTransfers.length <= 10;
}

function countScamExposure(address, transactions, chain) {
  if (isScamAddress(address, chain)) return 1;

  let exposure = 0;
  for (const tx of transactions) {
    const from = tx.from?.hash || tx.from;
    const to = tx.to?.hash || tx.to;
    if (from && isScamAddress(from, chain)) exposure++;
    if (to && isScamAddress(to, chain)) exposure++;
  }
  return exposure;
}

function detectMixerUsage(address, transactions, chain) {
  if (isMixerAddress(address, chain)) return true;

  for (const tx of transactions) {
    const from = tx.from?.hash || tx.from;
    const to = tx.to?.hash || tx.to;
    if (from && isMixerAddress(from, chain)) return true;
    if (to && isMixerAddress(to, chain)) return true;
  }
  return false;
}

async function analyzeEthereumWallet(address) {
  const normalized = address.toLowerCase();
  if (!/^0x[a-fA-F0-9]{40}$/.test(normalized)) {
    throw new Error("Invalid Ethereum address format");
  }

  const txCount = await getTransactionCount(normalized);
  const transactions = await fetchRecentTransactions(normalized);

  const scamExposure = countScamExposure(normalized, transactions, "ethereum");
  const mixerUsage = detectMixerUsage(normalized, transactions, "ethereum");
  const riskyPatterns = detectRiskyPatterns(transactions);
  const nftWashTrading = detectNftWashTrading(transactions);

  return {
    chain: "ethereum",
    wallet: normalized,
    txCount: txCount || transactions.length,
    scamExposure,
    mixerUsage,
    riskyPatterns,
    nftWashTrading,
  };
}

module.exports = { analyzeEthereumWallet };

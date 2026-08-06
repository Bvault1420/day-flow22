const { safeGet, safePost } = require("../../utils/httpClient");
const { isScamAddress } = require("../../data/scamAddresses");
const { isMixerAddress } = require("../../data/mixerAddresses");

const ETH_RPCS = [
  "https://ethereum.publicnode.com",
  "https://rpc.ankr.com/eth",
  "https://1rpc.io/eth",
];
const BLOCKSCOUT_API = "https://eth.blockscout.com/api/v2";

async function rpcCall(method, params) {
  for (const rpc of ETH_RPCS) {
    const data = await safePost(rpc, {
      jsonrpc: "2.0",
      method,
      params,
      id: 1,
    });
    if (data?.result) return data.result;
  }
  return null;
}

async function getTransactionCount(address) {
  const result = await rpcCall("eth_getTransactionCount", [address, "latest"]);
  return result ? parseInt(result, 16) : 0;
}

async function fetchAddressInfo(address) {
  const data = await safeGet(`${BLOCKSCOUT_API}/addresses/${address}`);
  return data || {};
}

async function fetchRecentTransactions(address) {
  const data = await safeGet(
    `${BLOCKSCOUT_API}/addresses/${address}/transactions`,
    { params: { filter: "to | from" } }
  );
  return data?.items || [];
}

async function fetchTokenTransfers(address) {
  const data = await safeGet(
    `${BLOCKSCOUT_API}/addresses/${address}/token-transfers`
  );
  return data?.items || [];
}

function detectRiskyPatterns(transactions) {
  if (!transactions.length) {
    return { manySmallTransfers: false, smallTransferCount: 0 };
  }

  const smallTransfers = transactions.filter((tx) => {
    const value = parseFloat(tx.value || "0");
    return value > 0 && value < 0.01;
  });

  return {
    manySmallTransfers: smallTransfers.length >= 5,
    smallTransferCount: smallTransfers.length,
  };
}

function detectNftWashTrading(transactions, tokenTransfers) {
  const nftTransfers = transactions.filter(
    (tx) =>
      tx.method?.toLowerCase().includes("transfer") ||
      tx.tx_types?.includes("token_transfer")
  );
  const tokenCount = tokenTransfers?.length || 0;
  return (
    (nftTransfers.length >= 3 && nftTransfers.length <= 10) ||
    (tokenCount >= 8 && tokenCount <= 20)
  );
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

function computeWalletAge(firstTxTimestamp) {
  if (!firstTxTimestamp) return null;
  const first = new Date(firstTxTimestamp);
  const days = Math.floor((Date.now() - first.getTime()) / (1000 * 60 * 60 * 24));
  return days > 0 ? days : null;
}

function computeActivityLevel(txCount) {
  if (txCount === 0) return "inactive";
  if (txCount < 5) return "low";
  if (txCount < 50) return "moderate";
  if (txCount < 500) return "active";
  return "very_active";
}

async function analyzeEthereumWallet(address) {
  const normalized = address.toLowerCase();
  if (!/^0x[a-fA-F0-9]{40}$/.test(normalized)) {
    throw new Error("Invalid Ethereum address format");
  }

  const addressInfo = await fetchAddressInfo(normalized);
  const txCount = await getTransactionCount(normalized);
  const transactions = await fetchRecentTransactions(normalized);
  const tokenTransfers = await fetchTokenTransfers(normalized);

  const firstTx = transactions[transactions.length - 1];
  const walletAgeDays = computeWalletAge(firstTx?.timestamp);

  const balanceEth = parseFloat(addressInfo.coin_balance || "0");
  const exchangeRate = parseFloat(addressInfo.exchange_rate || "0");
  const balanceUsd = balanceEth * exchangeRate;

  const scamExposure = countScamExposure(normalized, transactions, "ethereum");
  const mixerUsage = detectMixerUsage(normalized, transactions, "ethereum");
  const riskyPatterns = detectRiskyPatterns(transactions);
  const nftWashTrading = detectNftWashTrading(transactions, tokenTransfers);

  return {
    chain: "ethereum",
    wallet: normalized,
    txCount: txCount || transactions.length,
    scamExposure,
    mixerUsage,
    riskyPatterns,
    nftWashTrading,
    walletAgeDays,
    balanceUsd: balanceUsd > 0 ? balanceUsd : null,
    tokenTransferCount: tokenTransfers.length,
    activityLevel: computeActivityLevel(txCount || transactions.length),
  };
}

module.exports = { analyzeEthereumWallet };

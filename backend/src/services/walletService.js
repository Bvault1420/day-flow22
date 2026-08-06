const { safeGet } = require("../utils/httpClient");
const axios = require("axios");
const { isScam } = require("../data/scamAddresses");

const ETH_RPC = "https://ethereum.publicnode.com";
const BLOCKSCOUT = "https://eth.blockscout.com/api/v2";
const KNOWN_ENS = { "vitalik.eth": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" };

async function rpc(method, params) {
  try {
    const { data } = await axios.post(ETH_RPC, { jsonrpc: "2.0", method, params, id: 1 }, { timeout: 12000 });
    return data?.result;
  } catch { return null; }
}

async function resolve(input) {
  const s = input.trim();
  if (/^0x[a-fA-F0-9]{40}$/i.test(s)) return { address: s, chain: "ethereum" };
  if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(s)) return { address: s, chain: "bitcoin" };
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s)) return { address: s, chain: "solana" };
  const ens = s.toLowerCase().endsWith(".eth") ? s.toLowerCase() : `${s.toLowerCase()}.eth`;
  if (KNOWN_ENS[ens]) return { address: KNOWN_ENS[ens], chain: "ethereum", resolvedName: ens };
  const d = await safeGet(`https://api.ensdata.net/${ens}`);
  if (d?.address) return { address: d.address, chain: "ethereum", resolvedName: ens };
  throw new Error(`"${s}" konnte nicht aufgelöst werden`);
}

function scoreWallet(a) {
  let score = 70;
  if (a.scamExposure > 0) score -= 35;
  if (a.mixerUsage) score -= 25;
  if (a.txCount < 5) score -= 12;
  if (a.txCount > 100) score += 8;
  if (a.nftWashTrading) score -= 18;
  if (a.manySmallTransfers) score -= 12;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function riskLevel(s) {
  if (s >= 75) return "low";
  if (s >= 50) return "medium";
  return "high";
}

async function analyzeWallet(input) {
  const { address, chain, resolvedName } = await resolve(input);
  let txCount = 0, scamExposure = 0, mixerUsage = false, manySmallTransfers = false, nftWashTrading = false;

  if (chain === "ethereum") {
    const nonce = await rpc("eth_getTransactionCount", [address.toLowerCase(), "latest"]);
    txCount = nonce ? parseInt(nonce, 16) : 0;
    scamExposure = isScam(address.toLowerCase(), "ethereum") ? 1 : 0;
    const txs = await safeGet(`${BLOCKSCOUT}/addresses/${address.toLowerCase()}/transactions`);
    const items = txs?.items || [];
    const small = items.filter((t) => parseFloat(t.value || 0) > 0 && parseFloat(t.value) < 0.01);
    manySmallTransfers = small.length >= 5;
    nftWashTrading = items.filter((t) => t.method?.includes("transfer")).length >= 3;
  } else if (chain === "bitcoin") {
    const d = await safeGet(`https://blockchain.info/rawaddr/${address}`);
    txCount = d?.n_tx || 0;
    scamExposure = isScam(address, "bitcoin") ? 1 : 0;
  } else {
    try {
      const { data } = await axios.post("https://api.mainnet-beta.solana.com", {
        jsonrpc: "2.0", method: "getSignaturesForAddress", params: [address, { limit: 50 }], id: 1,
      }, { timeout: 12000 });
      txCount = data?.result?.length || 0;
      scamExposure = isScam(address, "solana") ? 1 : 0;
      manySmallTransfers = txCount >= 20;
    } catch { txCount = 0; }
  }

  const analysis = {
    chain, wallet: address, resolvedName, txCount,
    scamExposure, mixerUsage, nftWashTrading,
    riskyPatterns: { manySmallTransfers, smallTransferCount: manySmallTransfers ? 5 : 0 },
    activityLevel: txCount === 0 ? "inactive" : txCount < 10 ? "low" : txCount < 100 ? "moderate" : "active",
  };

  const score = scoreWallet({ ...analysis, manySmallTransfers });
  const insights = [
    `Wallet ${address.slice(0, 6)}...${address.slice(-4)} auf ${chain}: Score ${score}/100.`,
    resolvedName ? `ENS: ${resolvedName}` : null,
    `${txCount} Transaktionen.`,
    scamExposure > 0 ? "⚠ Scam-Kontakt erkannt." : "Keine Scam-Kontakte.",
    manySmallTransfers ? "⚠ Viele kleine Transfers erkannt." : null,
  ].filter(Boolean);

  return {
    score,
    riskLevel: riskLevel(score),
    insights,
    details: { ...analysis, type: "wallet" },
  };
}

module.exports = { analyzeWallet };

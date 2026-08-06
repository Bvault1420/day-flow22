const { safeGet } = require("../../utils/httpClient");
const { SYMBOL_MAP } = require("./coingecko");

function extractTvl(protocolData) {
  if (!protocolData) return null;

  if (protocolData.currentChainTvls) {
    const vals = Object.values(protocolData.currentChainTvls);
    const sum = vals.reduce((a, b) => a + (Number(b) || 0), 0);
    if (sum > 0) return sum;
  }

  const tvl = protocolData.tvl;
  if (typeof tvl === "number") return tvl;
  if (Array.isArray(tvl) && tvl.length) {
    const last = tvl[tvl.length - 1];
    return last?.totalLiquidityUSD || last?.tvl || null;
  }

  return null;
}

async function fetchDefiLlama(input) {
  const lower = input.trim().toLowerCase();
  const geckoId = SYMBOL_MAP[lower] || lower;

  const priceData = await safeGet(
    `https://coins.llama.fi/prices/current/coingecko:${geckoId}`
  );
  const coin = priceData?.coins?.[`coingecko:${geckoId}`];
  if (!coin) return null;

  const protocolData = await safeGet(`https://api.llama.fi/protocol/${geckoId}`);
  const tvl = extractTvl(protocolData);

  return {
    source: "defillama",
    name: geckoId,
    symbol: lower.length <= 5 ? lower.toUpperCase() : geckoId,
    coinId: geckoId,
    priceUsd: coin.price,
    confidence: coin.confidence,
    tvlUsd: typeof tvl === "number" ? tvl : null,
    lastUpdated: coin.timestamp
      ? new Date(coin.timestamp * 1000).toISOString()
      : null,
  };
}

module.exports = { fetchDefiLlama };

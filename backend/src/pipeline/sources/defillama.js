const { safeGet } = require("../../utils/httpClient");
const { SYMBOL_MAP } = require("./coingecko");

async function fetchDefiLlama(input) {
  const lower = input.trim().toLowerCase();
  const geckoId = SYMBOL_MAP[lower] || lower;

  // Price from DefiLlama coins API
  const priceData = await safeGet(
    `https://coins.llama.fi/prices/current/coingecko:${geckoId}`
  );
  const coin = priceData?.coins?.[`coingecko:${geckoId}`];
  if (!coin) return null;

  // Try protocol TVL if it's a known protocol
  let tvl = null;
  const protocolData = await safeGet(`https://api.llama.fi/protocol/${geckoId}`);
  if (protocolData?.tvl) {
    tvl = protocolData.tvl;
  }

  return {
    source: "defillama",
    name: geckoId,
    symbol: lower.toUpperCase(),
    coinId: geckoId,
    priceUsd: coin.price,
    confidence: coin.confidence,
    tvlUsd: tvl,
    lastUpdated: coin.timestamp ? new Date(coin.timestamp * 1000).toISOString() : null,
  };
}

module.exports = { fetchDefiLlama };

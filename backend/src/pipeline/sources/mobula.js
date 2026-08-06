const { safeGet } = require("../../utils/httpClient");

async function fetchMobula(input, contractAddress) {
  const trimmed = input.trim();

  if (contractAddress || /^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    const addr = contractAddress || trimmed;
    const data = await safeGet(
      `https://api.mobula.io/api/1/market/data?asset=${addr}&blockchain=ethereum`
    );
    const d = data?.data;
    if (!d) return null;
    return normalizeMobula(d);
  }

  const data = await safeGet(
    `https://api.mobula.io/api/1/search?input=${encodeURIComponent(trimmed)}`
  );
  const asset = data?.data?.[0];
  if (!asset) return null;

  const market = await safeGet(
    `https://api.mobula.io/api/1/market/data?asset=${asset.id}`
  );
  if (!market?.data) return null;
  return normalizeMobula(market.data);
}

function normalizeMobula(d) {
  return {
    source: "mobula",
    name: d.name,
    symbol: d.symbol?.toUpperCase(),
    contractAddress: d.contracts?.[0],
    priceUsd: d.price,
    marketCap: d.market_cap,
    volume24h: d.volume,
    priceChange24h: d.price_change_24h,
    priceChange7d: d.price_change_7d,
    priceChange30d: d.price_change_30d,
    circulatingSupply: d.circulating_supply,
    totalSupply: d.total_supply,
    lastUpdated: d.last_updated,
  };
}

module.exports = { fetchMobula };

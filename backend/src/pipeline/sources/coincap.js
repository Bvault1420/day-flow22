const { safeGet } = require("../../utils/httpClient");

const SYMBOL_MAP = {
  btc: "bitcoin", eth: "ethereum", sol: "solana", usdt: "tether",
  usdc: "usd-coin", bnb: "binance-coin", xrp: "xrp", ada: "cardano",
  doge: "dogecoin", dot: "polkadot", avax: "avalanche", matic: "polygon",
  link: "chainlink", shib: "shiba-inu", pepe: "pepe",
};

async function fetchCoinCap(input) {
  const lower = input.trim().toLowerCase();
  const id = SYMBOL_MAP[lower] || lower;

  const data = await safeGet(`https://api.coincap.io/v2/assets/${id}`);
  const asset = data?.data;
  if (!asset) return null;

  return {
    source: "coincap",
    name: asset.name,
    symbol: asset.symbol?.toUpperCase(),
    coinId: asset.id,
    priceUsd: parseFloat(asset.priceUsd),
    marketCap: parseFloat(asset.marketCapUsd),
    volume24h: parseFloat(asset.volumeUsd24Hr),
    priceChange24h: parseFloat(asset.changePercent24Hr),
    circulatingSupply: parseFloat(asset.supply),
    maxSupply: asset.maxSupply ? parseFloat(asset.maxSupply) : null,
    marketCapRank: parseInt(asset.rank, 10) || null,
    lastUpdated: new Date(asset.timestamp).toISOString(),
  };
}

module.exports = { fetchCoinCap };

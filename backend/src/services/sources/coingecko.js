const { safeGet } = require("../../utils/httpClient");

const MAP = {
  btc: "bitcoin", eth: "ethereum", sol: "solana", solana: "solana",
  doge: "dogecoin", shib: "shiba-inu", pepe: "pepe", usdt: "tether", usdc: "usd-coin",
  bitcoin: "bitcoin", ethereum: "ethereum",
};

async function fetchCoinGecko(q) {
  const lower = q.toLowerCase();
  const id = MAP[lower];
  if (id) {
    const m = await safeGet(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${id}`);
    if (m?.[0]) return norm(m[0], "coingecko");
  }
  if (/^0x[a-fA-F0-9]{40}$/.test(q)) {
    const d = await safeGet(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${q.toLowerCase()}`);
    if (d) return normFull(d);
  }
  const search = await safeGet(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`);
  const match = search?.coins?.find((c) => c.symbol?.toLowerCase() === lower) || search?.coins?.[0];
  if (!match) return null;
  const m = await safeGet(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${match.id}`);
  return m?.[0] ? norm(m[0], "coingecko") : null;
}

function norm(m, source) {
  return {
    source, name: m.name, symbol: m.symbol?.toUpperCase(),
    priceUsd: m.current_price, marketCap: m.market_cap, volume24h: m.total_volume,
    priceChange24h: m.price_change_percentage_24h, marketCapRank: m.market_cap_rank,
    image: m.image, ath: m.ath, athChange: m.ath_change_percentage,
    lastUpdated: m.last_updated,
  };
}

function normFull(d) {
  const md = d.market_data || {};
  return {
    source: "coingecko", name: d.name, symbol: d.symbol?.toUpperCase(),
    priceUsd: md.current_price?.usd, marketCap: md.market_cap?.usd, volume24h: md.total_volume?.usd,
    priceChange24h: md.price_change_percentage_24h, marketCapRank: d.market_cap_rank,
    image: d.image?.small, categories: d.categories || [],
    ath: md.ath?.usd, athChange: md.ath_change_percentage?.usd, lastUpdated: md.last_updated,
  };
}

module.exports = { fetchCoinGecko };

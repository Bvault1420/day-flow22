const { safeGet } = require("../../utils/httpClient");

const MAP = { btc: "bitcoin", eth: "ethereum", sol: "solana", solana: "solana", doge: "dogecoin", shib: "shiba-inu", pepe: "pepe" };

async function fetchDefiLlama(q) {
  const id = MAP[q.toLowerCase()] || q.toLowerCase();
  const d = await safeGet(`https://coins.llama.fi/prices/current/coingecko:${id}`);
  const coin = d?.coins?.[`coingecko:${id}`];
  if (!coin) return null;
  return { source: "defillama", symbol: id.toUpperCase(), priceUsd: coin.price, name: id };
}

module.exports = { fetchDefiLlama };

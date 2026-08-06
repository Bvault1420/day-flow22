const { safeGet } = require("../../utils/httpClient");

async function fetchCoinMarketCap(input) {
  const apiKey = process.env.COINMARKETCAP_API_KEY;
  if (!apiKey) return null;

  const symbol = input.trim().toUpperCase();
  const data = await safeGet(
    `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}`,
    { headers: { "X-CMC_PRO_API_KEY": apiKey } }
  );

  const coin = data?.data?.[symbol];
  if (!coin) return null;

  const usd = coin.quote?.USD;
  return {
    source: "coinmarketcap",
    name: coin.name,
    symbol: coin.symbol,
    coinId: String(coin.id),
    priceUsd: usd?.price,
    marketCap: usd?.market_cap,
    volume24h: usd?.volume_24h,
    priceChange24h: usd?.percent_change_24h,
    priceChange7d: usd?.percent_change_7d,
    priceChange30d: usd?.percent_change_30d,
    marketCapRank: coin.cmc_rank,
    circulatingSupply: coin.circulating_supply,
    lastUpdated: usd?.last_updated,
  };
}

module.exports = { fetchCoinMarketCap };

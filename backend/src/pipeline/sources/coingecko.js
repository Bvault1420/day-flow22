const { safeGet } = require("../../utils/httpClient");

const API = "https://api.coingecko.com/api/v3";

const SYMBOL_MAP = {
  btc: "bitcoin", eth: "ethereum", sol: "solana", solana: "solana",
  usdt: "tether", usdc: "usd-coin", bnb: "binancecoin", xrp: "ripple",
  ada: "cardano", doge: "dogecoin", dot: "polkadot", avax: "avalanche-2",
  matic: "matic-network", link: "chainlink", shib: "shiba-inu", pepe: "pepe",
  arb: "arbitrum", op: "optimism", bitcoin: "bitcoin", ethereum: "ethereum",
};

async function fetchCoinGecko(input, contractAddress) {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  let data = null;

  if (contractAddress || /^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    const addr = (contractAddress || trimmed).toLowerCase();
    data = await safeGet(
      `${API}/coins/ethereum/contract/${addr}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true`
    );
  } else {
    const id = SYMBOL_MAP[lower];
    if (id) {
      data = await safeGet(`${API}/coins/markets?vs_currency=usd&ids=${id}&sparkline=false`);
      if (Array.isArray(data) && data[0]) {
        return normalizeMarket(data[0]);
      }
      data = await safeGet(
        `${API}/coins/${id}?localization=false&tickers=true&market_data=true&community_data=true&developer_data=true`
      );
    } else {
      const search = await safeGet(`${API}/search?query=${encodeURIComponent(trimmed)}`);
      const match = search?.coins?.find(
        (c) => c.symbol?.toLowerCase() === lower || c.name?.toLowerCase() === lower
      ) || search?.coins?.[0];
      if (match) {
        data = await safeGet(
          `${API}/coins/${match.id}?localization=false&tickers=true&market_data=true&community_data=true&developer_data=true`
        );
      }
    }
  }

  if (!data || Array.isArray(data)) return null;
  return normalizeFull(data);
}

function normalizeMarket(m) {
  return {
    source: "coingecko",
    name: m.name,
    symbol: m.symbol?.toUpperCase(),
    coinId: m.id,
    priceUsd: m.current_price,
    marketCap: m.market_cap,
    volume24h: m.total_volume,
    priceChange24h: m.price_change_percentage_24h,
    priceChange7d: m.price_change_percentage_7d_in_currency,
    priceChange30d: m.price_change_percentage_30d_in_currency,
    priceChange1y: m.price_change_percentage_1y_in_currency,
    marketCapRank: m.market_cap_rank,
    circulatingSupply: m.circulating_supply,
    ath: m.ath,
    athChange: m.ath_change_percentage,
    atl: m.atl,
    image: m.image,
    lastUpdated: m.last_updated,
  };
}

function normalizeFull(d) {
  const md = d.market_data || {};
  const dev = d.developer_data || {};
  const comm = d.community_data || {};
  return {
    source: "coingecko",
    name: d.name,
    symbol: d.symbol?.toUpperCase(),
    coinId: d.id,
    contractAddress: d.platforms?.ethereum || null,
    priceUsd: md.current_price?.usd,
    marketCap: md.market_cap?.usd,
    volume24h: md.total_volume?.usd,
    priceChange24h: md.price_change_percentage_24h,
    priceChange7d: md.price_change_percentage_7d,
    priceChange30d: md.price_change_percentage_30d,
    priceChange1y: md.price_change_percentage_1y,
    marketCapRank: d.market_cap_rank,
    circulatingSupply: md.circulating_supply,
    totalSupply: md.total_supply,
    maxSupply: md.max_supply,
    ath: md.ath?.usd,
    athChange: md.ath_change_percentage?.usd,
    atl: md.atl?.usd,
    categories: d.categories || [],
    image: d.image?.small,
    githubStars: dev.stars,
    githubCommits4w: dev.commit_count_4_weeks,
    twitterFollowers: comm.twitter_followers,
    redditSubscribers: comm.reddit_subscribers,
    sentimentUp: comm.sentiment_votes_up_percentage,
    exchangeCount: d.tickers?.length || 0,
    homepage: d.links?.homepage?.[0],
    lastUpdated: md.last_updated || d.last_updated,
  };
}

module.exports = { fetchCoinGecko, SYMBOL_MAP };

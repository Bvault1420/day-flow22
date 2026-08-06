const { safeGet } = require("../utils/httpClient");
const { isScamToken, isScamSymbol } = require("../data/scamTokens");

const COINGECKO_API = "https://api.coingecko.com/api/v3";

const SYMBOL_MAP = {
  btc: "bitcoin",
  eth: "ethereum",
  sol: "solana",
  usdt: "tether",
  usdc: "usd-coin",
  bnb: "binancecoin",
  xrp: "ripple",
  ada: "cardano",
  doge: "dogecoin",
  dot: "polkadot",
  avax: "avalanche-2",
  matic: "matic-network",
  link: "chainlink",
  shib: "shiba-inu",
  pepe: "pepe",
  arb: "arbitrum",
  op: "optimism",
};

function isContractAddress(input) {
  return /^0x[a-fA-F0-9]{40}$/.test(input.trim());
}

async function searchCoin(query) {
  const data = await safeGet(
    `${COINGECKO_API}/search?query=${encodeURIComponent(query)}`
  );
  return data?.coins || [];
}

async function getMarketData(id) {
  const data = await safeGet(
    `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${id}&sparkline=false`
  );
  return Array.isArray(data) ? data[0] : null;
}

async function getCoinById(id) {
  const data = await safeGet(
    `${COINGECKO_API}/coins/${id}?localization=false&tickers=true&market_data=true&community_data=true&developer_data=true`
  );
  if (data && !Array.isArray(data)) return data;

  return getMarketData(id);
}

async function getCoinByContract(address) {
  return safeGet(
    `${COINGECKO_API}/coins/ethereum/contract/${address.toLowerCase()}?localization=false&tickers=true&market_data=true&community_data=true&developer_data=true`
  );
}

function analyzeTickers(tickers = []) {
  const trustedExchanges = new Set();
  let totalVolume = 0;
  let spreadSum = 0;
  let spreadCount = 0;

  for (const t of tickers) {
    const exchange = t.market?.name || "unknown";
    const vol = t.converted_volume?.usd || t.volume || 0;
    if (vol > 10000) trustedExchanges.add(exchange);
    totalVolume += vol;

    const bid = t.bid_ask_spread_percentage;
    if (bid != null && bid > 0) {
      spreadSum += bid;
      spreadCount++;
    }
  }

  return {
    exchangeCount: trustedExchanges.size,
    tickerVolume: totalVolume,
    avgSpread: spreadCount > 0 ? spreadSum / spreadCount : null,
    topExchanges: [...trustedExchanges].slice(0, 5),
  };
}

function assessLiquidity(marketCap, volume24h) {
  const cap = marketCap || 0;
  const vol = volume24h || 0;
  const ratio = cap > 0 ? vol / cap : 0;

  let liquidityScore = "very_low";
  let enoughLiquidity = false;

  if (cap >= 1e9 && vol >= 50e6 && ratio >= 0.01) {
    liquidityScore = "high";
    enoughLiquidity = true;
  } else if (cap >= 100e6 && vol >= 5e6 && ratio >= 0.005) {
    liquidityScore = "medium";
    enoughLiquidity = true;
  } else if (cap >= 10e6 && vol >= 500e3 && ratio >= 0.002) {
    liquidityScore = "low";
    enoughLiquidity = true;
  } else if (vol >= 100e3) {
    liquidityScore = "low";
    enoughLiquidity = false;
  }

  return { liquidityScore, enoughLiquidity, volumeToMcapRatio: ratio };
}

function computeDeveloperScore(devData) {
  if (!devData) return 0;
  const commits = devData.commit_count_4_weeks || 0;
  const stars = devData.stars || 0;
  const forks = devData.forks || 0;
  let score = 0;
  if (commits > 50) score += 0.4;
  else if (commits > 10) score += 0.2;
  if (stars > 1000) score += 0.35;
  else if (stars > 100) score += 0.2;
  if (forks > 100) score += 0.25;
  return Math.min(1, score);
}

function buildAnalysisFromMarket(market, trimmed) {
  const marketCap = market.market_cap || 0;
  const volume24h = market.total_volume || 0;
  const liquidity = assessLiquidity(marketCap, volume24h);
  const symbol = market.symbol?.toUpperCase() || trimmed.toUpperCase();

  return {
    type: "coin",
    coinId: market.id,
    name: market.name || trimmed,
    symbol,
    contractAddress: null,
    image: market.image || null,
    marketCap,
    volume24h,
    priceUsd: market.current_price || 0,
    priceChange24h: market.price_change_percentage_24h,
    priceChange7d: market.price_change_percentage_7d_in_currency,
    priceChange30d: market.price_change_percentage_30d_in_currency,
    priceChange1y: market.price_change_percentage_1y_in_currency,
    marketCapRank: market.market_cap_rank || null,
    circulatingSupply: market.circulating_supply,
    totalSupply: market.total_supply,
    maxSupply: market.max_supply,
    ath: market.ath,
    athChange: market.ath_change_percentage,
    atl: market.atl,
    liquidityScore: liquidity.liquidityScore,
    enoughLiquidity: liquidity.enoughLiquidity,
    volumeToMcapRatio: liquidity.volumeToMcapRatio,
    exchangeCount: 10,
    avgSpread: null,
    topExchanges: [],
    isScam: isScamSymbol(symbol),
    categories: [],
    homepage: null,
    blockchainSite: null,
    githubStars: 0,
    githubForks: 0,
    githubCommits4w: 0,
    twitterFollowers: 0,
    redditSubscribers: 0,
    developerScore: 0,
    lastUpdated: market.last_updated,
    sentimentUp: null,
    sentimentDown: null,
  };
}

async function analyzeCoin(input) {
  const trimmed = input.trim();
  let coinData = null;
  let contractAddress = null;

  if (isContractAddress(trimmed)) {
    contractAddress = trimmed.toLowerCase();
    coinData = await getCoinByContract(contractAddress);
  } else {
    const lower = trimmed.toLowerCase();
    const coinId = SYMBOL_MAP[lower];

    if (coinId) {
      // Prefer lightweight markets API for known symbols (fewer rate-limit issues)
      const market = await getMarketData(coinId);
      if (market) {
        return buildAnalysisFromMarket(market, trimmed);
      }
      coinData = await getCoinById(coinId);
    } else {
      const results = await searchCoin(trimmed);
      const exact = results.find(
        (c) =>
          c.symbol?.toLowerCase() === lower ||
          c.name?.toLowerCase() === lower ||
          c.id?.toLowerCase() === lower
      );
      const match = exact || results[0];
      if (!match) {
        throw new Error(
          `Coin "${trimmed}" not found. Try BTC, ETH, SOL or a contract address.`
        );
      }
      coinData = await getCoinById(match.id);
    }

    if (coinData?.platforms?.ethereum) {
      contractAddress = coinData.platforms.ethereum;
    }
  }

  if (!coinData) {
    throw new Error(
      `Could not fetch data for "${trimmed}". Check the symbol/name or try again.`
    );
  }

  // Handle markets fallback (array response)
  if (Array.isArray(coinData)) {
    const market = coinData[0];
    if (!market) {
      throw new Error(`Coin "${trimmed}" not found.`);
    }
    return buildAnalysisFromMarket(market, trimmed);
  }

  const md = coinData.market_data || {};
  const community = coinData.community_data || {};
  const developer = coinData.developer_data || {};
  const tickerAnalysis = analyzeTickers(coinData.tickers || []);

  const marketCap = md.market_cap?.usd || 0;
  const volume24h = md.total_volume?.usd || 0;
  const priceUsd = md.current_price?.usd || 0;

  const liquidity = assessLiquidity(marketCap, volume24h);

  const symbol = coinData.symbol?.toUpperCase() || trimmed.toUpperCase();
  const isScam =
    isScamSymbol(symbol) ||
    isScamToken(contractAddress, "ethereum") ||
    coinData.categories?.includes("scam");

  const developerScore = computeDeveloperScore(developer);

  return {
    type: "coin",
    coinId: coinData.id,
    name: coinData.name || trimmed,
    symbol,
    contractAddress,
    image: coinData.image?.small || null,
    marketCap,
    volume24h,
    priceUsd,
    priceChange24h: md.price_change_percentage_24h,
    priceChange7d: md.price_change_percentage_7d,
    priceChange30d: md.price_change_percentage_30d,
    priceChange1y: md.price_change_percentage_1y,
    marketCapRank: coinData.market_cap_rank || null,
    circulatingSupply: md.circulating_supply,
    totalSupply: md.total_supply,
    maxSupply: md.max_supply,
    ath: md.ath?.usd,
    athChange: md.ath_change_percentage?.usd,
    atl: md.atl?.usd,
    liquidityScore: liquidity.liquidityScore,
    enoughLiquidity: liquidity.enoughLiquidity,
    volumeToMcapRatio: liquidity.volumeToMcapRatio,
    exchangeCount: tickerAnalysis.exchangeCount,
    avgSpread: tickerAnalysis.avgSpread,
    topExchanges: tickerAnalysis.topExchanges,
    isScam,
    categories: coinData.categories || [],
    homepage: coinData.links?.homepage?.[0] || null,
    blockchainSite: coinData.links?.blockchain_site?.[0] || null,
    githubStars: developer.stars || 0,
    githubForks: developer.forks || 0,
    githubCommits4w: developer.commit_count_4_weeks || 0,
    twitterFollowers: community.twitter_followers || 0,
    redditSubscribers: community.reddit_subscribers || 0,
    developerScore,
    lastUpdated: md.last_updated || coinData.last_updated,
    sentimentUp: community.sentiment_votes_up_percentage,
    sentimentDown: community.sentiment_votes_down_percentage,
  };
}

module.exports = { analyzeCoin };

const { fetchCoinGecko } = require("./sources/coingecko");
const { fetchDexScreener } = require("./sources/dexscreener");
const { fetchCoinCap } = require("./sources/coincap");
const { fetchDefiLlama } = require("./sources/defillama");
const { fetchCoinMarketCap } = require("./sources/coinmarketcap");
const { fetchMobula } = require("./sources/mobula");
const { isScamToken, isScamSymbol } = require("../data/scamTokens");

const MEME_SYMBOLS = ["DOGE", "SHIB", "PEPE", "FLOKI", "BONK", "WIF", "MEME"];

function median(nums) {
  const valid = nums.filter((n) => n != null && !Number.isNaN(n) && n > 0);
  if (!valid.length) return null;
  valid.sort((a, b) => a - b);
  const mid = Math.floor(valid.length / 2);
  return valid.length % 2 ? valid[mid] : (valid[mid - 1] + valid[mid]) / 2;
}

function max(nums) {
  const valid = nums.filter((n) => n != null && !Number.isNaN(n));
  return valid.length ? Math.max(...valid) : null;
}

function mergeField(results, field, strategy = "median") {
  const values = results.map((r) => r[field]);
  return strategy === "max" ? max(values) : median(values);
}

function mergeArrays(results, field) {
  const set = new Set();
  for (const r of results) {
    const arr = r[field];
    if (Array.isArray(arr)) arr.forEach((x) => set.add(x));
  }
  return [...set];
}

function assessLiquidity(marketCap, volume24h, dexLiquidity) {
  const cap = marketCap || 0;
  const vol = volume24h || 0;
  const ratio = cap > 0 ? vol / cap : 0;

  let liquidityScore = "very_low";
  let enoughLiquidity = false;

  if (dexLiquidity && dexLiquidity > 1_000_000) enoughLiquidity = true;

  if (cap >= 1e9 && vol >= 50e6 && ratio >= 0.01) {
    liquidityScore = "high";
    enoughLiquidity = true;
  } else if (cap >= 100e6 && vol >= 5e6) {
    liquidityScore = "medium";
    enoughLiquidity = true;
  } else if (cap >= 10e6 && vol >= 500e3) {
    liquidityScore = "low";
    enoughLiquidity = true;
  } else if (vol >= 100e3 || (dexLiquidity && dexLiquidity > 100e3)) {
    liquidityScore = "low";
    enoughLiquidity = dexLiquidity > 500e3;
  }

  return { liquidityScore, enoughLiquidity, volumeToMcapRatio: ratio };
}

async function aggregateCoinData(input) {
  const trimmed = input.trim();
  const contractAddress = /^0x[a-fA-F0-9]{40}$/.test(trimmed) ? trimmed : null;

  const fetchers = [
    () => fetchCoinGecko(trimmed, contractAddress),
    () => fetchDexScreener(trimmed, contractAddress),
    () => fetchCoinCap(trimmed),
    () => fetchDefiLlama(trimmed),
    () => fetchCoinMarketCap(trimmed),
    () => fetchMobula(trimmed, contractAddress),
  ];

  const settled = await Promise.allSettled(fetchers.map((fn) => fn()));
  const results = settled
    .filter((s) => s.status === "fulfilled" && s.value)
    .map((s) => s.value);

  if (!results.length) {
    throw new Error(
      `Keine Daten von externen Quellen für "${trimmed}". Bitte erneut versuchen.`
    );
  }

  const sourcesUsed = results.map((r) => r.source);
  const primary = results.find((r) => r.source === "coingecko") || results[0];

  const dexResult = results.find((r) => r.source === "dexscreener");
  const dexLiquidity = dexResult?.dexLiquidityUsd || 0;

  const priceUsd = mergeField(results, "priceUsd");
  const marketCap = mergeField(results, "marketCap");
  const volume24h = mergeField(results, "volume24h", "max");
  const priceChange24h = mergeField(results, "priceChange24h");
  const priceChange7d = mergeField(results, "priceChange7d");
  const priceChange30d = mergeField(results, "priceChange30d");
  const priceChange1y = mergeField(results, "priceChange1y");

  const liquidity = assessLiquidity(marketCap, volume24h, dexLiquidity);

  const symbol = primary.symbol || trimmed.toUpperCase();
  const categories = mergeArrays(results, "categories");
  if (MEME_SYMBOLS.includes(symbol) && !categories.includes("Meme")) {
    categories.push("Meme");
  }

  const addr = contractAddress || primary.contractAddress || dexResult?.contractAddress;
  const isScam =
    isScamSymbol(symbol) ||
    isScamToken(addr, "ethereum") ||
    categories.includes("scam");

  // Data confidence: how many sources returned price data
  const priceSources = results.filter((r) => r.priceUsd > 0).length;
  const dataConfidence = Math.min(100, Math.round((priceSources / 6) * 100));

  // Price agreement between sources
  const prices = results.map((r) => r.priceUsd).filter((p) => p > 0);
  let priceAgreement = 100;
  if (prices.length >= 2) {
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const spreadPct = ((maxP - minP) / minP) * 100;
    priceAgreement = Math.max(0, Math.min(100, 100 - spreadPct * 2));
  }

  return {
    type: "coin",
    name: primary.name || trimmed,
    symbol,
    coinId: primary.coinId,
    contractAddress: addr || null,
    image: primary.image,
    priceUsd,
    marketCap,
    volume24h,
    priceChange24h,
    priceChange7d,
    priceChange30d,
    priceChange1y,
    marketCapRank: primary.marketCapRank || mergeField(results, "marketCapRank"),
    circulatingSupply: primary.circulatingSupply,
    totalSupply: primary.totalSupply,
    maxSupply: primary.maxSupply,
    ath: primary.ath,
    athChange: primary.athChange,
    atl: primary.atl,
    liquidityScore: liquidity.liquidityScore,
    enoughLiquidity: liquidity.enoughLiquidity,
    volumeToMcapRatio: liquidity.volumeToMcapRatio,
    dexLiquidityUsd: dexLiquidity,
    pairCount: dexResult?.pairCount || 0,
    exchangeCount: max([
      primary.exchangeCount,
      dexResult?.exchangeCount,
      results.length,
    ]) || results.length,
    avgSpread: primary.avgSpread,
    topExchanges: mergeArrays(results, "topExchanges").slice(0, 8),
    isScam,
    categories,
    homepage: primary.homepage,
    githubStars: primary.githubStars || 0,
    githubCommits4w: primary.githubCommits4w || 0,
    twitterFollowers: primary.twitterFollowers || 0,
    redditSubscribers: primary.redditSubscribers || 0,
    developerScore: primary.developerScore || 0,
    sentimentUp: primary.sentimentUp,
    sentimentDown: primary.sentimentDown,
    tvlUsd: (() => {
      const raw = results.find((r) => r.tvlUsd != null)?.tvlUsd;
      return typeof raw === "number" && !Number.isNaN(raw) ? raw : null;
    })(),
    lastUpdated: primary.lastUpdated || new Date().toISOString(),
    sourcesUsed,
    dataConfidence,
    priceAgreement: Math.round(priceAgreement),
    sourceSnapshots: results.map((r) => ({
      source: r.source,
      priceUsd: r.priceUsd,
      volume24h: r.volume24h,
      marketCap: r.marketCap,
    })),
  };
}

module.exports = { aggregateCoinData };

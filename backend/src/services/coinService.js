const { fetchCoinGecko } = require("./sources/coingecko");
const { fetchDexScreener } = require("./sources/dexscreener");
const { fetchDefiLlama } = require("./sources/defillama");
const { isScamSymbol } = require("../data/scamTokens");

function median(nums) {
  const v = nums.filter((n) => n > 0 && !Number.isNaN(n)).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

function scoreCoin(a) {
  let score = 50;
  const cap = a.marketCap || 0;
  const vol = a.volume24h || 0;
  const ratio = cap > 0 ? vol / cap : 0;

  if (cap > 1e9) score += 15;
  else if (cap > 1e8) score += 10;
  else if (cap < 1e7) score -= 15;

  if (vol > 50e6) score += 10;
  else if (vol < 1e5) score -= 10;

  if (ratio > 0.01 && ratio < 0.3) score += 8;
  if (a.dexLiquidityUsd > 1e6) score += 7;

  const c24 = Math.abs(a.priceChange24h || 0);
  if (c24 > 15) score -= 12;
  else if (c24 > 8) score -= 6;

  const ath = Math.abs(a.athChange || 0);
  if (ath > 70) score -= 10;

  if (a.isScam) score -= 40;
  if (a.sourcesUsed?.length >= 2) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function riskLevel(s) {
  if (s >= 75) return "low";
  if (s >= 50) return "medium";
  return "high";
}

async function analyzeCoin(input) {
  const q = input.trim();
  const results = await Promise.allSettled([
    fetchCoinGecko(q), fetchDexScreener(q), fetchDefiLlama(q),
  ]);
  const data = results.filter((r) => r.status === "fulfilled" && r.value).map((r) => r.value);
  if (!data.length) throw new Error(`Keine Daten für "${q}" gefunden`);

  const primary = data.find((d) => d.source === "coingecko") || data[0];
  const dex = data.find((d) => d.source === "dexscreener");

  const analysis = {
    name: primary.name || q,
    symbol: primary.symbol || q.toUpperCase(),
    image: primary.image,
    priceUsd: median(data.map((d) => d.priceUsd)),
    marketCap: median(data.map((d) => d.marketCap)),
    volume24h: Math.max(...data.map((d) => d.volume24h || 0)),
    priceChange24h: median(data.map((d) => d.priceChange24h)),
    marketCapRank: primary.marketCapRank,
    ath: primary.ath,
    athChange: primary.athChange,
    dexLiquidityUsd: dex?.dexLiquidityUsd || 0,
    pairCount: dex?.pairCount || 0,
    exchangeCount: dex?.exchangeCount || data.length,
    categories: primary.categories || [],
    isScam: isScamSymbol(primary.symbol),
    sourcesUsed: data.map((d) => d.source),
    dataConfidence: Math.min(100, Math.round((data.length / 3) * 100)),
    lastUpdated: primary.lastUpdated || new Date().toISOString(),
    sourceSnapshots: data.map((d) => ({
      source: d.source, priceUsd: d.priceUsd, volume24h: d.volume24h, marketCap: d.marketCap,
    })),
  };

  const score = scoreCoin(analysis);
  const insights = [
    `${analysis.name} (${analysis.symbol}): Safety Score ${score}/100.`,
    `Datenquellen: ${analysis.sourcesUsed.join(", ")}.`,
    analysis.dexLiquidityUsd
      ? `DEX-Liquidität: $${(analysis.dexLiquidityUsd / 1e6).toFixed(1)}M.`
      : null,
    analysis.marketCap ? `Market Cap: $${(analysis.marketCap / 1e9).toFixed(2)}B.` : null,
  ].filter(Boolean);

  return {
    score,
    riskLevel: riskLevel(score),
    insights,
    details: { ...analysis, type: "coin" },
  };
}

module.exports = { analyzeCoin };

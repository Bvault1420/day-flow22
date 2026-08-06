/**
 * Multi-factor coin scoring (0–100).
 * Weighted model — major coins score high but rarely perfect 100.
 */

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function scoreLiquidity(analysis) {
  const ratio = analysis.volumeToMcapRatio || 0;
  const exchanges = analysis.exchangeCount || 0;

  let score = 30;

  // Volume / market cap turnover (healthy: 2–15% daily)
  if (ratio >= 0.02 && ratio <= 0.15) score += 35;
  else if (ratio >= 0.01 && ratio <= 0.25) score += 25;
  else if (ratio >= 0.005) score += 15;
  else if (ratio < 0.001) score += 5;

  // Exchange distribution
  if (exchanges >= 50) score += 25;
  else if (exchanges >= 20) score += 20;
  else if (exchanges >= 10) score += 15;
  else if (exchanges >= 3) score += 8;

  // Absolute volume floor
  if (analysis.volume24h >= 100_000_000) score += 10;
  else if (analysis.volume24h >= 10_000_000) score += 5;

  return clamp(score);
}

function scoreMarketStrength(analysis) {
  const rank = analysis.marketCapRank;
  const cap = analysis.marketCap || 0;

  let score = 15;

  if (rank && rank <= 10) score += 40;
  else if (rank && rank <= 50) score += 32;
  else if (rank && rank <= 200) score += 22;
  else if (rank && rank <= 500) score += 12;
  else if (rank) score += 5;

  if (cap >= 10_000_000_000) score += 25;
  else if (cap >= 1_000_000_000) score += 18;
  else if (cap >= 100_000_000) score += 10;
  else if (cap >= 10_000_000) score += 4;

  // Small cap penalty
  if (cap < 50_000_000) score -= 15;
  if (cap < 10_000_000) score -= 20;

  return clamp(score);
}

function scoreVolatility(analysis) {
  const c24 = Math.abs(analysis.priceChange24h || 0);
  const c7 = Math.abs(analysis.priceChange7d || 0);
  const c30 = Math.abs(analysis.priceChange30d || 0);
  const c1y = Math.abs(analysis.priceChange1y || 0);
  const athDrop = Math.abs(analysis.athChange || 0);

  let score = 100;

  if (c24 > 15) score -= 25;
  else if (c24 > 8) score -= 15;
  else if (c24 > 4) score -= 8;

  if (c7 > 30) score -= 20;
  else if (c7 > 15) score -= 12;
  else if (c7 > 8) score -= 6;

  if (c30 > 50) score -= 15;
  else if (c30 > 25) score -= 8;

  // Long-term decline
  if (c1y > 70) score -= 25;
  else if (c1y > 40) score -= 15;
  else if (c1y > 20) score -= 8;

  // Distance from ATH
  if (athDrop > 80) score -= 20;
  else if (athDrop > 60) score -= 12;
  else if (athDrop > 40) score -= 6;

  // Meme / high-risk categories
  const cats = analysis.categories || [];
  if (cats.some((c) => /meme|4chan|dog-themed/i.test(c))) score -= 12;

  return clamp(score);
}

function scoreSafety(analysis) {
  let score = 80;

  if (analysis.isScam) score -= 60;
  if (!analysis.enoughLiquidity) score -= 25;
  if (analysis.liquidityScore === "very_low") score -= 20;
  if (analysis.liquidityScore === "low") score -= 10;
  if (analysis.marketCap < 1_000_000) score -= 15;
  if (analysis.marketCap < 100_000) score -= 25;

  // Verified / listed on major exchanges bonus
  if (analysis.exchangeCount >= 20) score += 10;
  if (analysis.marketCapRank && analysis.marketCapRank <= 100) score += 10;

  return clamp(score);
}

function scoreCommunity(analysis) {
  let score = 35;

  const github = analysis.githubStars || 0;
  const twitter = analysis.twitterFollowers || 0;
  const reddit = analysis.redditSubscribers || 0;

  if (github > 10000) score += 22;
  else if (github > 1000) score += 15;
  else if (github > 100) score += 8;

  if (twitter > 500000) score += 18;
  else if (twitter > 50000) score += 10;
  else if (twitter > 5000) score += 5;

  if (reddit > 100000) score += 12;
  else if (reddit > 10000) score += 6;

  if (analysis.developerScore > 0.7) score += 8;
  else if (analysis.developerScore > 0.4) score += 4;
  else score -= 5;

  // Sentiment
  const up = analysis.sentimentUp;
  if (up != null && up < 50) score -= 10;

  return clamp(score);
}

const WEIGHTS = {
  liquidity: 0.28,
  marketStrength: 0.27,
  volatility: 0.18,
  safety: 0.22,
  community: 0.07,
};

function calculateCoinScore(analysis) {
  const subScores = {
    liquidity: scoreLiquidity(analysis),
    marketStrength: scoreMarketStrength(analysis),
    volatility: scoreVolatility(analysis),
    safety: scoreSafety(analysis),
    community: scoreCommunity(analysis),
  };

  let total = 0;
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    total += subScores[key] * weight;
  }

  let score = Math.round(clamp(total));

  if (analysis.dataConfidence != null && analysis.dataConfidence < 50) score -= 12;
  if (analysis.dataConfidence != null && analysis.dataConfidence < 30) score -= 18;
  if (analysis.priceAgreement != null && analysis.priceAgreement < 70) score -= 8;

  score = Math.round(clamp(score));

  return { score, subScores };
}

module.exports = { calculateCoinScore, WEIGHTS };

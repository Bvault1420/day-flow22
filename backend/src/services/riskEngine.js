/**
 * Risk scoring engine — uses multi-factor scorers + insights.
 */
const { calculateCoinScore } = require("./scoring/coinScorer");
const { calculateWalletScore } = require("./scoring/walletScorer");
const { generateCoinInsights, generateWalletInsights } = require("./insightsGenerator");

function calculateRiskLevel(score) {
  if (score >= 75) return "low";
  if (score >= 50) return "medium";
  return "high";
}

function calculateScore(analysis) {
  const { score, subScores } = calculateWalletScore(analysis);

  const insights = generateWalletInsights(analysis, subScores, score);

  return {
    score,
    riskLevel: calculateRiskLevel(score),
    subScores,
    insights,
    details: {
      scamExposure: analysis.scamExposure,
      mixerUsage: analysis.mixerUsage,
      txCount: analysis.txCount,
      nftWashTrading: analysis.nftWashTrading,
      riskyPatterns: analysis.riskyPatterns || {},
      chain: analysis.chain,
      wallet: analysis.wallet,
      walletAgeDays: analysis.walletAgeDays,
      balanceUsd: analysis.balanceUsd,
      tokenTransferCount: analysis.tokenTransferCount,
      activityLevel: analysis.activityLevel,
      type: "wallet",
    },
  };
}

function buildCoinScore(analysis) {
  const { score, subScores } = calculateCoinScore(analysis);
  const insights = generateCoinInsights(analysis, subScores, score);

  return {
    score,
    riskLevel: calculateRiskLevel(score),
    subScores,
    insights,
    details: {
      name: analysis.name,
      symbol: analysis.symbol,
      coinId: analysis.coinId,
      image: analysis.image,
      contractAddress: analysis.contractAddress,
      marketCap: analysis.marketCap,
      volume24h: analysis.volume24h,
      priceUsd: analysis.priceUsd,
      priceChange24h: analysis.priceChange24h,
      priceChange7d: analysis.priceChange7d,
      priceChange30d: analysis.priceChange30d,
      priceChange1y: analysis.priceChange1y,
      liquidityScore: analysis.liquidityScore,
      enoughLiquidity: analysis.enoughLiquidity,
      volumeToMcapRatio: analysis.volumeToMcapRatio,
      isScam: analysis.isScam,
      marketCapRank: analysis.marketCapRank,
      exchangeCount: analysis.exchangeCount,
      avgSpread: analysis.avgSpread,
      topExchanges: analysis.topExchanges,
      circulatingSupply: analysis.circulatingSupply,
      totalSupply: analysis.totalSupply,
      maxSupply: analysis.maxSupply,
      ath: analysis.ath,
      athChange: analysis.athChange,
      atl: analysis.atl,
      categories: analysis.categories,
      homepage: analysis.homepage,
      githubStars: analysis.githubStars,
      githubCommits4w: analysis.githubCommits4w,
      twitterFollowers: analysis.twitterFollowers,
      redditSubscribers: analysis.redditSubscribers,
      developerScore: analysis.developerScore,
      sentimentUp: analysis.sentimentUp,
      sentimentDown: analysis.sentimentDown,
      lastUpdated: analysis.lastUpdated,
      type: "coin",
    },
  };
}

module.exports = {
  calculateScore,
  calculateCoinScore: buildCoinScore,
  calculateRiskLevel,
};

/**
 * Risk scoring engine.
 * Starts at 100 and deducts points based on risk factors.
 */
function calculateRiskLevel(score) {
  if (score >= 70) return "low";
  if (score >= 40) return "medium";
  return "high";
}

function calculateScore(analysis) {
  let score = 100;

  if (analysis.scamExposure > 0) {
    score -= 40;
  }

  if (analysis.mixerUsage) {
    score -= 30;
  }

  if (analysis.txCount < 5) {
    score -= 10;
  }

  if (analysis.nftWashTrading) {
    score -= 20;
  }

  // Deduct for risky transaction patterns (many small transfers)
  if (analysis.riskyPatterns?.manySmallTransfers) {
    score -= 15;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    riskLevel: calculateRiskLevel(score),
    details: {
      scamExposure: analysis.scamExposure,
      mixerUsage: analysis.mixerUsage,
      txCount: analysis.txCount,
      nftWashTrading: analysis.nftWashTrading,
      riskyPatterns: analysis.riskyPatterns || {},
      chain: analysis.chain,
      wallet: analysis.wallet,
    },
  };
}

function calculateCoinScore(analysis) {
  let score = 100;

  if (analysis.isScam) {
    score -= 50;
  }

  if (!analysis.enoughLiquidity) {
    score -= 30;
  }

  if (analysis.liquidityScore === "low") {
    score -= 15;
  }

  if (analysis.liquidityScore === "very_low") {
    score -= 25;
  }

  if (analysis.marketCap < 10_000_000) {
    score -= 20;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    riskLevel: calculateRiskLevel(score),
    details: {
      name: analysis.name,
      symbol: analysis.symbol,
      contractAddress: analysis.contractAddress,
      marketCap: analysis.marketCap,
      volume24h: analysis.volume24h,
      priceUsd: analysis.priceUsd,
      liquidityScore: analysis.liquidityScore,
      enoughLiquidity: analysis.enoughLiquidity,
      isScam: analysis.isScam,
      marketCapRank: analysis.marketCapRank,
      type: "coin",
    },
  };
}

module.exports = { calculateScore, calculateCoinScore, calculateRiskLevel };

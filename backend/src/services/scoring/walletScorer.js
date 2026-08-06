/**
 * Multi-factor wallet scoring (0–100).
 */

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function scoreActivity(analysis) {
  const tx = analysis.txCount || 0;

  if (tx === 0) return 15;
  if (tx < 3) return 35;
  if (tx < 10) return 55;
  if (tx < 50) return 72;
  if (tx < 200) return 85;
  if (tx < 1000) return 92;
  return 95; // very active — slight deduction for extreme activity
}

function scoreCleanRecord(analysis) {
  let score = 100;

  const exposure = analysis.scamExposure || 0;
  score -= Math.min(60, exposure * 20);

  if (analysis.mixerUsage) score -= 40;

  return clamp(score);
}

function scoreBehavior(analysis) {
  let score = 90;

  if (analysis.nftWashTrading) score -= 35;
  if (analysis.riskyPatterns?.manySmallTransfers) {
    const count = analysis.riskyPatterns.smallTransferCount || 0;
    score -= Math.min(30, 10 + count * 2);
  }

  // Extreme tx with small transfers pattern (bot-like)
  if (analysis.txCount > 500 && analysis.riskyPatterns?.manySmallTransfers) {
    score -= 15;
  }

  return clamp(score);
}

function scoreMaturity(analysis) {
  const tx = analysis.txCount || 0;
  const ageDays = analysis.walletAgeDays;

  let score = 30;

  if (ageDays && ageDays > 365 * 3) score += 35;
  else if (ageDays && ageDays > 365) score += 28;
  else if (ageDays && ageDays > 90) score += 18;
  else if (ageDays && ageDays > 30) score += 10;

  if (tx >= 100) score += 25;
  else if (tx >= 20) score += 18;
  else if (tx >= 5) score += 10;

  if (analysis.balanceUsd && analysis.balanceUsd > 1000) score += 10;

  return clamp(score);
}

const WEIGHTS = {
  activity: 0.2,
  cleanRecord: 0.35,
  behavior: 0.25,
  maturity: 0.2,
};

function calculateWalletScore(analysis) {
  const subScores = {
    activity: scoreActivity(analysis),
    cleanRecord: scoreCleanRecord(analysis),
    behavior: scoreBehavior(analysis),
    maturity: scoreMaturity(analysis),
  };

  let total = 0;
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    total += subScores[key] * weight;
  }

  const score = Math.round(clamp(total));

  return { score, subScores };
}

module.exports = { calculateWalletScore, WEIGHTS };

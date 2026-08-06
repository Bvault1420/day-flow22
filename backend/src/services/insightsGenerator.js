function pct(value, decimals = 1) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(decimals)}%`;
}

function fmtUsd(value) {
  if (!value) return "$0";
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

function generateCoinInsights(analysis, subScores, score) {
  const insights = [];

  insights.push(
    `${analysis.name} (${analysis.symbol}) hat einen Gesamt-Safety-Score von ${score}/100.`
  );

  if (subScores.marketStrength >= 80) {
    insights.push(
      `Starke Marktposition: Rang #${analysis.marketCapRank || "—"} mit ${fmtUsd(analysis.marketCap)} Market Cap.`
    );
  } else if (subScores.marketStrength < 50) {
    insights.push(
      `Kleine Marktkapitalisierung (${fmtUsd(analysis.marketCap)}) — höheres Risiko bei Volatilität.`
    );
  }

  if (subScores.liquidity >= 75) {
    insights.push(
      `Gute Liquidität: 24h-Volumen ${fmtUsd(analysis.volume24h)} auf ${analysis.exchangeCount} Börsen.`
    );
  } else if (subScores.liquidity < 45) {
    insights.push(
      `Niedrige Liquidität — Volumen/Market-Cap Ratio nur ${pct(analysis.volumeToMcapRatio * 100, 2)}. Vorsicht beim Trading.`
    );
  }

  const c24 = analysis.priceChange24h;
  if (c24 != null) {
    if (c24 > 10)
      insights.push(`Starker Anstieg in 24h (+${pct(c24)}) — erhöhte Volatilität.`);
    else if (c24 < -10)
      insights.push(`Starker Rückgang in 24h (${pct(c24)}) — erhöhtes Verlustrisiko.`);
    else
      insights.push(`Preisänderung 24h: ${pct(c24)} — relativ stabil.`);
  }

  if (analysis.priceChange7d != null) {
    insights.push(`7-Tage Performance: ${pct(analysis.priceChange7d)}.`);
  }

  if (analysis.isScam) {
    insights.push("⚠ Token ist auf Scam-/Rug-Listen oder hat verdächtige Merkmale.");
  }

  if (!analysis.enoughLiquidity) {
    insights.push("⚠ Liquidität reicht möglicherweise nicht für größere Trades.");
  }

  if (analysis.developerScore > 0.6) {
    insights.push("Aktive Developer-Community auf GitHub erkannt.");
  }

  if (analysis.categories?.length) {
    insights.push(`Kategorien: ${analysis.categories.slice(0, 4).join(", ")}.`);
  }

  return insights;
}

function generateWalletInsights(analysis, subScores, score) {
  const insights = [];
  const shortAddr = analysis.wallet
    ? `${analysis.wallet.slice(0, 6)}...${analysis.wallet.slice(-4)}`
    : "Wallet";

  insights.push(
    `${shortAddr} auf ${analysis.chain} — Reputation Score ${score}/100.`
  );

  const tx = analysis.txCount || 0;
  if (tx === 0) {
    insights.push("Keine ausgehenden Transaktionen — Wallet wirkt unbenutzt oder nur Empfänger.");
  } else if (tx < 5) {
    insights.push(`Wenig Aktivität (${tx} TXs) — schwerer einzuschätzen, leichtes Risiko.`);
  } else if (tx > 500) {
    insights.push(`Sehr hohe Aktivität (${tx} TXs) — erfahrene/power-user Wallet.`);
  } else {
    insights.push(`${tx} Transaktionen — normale bis moderate Aktivität.`);
  }

  if (analysis.scamExposure > 0) {
    insights.push(
      `⚠ ${analysis.scamExposure} Kontakt(e) mit bekannten Scam-Adressen erkannt.`
    );
  } else {
    insights.push("Keine direkten Scam-Kontakte in den analysierten Transaktionen.");
  }

  if (analysis.mixerUsage) {
    insights.push("⚠ Mixer/Tumbler-Nutzung erkannt — Privacy-Risiko für Compliance.");
  }

  if (analysis.nftWashTrading) {
    insights.push("⚠ Muster deuten auf mögliches NFT Wash-Trading hin.");
  }

  if (analysis.riskyPatterns?.manySmallTransfers) {
    insights.push(
      `⚠ ${analysis.riskyPatterns.smallTransferCount} kleine Transfers — typisch für Dusting/Bot-Muster.`
    );
  }

  if (analysis.walletAgeDays) {
    insights.push(`Wallet-Alter: ca. ${analysis.walletAgeDays} Tage (erste Aktivität).`);
  }

  if (analysis.balanceUsd) {
    insights.push(`Geschätzter Balance-Wert: ${fmtUsd(analysis.balanceUsd)}.`);
  }

  if (subScores.cleanRecord >= 90 && subScores.behavior >= 85) {
    insights.push("Insgesamt sauberes Verhaltensprofil ohne kritische Red Flags.");
  }

  return insights;
}

module.exports = { generateCoinInsights, generateWalletInsights };

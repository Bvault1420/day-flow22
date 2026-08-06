const { safeGet } = require("../../utils/httpClient");

async function fetchDexScreener(q) {
  let pairs = [];
  if (/^0x[a-fA-F0-9]{40}$/.test(q)) {
    const d = await safeGet(`https://api.dexscreener.com/latest/dex/tokens/${q}`);
    pairs = d?.pairs || [];
  } else {
    const d = await safeGet(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`);
    pairs = d?.pairs || [];
  }
  if (!pairs.length) return null;
  const best = pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
  const liq = pairs.reduce((s, p) => s + (p.liquidity?.usd || 0), 0);
  const vol = pairs.reduce((s, p) => s + (p.volume?.h24 || 0), 0);
  return {
    source: "dexscreener", name: best.baseToken?.name, symbol: best.baseToken?.symbol?.toUpperCase(),
    priceUsd: parseFloat(best.priceUsd), marketCap: best.marketCap || best.fdv,
    volume24h: vol, priceChange24h: best.priceChange?.h24,
    dexLiquidityUsd: liq, pairCount: pairs.length,
    exchangeCount: new Set(pairs.map((p) => p.dexId)).size,
  };
}

module.exports = { fetchDexScreener };

const { safeGet } = require("../../utils/httpClient");

const API = "https://api.dexscreener.com/latest/dex";

async function fetchDexScreener(input, contractAddress) {
  const trimmed = input.trim();

  let pairs = [];

  if (contractAddress || /^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    const addr = contractAddress || trimmed;
    const data = await safeGet(`${API}/tokens/${addr}`);
    pairs = data?.pairs || [];
  } else {
    const data = await safeGet(`${API}/search?q=${encodeURIComponent(trimmed)}`);
    pairs = data?.pairs || [];
  }

  if (!pairs.length) return null;

  // Pick highest liquidity pair
  const best = pairs.sort(
    (a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
  )[0];

  const totalLiquidity = pairs.reduce((s, p) => s + (p.liquidity?.usd || 0), 0);
  const totalVolume24h = pairs.reduce((s, p) => s + (p.volume?.h24 || 0), 0);
  const exchanges = [...new Set(pairs.map((p) => p.dexId).filter(Boolean))];

  return {
    source: "dexscreener",
    name: best.baseToken?.name,
    symbol: best.baseToken?.symbol?.toUpperCase(),
    contractAddress: best.baseToken?.address,
    priceUsd: parseFloat(best.priceUsd) || null,
    marketCap: best.marketCap || best.fdv || null,
    volume24h: totalVolume24h,
    priceChange24h: best.priceChange?.h24,
    priceChange7d: best.priceChange?.h6 ? best.priceChange.h6 * 4 : null,
    dexLiquidityUsd: totalLiquidity,
    pairCount: pairs.length,
    exchangeCount: exchanges.length,
    topExchanges: exchanges.slice(0, 5),
    chainId: best.chainId,
    pairAddress: best.pairAddress,
    lastUpdated: new Date().toISOString(),
  };
}

module.exports = { fetchDexScreener };

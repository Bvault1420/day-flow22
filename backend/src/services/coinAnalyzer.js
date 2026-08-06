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

async function getCoinById(id) {
  return safeGet(
    `${COINGECKO_API}/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`
  );
}

async function getCoinByContract(address) {
  return safeGet(
    `${COINGECKO_API}/coins/ethereum/contract/${address.toLowerCase()}`
  );
}

function assessLiquidity(marketCap, volume24h) {
  const cap = marketCap || 0;
  const vol = volume24h || 0;

  if (cap >= 1_000_000_000 && vol >= 50_000_000) {
    return { liquidityScore: "high", enoughLiquidity: true };
  }
  if (cap >= 100_000_000 && vol >= 5_000_000) {
    return { liquidityScore: "medium", enoughLiquidity: true };
  }
  if (cap >= 10_000_000 && vol >= 500_000) {
    return { liquidityScore: "low", enoughLiquidity: true };
  }
  return { liquidityScore: "very_low", enoughLiquidity: false };
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

    if (coinData?.contract_address) {
      contractAddress = coinData.contract_address;
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

  const marketCap = coinData.market_data?.market_cap?.usd || 0;
  const volume24h = coinData.market_data?.total_volume?.usd || 0;
  const priceUsd = coinData.market_data?.current_price?.usd || 0;
  const symbol = coinData.symbol?.toUpperCase() || trimmed.toUpperCase();
  const name = coinData.name || trimmed;

  const liquidity = assessLiquidity(marketCap, volume24h);
  const isScam =
    isScamSymbol(symbol) ||
    isScamToken(contractAddress, "ethereum") ||
    coinData.categories?.includes("scam");

  return {
    type: "coin",
    name,
    symbol,
    contractAddress,
    marketCap,
    volume24h,
    priceUsd,
    liquidityScore: liquidity.liquidityScore,
    enoughLiquidity: liquidity.enoughLiquidity,
    isScam,
    marketCapRank: coinData.market_cap_rank || null,
  };
}

module.exports = { analyzeCoin };

import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export interface SubScores {
  liquidity?: number;
  marketStrength?: number;
  volatility?: number;
  safety?: number;
  community?: number;
  activity?: number;
  cleanRecord?: number;
  behavior?: number;
  maturity?: number;
}

export interface ScanDetails {
  scamExposure?: number;
  mixerUsage?: boolean;
  txCount?: number;
  nftWashTrading?: boolean;
  riskyPatterns?: {
    manySmallTransfers?: boolean;
    smallTransferCount?: number;
  };
  chain?: string;
  wallet?: string;
  resolvedName?: string;
  inputQuery?: string;
  walletAgeDays?: number | null;
  balanceUsd?: number | null;
  tokenTransferCount?: number;
  activityLevel?: string;
  // Coin fields
  name?: string;
  symbol?: string;
  coinId?: string;
  image?: string | null;
  contractAddress?: string | null;
  marketCap?: number;
  volume24h?: number;
  priceUsd?: number;
  priceChange24h?: number;
  priceChange7d?: number;
  priceChange30d?: number;
  priceChange1y?: number;
  liquidityScore?: string;
  enoughLiquidity?: boolean;
  volumeToMcapRatio?: number;
  isScam?: boolean;
  marketCapRank?: number | null;
  exchangeCount?: number;
  avgSpread?: number | null;
  topExchanges?: string[];
  circulatingSupply?: number;
  totalSupply?: number;
  maxSupply?: number | null;
  ath?: number;
  athChange?: number;
  atl?: number;
  categories?: string[];
  homepage?: string | null;
  githubStars?: number;
  githubCommits4w?: number;
  twitterFollowers?: number;
  redditSubscribers?: number;
  developerScore?: number;
  sentimentUp?: number;
  sentimentDown?: number;
  lastUpdated?: string;
  sourcesUsed?: string[];
  dataConfidence?: number;
  priceAgreement?: number;
  dexLiquidityUsd?: number;
  tvlUsd?: number | null;
  sourceSnapshots?: Array<{
    source: string;
    priceUsd?: number;
    volume24h?: number;
    marketCap?: number;
  }>;
  pairCount?: number;
  type?: "wallet" | "coin";
}

export interface ScanResult {
  score: number;
  riskLevel: "low" | "medium" | "high";
  subScores?: SubScores;
  insights?: string[];
  details: ScanDetails;
}

export interface HistoryEntry {
  id: string;
  query: string;
  score: number;
  riskLevel: string;
  chain: string;
  type: "wallet" | "coin";
  scannedAt: string;
}

const api = axios.create({
  baseURL: API_BASE,
  timeout: 45000,
});

function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.code === "ECONNABORTED") {
      return "Zeitüberschreitung — Backend läuft? cd backend && npm run dev";
    }
    const serverError = err.response?.data?.error;
    if (serverError) return serverError;
    if (err.message === "Network Error" || !err.response) {
      return "Backend nicht erreichbar. Starte: cd backend && npm run dev";
    }
    if (err.response?.status === 503) {
      return "Backend offline — starte cd backend && npm run dev";
    }
    return err.message;
  }
  return "Scan fehlgeschlagen. Bitte erneut versuchen.";
}

export async function scanWallet(wallet: string): Promise<ScanResult> {
  const { data } = await api.post<ScanResult>("/api/scan-wallet", { wallet });
  return data;
}

export async function scanCoin(coin: string): Promise<ScanResult> {
  const { data } = await api.post<ScanResult>("/api/scan-coin", { coin });
  return data;
}

export { getErrorMessage };

import axios from "axios";

// Same-origin proxy via Next.js rewrites — avoids browser network errors
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

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
  // Coin fields
  name?: string;
  symbol?: string;
  contractAddress?: string | null;
  marketCap?: number;
  volume24h?: number;
  priceUsd?: number;
  liquidityScore?: string;
  enoughLiquidity?: boolean;
  isScam?: boolean;
  marketCapRank?: number | null;
  type?: "wallet" | "coin";
}

export interface ScanResult {
  score: number;
  riskLevel: "low" | "medium" | "high";
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
  timeout: 30000,
});

function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.code === "ECONNABORTED") {
      return "Request timed out. Make sure the backend is running on port 3001.";
    }
    if (err.message === "Network Error" || !err.response) {
      return "Network error — start backend: cd backend && npm run dev";
    }
    return err.response?.data?.error || err.message;
  }
  return "Scan failed. Please try again.";
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

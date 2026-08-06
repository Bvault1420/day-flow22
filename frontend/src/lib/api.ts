import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface ScanDetails {
  scamExposure: number;
  mixerUsage: boolean;
  txCount: number;
  nftWashTrading: boolean;
  riskyPatterns?: {
    manySmallTransfers?: boolean;
    smallTransferCount?: number;
  };
  chain?: string;
  wallet?: string;
}

export interface ScanResult {
  score: number;
  riskLevel: "low" | "medium" | "high";
  details: ScanDetails;
}

export interface HistoryEntry {
  id: string;
  wallet: string;
  score: number;
  riskLevel: string;
  chain: string;
  scannedAt: string;
}

export async function scanWallet(wallet: string): Promise<ScanResult> {
  const { data } = await axios.post<ScanResult>(`${API_BASE}/api/scan-wallet`, {
    wallet,
  });
  return data;
}

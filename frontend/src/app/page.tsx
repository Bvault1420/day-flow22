"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import WalletInput from "@/components/WalletInput";
import ScoreCard from "@/components/ScoreCard";
import DetailsTable from "@/components/DetailsTable";
import HistoryList from "@/components/HistoryList";
import { scanWallet, ScanResult, HistoryEntry } from "@/lib/api";
import { getHistory, addToHistory, clearHistory } from "@/lib/history";

export default function HomePage() {
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleScan = async () => {
    if (!wallet.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await scanWallet(wallet.trim());
      setResult(data);

      const updated = addToHistory({
        wallet: wallet.trim(),
        score: data.score,
        riskLevel: data.riskLevel,
        chain: data.details.chain || "unknown",
        scannedAt: new Date().toISOString(),
      });
      setHistory(updated);
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err)
          ? err.response?.data?.error || err.message
          : "Scan failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Wallet Reputation Score
              </h1>
              <p className="text-sm text-gray-500">
                Crypto wallet risk analysis — like a Schufa for wallets
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        {/* Input */}
        <section className="flex flex-col items-center">
          <WalletInput
            value={wallet}
            onChange={setWallet}
            onScan={handleScan}
            loading={loading}
          />
          {error && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200 w-full max-w-2xl">
              {error}
            </p>
          )}
        </section>

        {/* Results */}
        {result && (
          <section className="flex flex-col items-center space-y-6">
            <ScoreCard result={result} />
            <DetailsTable details={result.details} />
          </section>
        )}

        {/* History */}
        <section className="flex flex-col items-center">
          <HistoryList entries={history} onClear={handleClearHistory} />
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-xs text-gray-400">
          Wallet Reputation Score v1.0 — Runtime analysis, no database required
        </div>
      </footer>
    </main>
  );
}

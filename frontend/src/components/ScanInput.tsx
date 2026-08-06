"use client";

import { ScanMode } from "./ScanTabs";

interface ScanInputProps {
  mode: ScanMode;
  value: string;
  onChange: (value: string) => void;
  onScan: () => void;
  loading: boolean;
}

export default function ScanInput({
  mode,
  value,
  onChange,
  onScan,
  loading,
}: ScanInputProps) {
  const isWallet = mode === "wallet";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading && value.trim()) onScan();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl card p-5">
      <label htmlFor="scan-input" className="block text-sm font-semibold text-slate-700 mb-3">
        {isWallet ? "Wallet scannen" : "Coin scannen"}
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          id="scan-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            isWallet
              ? "0x... · vitalik.eth · bc1..."
              : "BTC · Solana · PEPE · 0x..."
          }
          className="flex-1 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-mono text-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="px-8 py-3.5 bg-brand text-white font-semibold rounded-xl hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
        >
          {loading ? (
            <span className="flex items-center gap-2 justify-center">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analysiere...
            </span>
          ) : (
            "Scannen"
          )}
        </button>
      </div>
    </form>
  );
}

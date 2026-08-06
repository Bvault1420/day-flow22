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

  return (
    <div className="w-full max-w-2xl">
      <label
        htmlFor="scan-input"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {isWallet
          ? "Wallet-Adresse oder ENS-Name (ETH, BTC, Solana)"
          : "Coin Symbol, Name oder Contract-Adresse"}
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          id="scan-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            isWallet
              ? "0x... / vitalik.eth / bc1... / Solana-Adresse"
              : "BTC / Ethereum / 0x contract..."
          }
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent font-mono text-sm"
          disabled={loading}
          onKeyDown={(e) => e.key === "Enter" && !loading && value.trim() && onScan()}
        />
        <button
          onClick={onScan}
          disabled={loading || !value.trim()}
          className="px-6 py-3 bg-brand text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? "Scanning..." : isWallet ? "Scan Wallet" : "Scan Coin"}
        </button>
      </div>
      {isWallet && (
        <p className="mt-2 text-xs text-gray-400">
          Tipp: ENS-Namen wie <span className="font-mono">vitalik.eth</span> werden automatisch aufgelöst
        </p>
      )}
    </div>
  );
}

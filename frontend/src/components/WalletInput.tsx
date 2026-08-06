interface WalletInputProps {
  value: string;
  onChange: (value: string) => void;
  onScan: () => void;
  loading: boolean;
}

export default function WalletInput({
  value,
  onChange,
  onScan,
  loading,
}: WalletInputProps) {
  return (
    <div className="w-full max-w-2xl">
      <label
        htmlFor="wallet"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Wallet-Adresse (ETH, BTC, Solana)
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          id="wallet"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0x... / bc1... / Solana-Adresse"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent font-mono text-sm"
          disabled={loading}
        />
        <button
          onClick={onScan}
          disabled={loading || !value.trim()}
          className="px-6 py-3 bg-brand text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? "Scanning..." : "Scan Wallet"}
        </button>
      </div>
    </div>
  );
}

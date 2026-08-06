export type ScanMode = "wallet" | "coin";

interface ScanTabsProps {
  mode: ScanMode;
  onChange: (mode: ScanMode) => void;
}

export default function ScanTabs({ mode, onChange }: ScanTabsProps) {
  const tabs: { id: ScanMode; label: string }[] = [
    { id: "wallet", label: "Wallet Scan" },
    { id: "coin", label: "Coin Scan" },
  ];

  return (
    <div className="flex gap-2 w-full max-w-2xl mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors ${
            mode === tab.id
              ? "bg-brand text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

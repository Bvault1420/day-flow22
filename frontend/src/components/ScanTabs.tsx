"use client";

export type ScanMode = "wallet" | "coin";

interface ScanTabsProps {
  mode: ScanMode;
  onChange: (mode: ScanMode) => void;
}

export default function ScanTabs({ mode, onChange }: ScanTabsProps) {
  const tabs: { id: ScanMode; label: string; desc: string }[] = [
    { id: "wallet", label: "Wallet", desc: "Adresse oder ENS" },
    { id: "coin", label: "Coin", desc: "Symbol oder Token" },
  ];

  return (
    <div className="flex gap-3 w-full max-w-2xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${
            mode === tab.id
              ? "border-brand bg-blue-50 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <span
            className={`block text-sm font-bold ${
              mode === tab.id ? "text-brand" : "text-slate-800"
            }`}
          >
            {tab.label}
          </span>
          <span className="block text-xs text-slate-500 mt-0.5">{tab.desc}</span>
        </button>
      ))}
    </div>
  );
}

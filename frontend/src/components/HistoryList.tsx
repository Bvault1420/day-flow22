"use client";

import { HistoryEntry } from "@/lib/api";

interface HistoryListProps {
  entries: HistoryEntry[];
  onClear: () => void;
}

function getRiskColor(level: string) {
  switch (level) {
    case "low": return "text-emerald-600 bg-emerald-50";
    case "medium": return "text-amber-600 bg-amber-50";
    case "high": return "text-red-600 bg-red-50";
    default: return "text-slate-500 bg-slate-50";
  }
}

export default function HistoryList({ entries, onClear }: HistoryListProps) {
  if (!entries.length) {
    return (
      <div className="max-w-2xl mx-auto text-center py-10 text-slate-400 text-sm">
        Noch keine Scans — gib eine Wallet oder Coin ein.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Historie</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-red-500 transition-colors"
        >
          Löschen
        </button>
      </div>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.id} className="card flex items-center justify-between p-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                  {entry.type}
                </span>
                <p className="font-mono text-sm text-slate-700 truncate">{entry.query}</p>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(entry.scannedAt).toLocaleString("de-DE")}
              </p>
            </div>
            <div className="ml-4 flex items-center gap-3">
              <span className="text-2xl font-black text-slate-800">{entry.score}</span>
              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${getRiskColor(entry.riskLevel)}`}>
                {entry.riskLevel}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

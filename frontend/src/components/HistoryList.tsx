"use client";

import { HistoryEntry } from "@/lib/api";

interface HistoryListProps {
  entries: HistoryEntry[];
  onClear: () => void;
}

function getRiskColor(level: string) {
  switch (level) {
    case "low":
      return "text-green-600";
    case "medium":
      return "text-yellow-600";
    case "high":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

export default function HistoryList({ entries, onClear }: HistoryListProps) {
  if (entries.length === 0) {
    return (
      <div className="w-full max-w-2xl text-center py-8 text-gray-400">
        No scans yet. Enter a wallet or coin to get started.
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Scan History</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          Clear history
        </button>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-brand/30 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${
                    entry.type === "coin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {entry.type}
                </span>
                <p className="font-mono text-sm text-gray-800 truncate">
                  {entry.query}
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(entry.scannedAt).toLocaleString("de-DE")} ·{" "}
                <span className="capitalize">{entry.chain}</span>
              </p>
            </div>
            <div className="ml-4 text-right">
              <p className="text-2xl font-bold text-gray-900">{entry.score}</p>
              <p
                className={`text-xs font-semibold uppercase ${getRiskColor(
                  entry.riskLevel
                )}`}
              >
                {entry.riskLevel}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

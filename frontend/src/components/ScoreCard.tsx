"use client";

"use client";

import { ScanResult } from "@/lib/api";

interface ScoreCardProps {
  result: ScanResult;
  mode: "wallet" | "coin";
}

function getRiskStyles(level: string) {
  switch (level) {
    case "low":
      return { ring: "ring-green-200", text: "text-green-600", badge: "bg-green-100 text-green-800", label: "Niedrig" };
    case "medium":
      return { ring: "ring-yellow-200", text: "text-yellow-600", badge: "bg-yellow-100 text-yellow-800", label: "Mittel" };
    case "high":
      return { ring: "ring-red-200", text: "text-red-600", badge: "bg-red-100 text-red-800", label: "Hoch" };
    default:
      return { ring: "ring-slate-200", text: "text-slate-600", badge: "bg-slate-100 text-slate-800", label: "—" };
  }
}

export default function ScoreCard({ result, mode }: ScoreCardProps) {
  const styles = getRiskStyles(result.riskLevel);

  return (
    <div className={`w-full max-w-2xl card p-8 ring-4 ${styles.ring}`}>
      <div className="flex flex-col items-center text-center">
        {mode === "coin" && result.details.image && (
          <img
            src={result.details.image}
            alt={result.details.symbol || ""}
            className="w-14 h-14 rounded-full mb-4 shadow-md"
          />
        )}

        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
          {mode === "coin" ? "Safety Score" : "Reputation Score"}
        </p>

        <div className={`text-8xl font-black ${styles.text} leading-none mb-3`}>
          {result.score}
        </div>

        <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${styles.badge}`}>
          {styles.label} Risiko
        </span>

        {mode === "coin" && result.details.name && (
          <p className="mt-5 text-lg font-bold text-slate-800">
            {result.details.name}
            {result.details.symbol && (
              <span className="text-slate-400 font-normal ml-1">{result.details.symbol}</span>
            )}
          </p>
        )}

        {mode === "wallet" && result.details.resolvedName && (
          <p className="mt-4 text-sm text-slate-500 font-mono">{result.details.resolvedName}</p>
        )}

        {result.details.chain && mode === "wallet" && (
          <p className="mt-1 text-xs text-slate-400 capitalize">{result.details.chain}</p>
        )}
      </div>
    </div>
  );
}

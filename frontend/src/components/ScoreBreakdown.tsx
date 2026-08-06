"use client";

import { SubScores } from "@/lib/api";

interface ScoreBreakdownProps {
  subScores: SubScores;
  mode: "wallet" | "coin";
}

const COIN_LABELS: Record<string, string> = {
  liquidity: "Liquidität",
  marketStrength: "Markt",
  volatility: "Stabilität",
  safety: "Sicherheit",
  community: "Community",
};

const WALLET_LABELS: Record<string, string> = {
  activity: "Aktivität",
  cleanRecord: "Historie",
  behavior: "Verhalten",
  maturity: "Reife",
};

function barColor(score: number) {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-400";
  return "bg-red-500";
}

export default function ScoreBreakdown({ subScores, mode }: ScoreBreakdownProps) {
  const labels = mode === "coin" ? COIN_LABELS : WALLET_LABELS;
  const entries = Object.entries(subScores).filter(([k]) => labels[k]);

  if (!entries.length) return null;

  return (
    <div className="w-full max-w-2xl card p-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">
        Score Aufschlüsselung
      </h3>
      <div className="space-y-4">
        {entries.map(([key, value]) => (
          <div key={key}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-slate-600 font-medium">{labels[key]}</span>
              <span className="font-bold text-slate-900">{value}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor(value)} transition-all duration-500`}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

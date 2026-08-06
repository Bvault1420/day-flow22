import { SubScores } from "@/lib/api";

interface ScoreBreakdownProps {
  subScores: SubScores;
  mode: "wallet" | "coin";
}

const COIN_LABELS: Record<string, string> = {
  liquidity: "Liquidität",
  marketStrength: "Marktstärke",
  volatility: "Stabilität",
  safety: "Sicherheit",
  community: "Community",
};

const WALLET_LABELS: Record<string, string> = {
  activity: "Aktivität",
  cleanRecord: "Saubere Historie",
  behavior: "Verhalten",
  maturity: "Reife",
};

function getBarColor(score: number) {
  if (score >= 75) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

export default function ScoreBreakdown({ subScores, mode }: ScoreBreakdownProps) {
  const labels = mode === "coin" ? COIN_LABELS : WALLET_LABELS;
  const entries = Object.entries(subScores).filter(([key]) => labels[key]);

  if (entries.length === 0) return null;

  return (
    <div className="w-full max-w-2xl rounded-xl border border-gray-200 p-6 bg-white">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
        Score Breakdown
      </h3>
      <div className="space-y-4">
        {entries.map(([key, value]) => (
          <div key={key}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{labels[key]}</span>
              <span className="font-semibold text-gray-900">{value}/100</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getBarColor(value)}`}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

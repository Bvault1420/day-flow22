import { ScanResult } from "@/lib/api";

interface ScoreCardProps {
  result: ScanResult;
  mode: "wallet" | "coin";
}

function getRiskStyles(level: string) {
  switch (level) {
    case "low":
      return {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        badge: "bg-green-100 text-green-800",
        label: "Niedriges Risiko",
      };
    case "medium":
      return {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-700",
        badge: "bg-yellow-100 text-yellow-800",
        label: "Mittleres Risiko",
      };
    case "high":
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        badge: "bg-red-100 text-red-800",
        label: "Hohes Risiko",
      };
    default:
      return {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-700",
        badge: "bg-gray-100 text-gray-800",
        label: "Unknown",
      };
  }
}

export default function ScoreCard({ result, mode }: ScoreCardProps) {
  const styles = getRiskStyles(result.riskLevel);
  const title =
    mode === "coin" ? "Coin Safety Score" : "Wallet Reputation Score";

  return (
    <div
      className={`w-full max-w-2xl rounded-2xl border-2 ${styles.border} ${styles.bg} p-8 text-center`}
    >
      <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
        {title}
      </p>
      <div className={`text-7xl font-bold ${styles.text} mb-4`}>
        {result.score}
      </div>
      <span
        className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${styles.badge}`}
      >
        {styles.label}
      </span>

      {mode === "coin" && result.details.symbol && (
        <p className="mt-4 text-lg font-semibold text-gray-800">
          {result.details.name} ({result.details.symbol})
        </p>
      )}

      {mode === "wallet" && result.details.resolvedName && (
        <p className="mt-4 text-sm text-gray-500">
          Resolved:{" "}
          <span className="font-mono font-medium">{result.details.resolvedName}</span>
        </p>
      )}

      {result.details.chain && mode === "wallet" && (
        <p className="mt-2 text-sm text-gray-500">
          Chain: <span className="font-medium capitalize">{result.details.chain}</span>
        </p>
      )}
    </div>
  );
}

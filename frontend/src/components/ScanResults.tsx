import { ScanResult } from "@/lib/api";
import ScoreCard from "./ScoreCard";
import ScoreBreakdown from "./ScoreBreakdown";
import InsightsPanel from "./InsightsPanel";
import SourcesPanel from "./SourcesPanel";
import DetailsTable from "./DetailsTable";

interface ScanResultsProps {
  result: ScanResult;
  mode: "wallet" | "coin";
}

export default function ScanResults({ result, mode }: ScanResultsProps) {
  return (
    <div className="space-y-5">
      <ScoreCard result={result} mode={mode} />
      {result.subScores && <ScoreBreakdown subScores={result.subScores} mode={mode} />}
      {mode === "coin" && <SourcesPanel details={result.details} />}
      {result.insights && <InsightsPanel insights={result.insights} />}
      <DetailsTable details={result.details} mode={mode} />
    </div>
  );
}

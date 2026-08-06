"use client";

interface InsightsPanelProps {
  insights: string[];
}

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  if (!insights.length) return null;

  return (
    <div className="w-full max-w-2xl card p-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
        Analyse
      </h3>
      <ul className="space-y-3">
        {insights.map((insight, i) => (
          <li key={i} className="text-sm text-slate-600 leading-relaxed pl-4 border-l-2 border-brand/30">
            {insight}
          </li>
        ))}
      </ul>
    </div>
  );
}

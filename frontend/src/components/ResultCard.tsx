interface Result {
  score: number;
  riskLevel: string;
  insights?: string[];
  details: Record<string, unknown>;
}

function riskStyle(level: string) {
  if (level === "low") return { ring: "ring-green-200", text: "text-green-600", badge: "bg-green-100 text-green-800" };
  if (level === "medium") return { ring: "ring-amber-200", text: "text-amber-600", badge: "bg-amber-100 text-amber-800" };
  return { ring: "ring-red-200", text: "text-red-600", badge: "bg-red-100 text-red-800" };
}

export default function ResultCard({ result, mode }: { result: Result; mode: "wallet" | "coin" }) {
  const s = riskStyle(result.riskLevel);
  const d = result.details;
  return (
    <div className={`card p-8 max-w-2xl w-full ring-4 ${s.ring} text-center`}>
      {mode === "coin" && typeof d.image === "string" && (
        <img src={d.image} alt="" className="w-14 h-14 rounded-full mx-auto mb-4 shadow" />
      )}
      <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Score</p>
      <div className={`text-7xl font-black ${s.text} mb-3`}>{result.score}</div>
      <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${s.badge}`}>
        {result.riskLevel} Risiko
      </span>
      {mode === "coin" && typeof d.name === "string" && (
        <p className="mt-4 font-bold text-slate-800">{d.name} {typeof d.symbol === "string" && <span className="text-slate-400">{d.symbol}</span>}</p>
      )}
      {result.insights && (
        <ul className="mt-6 text-left text-sm text-slate-600 space-y-2">
          {result.insights.map((t, i) => (
            <li key={i} className="pl-3 border-l-2 border-brand/30">{t}</li>
          ))}
        </ul>
      )}
      {Array.isArray(d.sourcesUsed) && (
        <div className="mt-4 flex flex-wrap gap-1 justify-center">
          {(d.sourcesUsed as string[]).map((src) => (
            <span key={src} className="text-xs px-2 py-0.5 bg-slate-100 rounded capitalize">{src}</span>
          ))}
        </div>
      )}
    </div>
  );
}

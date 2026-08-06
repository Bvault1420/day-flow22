"use client";

import { ScanDetails } from "@/lib/api";

interface SourcesPanelProps {
  details: ScanDetails;
}

export default function SourcesPanel({ details }: SourcesPanelProps) {
  const sources = details.sourcesUsed || [];
  const snapshots = details.sourceSnapshots || [];

  if (!sources.length) return null;

  return (
    <div className="w-full max-w-2xl card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Datenquellen
        </h3>
        <div className="flex gap-2 text-xs font-semibold">
          <span className="px-2.5 py-1 bg-blue-50 text-brand rounded-lg">
            {details.dataConfidence ?? "—"}% Confidence
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {sources.map((s) => (
          <span
            key={s}
            className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium capitalize"
          >
            {s}
          </span>
        ))}
      </div>

      {snapshots.length > 0 && (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-xs min-w-[300px]">
            <thead>
              <tr className="text-slate-400">
                <th className="py-2 px-2 text-left">Quelle</th>
                <th className="py-2 px-2 text-right">Preis</th>
                <th className="py-2 px-2 text-right">Volume</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((s) => (
                <tr key={s.source} className="border-t border-slate-50">
                  <td className="py-2 px-2 capitalize font-medium text-slate-700">{s.source}</td>
                  <td className="py-2 px-2 text-right font-mono text-slate-600">
                    {s.priceUsd
                      ? `$${s.priceUsd.toLocaleString(undefined, { maximumFractionDigits: 4 })}`
                      : "—"}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-slate-600">
                    {s.volume24h ? `$${(s.volume24h / 1e6).toFixed(1)}M` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

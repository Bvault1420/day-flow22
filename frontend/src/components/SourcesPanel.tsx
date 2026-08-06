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
    <div className="w-full max-w-2xl rounded-xl border border-gray-200 p-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Multi-Source Pipeline
        </h3>
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold">
            Confidence: {details.dataConfidence ?? "—"}%
          </span>
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">
            Agreement: {details.priceAgreement ?? "—"}%
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {sources.map((s) => (
          <span
            key={s}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize"
          >
            {s}
          </span>
        ))}
      </div>

      {snapshots.length > 0 && (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="py-2 text-left">Quelle</th>
              <th className="py-2 text-right">Preis</th>
              <th className="py-2 text-right">Volume</th>
              <th className="py-2 text-right">MCap</th>
            </tr>
          </thead>
          <tbody>
            {snapshots.map((s) => (
              <tr key={s.source} className="border-b border-gray-50">
                <td className="py-2 capitalize font-medium">{s.source}</td>
                <td className="py-2 text-right font-mono">
                  {s.priceUsd ? `$${s.priceUsd.toLocaleString(undefined, { maximumFractionDigits: 6 })}` : "—"}
                </td>
                <td className="py-2 text-right font-mono">
                  {s.volume24h ? `$${(s.volume24h / 1e6).toFixed(2)}M` : "—"}
                </td>
                <td className="py-2 text-right font-mono">
                  {s.marketCap ? `$${(s.marketCap / 1e9).toFixed(2)}B` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

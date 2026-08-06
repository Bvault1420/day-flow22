import { ScanDetails } from "@/lib/api";

interface DetailsTableProps {
  details: ScanDetails;
  mode: "wallet" | "coin";
}

function BoolBadge({ value }: { value: boolean }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
        value ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
      }`}
    >
      {value ? "Yes" : "No"}
    </span>
  );
}

function formatUsd(value?: number) {
  if (!value) return "$0";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

export default function DetailsTable({ details, mode }: DetailsTableProps) {
  const walletRows = [
    { label: "Transaction Count", value: (details.txCount ?? 0).toString() },
    { label: "Scam Exposure", value: (details.scamExposure ?? 0).toString() },
    { label: "Mixer Usage", value: <BoolBadge value={details.mixerUsage ?? false} /> },
    {
      label: "NFT Wash Trading",
      value: <BoolBadge value={details.nftWashTrading ?? false} />,
    },
    {
      label: "Many Small Transfers",
      value: (
        <BoolBadge value={details.riskyPatterns?.manySmallTransfers ?? false} />
      ),
    },
  ];

  const coinRows = [
    { label: "Price (USD)", value: formatUsd(details.priceUsd) },
    { label: "Market Cap", value: formatUsd(details.marketCap) },
    { label: "24h Volume", value: formatUsd(details.volume24h) },
    {
      label: "Liquidity Score",
      value: details.liquidityScore?.replace("_", " ") || "unknown",
    },
    {
      label: "Scam / Rug Risk",
      value: <BoolBadge value={details.isScam ?? false} />,
    },
    {
      label: "Market Cap Rank",
      value: details.marketCapRank ? `#${details.marketCapRank}` : "N/A",
    },
  ];

  // Fix inverted logic for enoughLiquidity badge - show green when enough
  const coinRowsFixed = coinRows.map((row) => {
    if (row.label === "Enough Liquidity") {
      return {
        label: "Enough Liquidity",
        value: (
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
              details.enoughLiquidity
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {details.enoughLiquidity ? "Yes" : "No"}
          </span>
        ),
      };
    }
    return row;
  });

  const rows = mode === "coin" ? coinRowsFixed : walletRows;

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-3 text-left font-semibold text-gray-700">
              Analysis Detail
            </th>
            <th className="px-6 py-3 text-right font-semibold text-gray-700">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.label}
              className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="px-6 py-3 text-gray-600">{row.label}</td>
              <td className="px-6 py-3 text-right font-medium text-gray-900">
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

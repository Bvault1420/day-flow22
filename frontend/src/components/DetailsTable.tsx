import { ScanDetails } from "@/lib/api";

interface DetailsTableProps {
  details: ScanDetails;
  mode: "wallet" | "coin";
}

function BoolBadge({ value, invert }: { value: boolean; invert?: boolean }) {
  const isBad = invert ? !value : value;
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
        isBad ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
      }`}
    >
      {invert ? (value ? "Yes" : "No") : value ? "Yes" : "No"}
    </span>
  );
}

function formatUsd(value?: number) {
  if (!value) return "$0";
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

function pct(value?: number) {
  if (value == null) return "—";
  return `${value.toFixed(2)}%`;
}

function formatNum(value?: number) {
  if (value == null) return "—";
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString();
}

export default function DetailsTable({ details, mode }: DetailsTableProps) {
  const walletRows = [
    { label: "Transaktionen", value: (details.txCount ?? 0).toString() },
    { label: "Aktivitätslevel", value: details.activityLevel || "—" },
    { label: "Wallet-Alter (Tage)", value: details.walletAgeDays?.toString() || "—" },
    { label: "Balance (USD)", value: details.balanceUsd ? formatUsd(details.balanceUsd) : "—" },
    { label: "Token Transfers", value: (details.tokenTransferCount ?? "—").toString() },
    { label: "Scam Exposure", value: (details.scamExposure ?? 0).toString() },
    { label: "Mixer Nutzung", value: <BoolBadge value={details.mixerUsage ?? false} /> },
    { label: "NFT Wash Trading", value: <BoolBadge value={details.nftWashTrading ?? false} /> },
    {
      label: "Kleine Transfers",
      value: <BoolBadge value={details.riskyPatterns?.manySmallTransfers ?? false} />,
    },
  ];

  const coinRows = [
    { label: "Preis (USD)", value: formatUsd(details.priceUsd) },
    { label: "24h Änderung", value: pct(details.priceChange24h) },
    { label: "7d Änderung", value: pct(details.priceChange7d) },
    { label: "30d Änderung", value: pct(details.priceChange30d) },
    { label: "1y Änderung", value: pct(details.priceChange1y) },
    { label: "Market Cap", value: formatUsd(details.marketCap) },
    { label: "Market Cap Rang", value: details.marketCapRank ? `#${details.marketCapRank}` : "—" },
    { label: "24h Volumen", value: formatUsd(details.volume24h) },
    { label: "Vol/MCap Ratio", value: pct((details.volumeToMcapRatio ?? 0) * 100) },
    { label: "Liquidität", value: details.liquidityScore?.replace("_", " ") || "—" },
    {
      label: "Genug Liquidität",
      value: <BoolBadge value={details.enoughLiquidity ?? false} invert />,
    },
    { label: "Börsen", value: (details.exchangeCount ?? "—").toString() },
    { label: "Avg. Spread", value: details.avgSpread ? pct(details.avgSpread) : "—" },
    { label: "ATH", value: details.ath ? formatUsd(details.ath) : "—" },
    { label: "ATH Abstand", value: pct(details.athChange) },
    { label: "ATL", value: details.atl ? formatUsd(details.atl) : "—" },
    { label: "Circulating Supply", value: formatNum(details.circulatingSupply) },
    { label: "GitHub Stars", value: formatNum(details.githubStars) },
    { label: "GitHub Commits (4w)", value: (details.githubCommits4w ?? "—").toString() },
    { label: "Twitter Follower", value: formatNum(details.twitterFollowers) },
    { label: "Reddit", value: formatNum(details.redditSubscribers) },
    { label: "Sentiment Up", value: pct(details.sentimentUp) },
    { label: "Scam / Rug", value: <BoolBadge value={details.isScam ?? false} /> },
    {
      label: "Top Börsen",
      value: details.topExchanges?.join(", ") || "—",
    },
    {
      label: "Letztes Update",
      value: details.lastUpdated
        ? new Date(details.lastUpdated).toLocaleString("de-DE")
        : "—",
    },
  ];

  const rows = mode === "coin" ? coinRows : walletRows;

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200">
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">Detaildaten (Live via CoinGecko / Blockchain)</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-3 text-left font-semibold text-gray-700">Feld</th>
            <th className="px-6 py-3 text-right font-semibold text-gray-700">Wert</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-6 py-3 text-gray-600">{row.label}</td>
              <td className="px-6 py-3 text-right font-medium text-gray-900 max-w-xs truncate">
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

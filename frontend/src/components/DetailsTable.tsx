import { ScanDetails } from "@/lib/api";

interface DetailsTableProps {
  details: ScanDetails;
}

function BoolBadge({ value }: { value: boolean }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
        value
          ? "bg-red-100 text-red-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {value ? "Yes" : "No"}
    </span>
  );
}

export default function DetailsTable({ details }: DetailsTableProps) {
  const rows = [
    { label: "Transaction Count", value: details.txCount.toString() },
    { label: "Scam Exposure", value: details.scamExposure.toString() },
    { label: "Mixer Usage", value: <BoolBadge value={details.mixerUsage} /> },
    {
      label: "NFT Wash Trading",
      value: <BoolBadge value={details.nftWashTrading} />,
    },
    {
      label: "Many Small Transfers",
      value: (
        <BoolBadge value={details.riskyPatterns?.manySmallTransfers ?? false} />
      ),
    },
  ];

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

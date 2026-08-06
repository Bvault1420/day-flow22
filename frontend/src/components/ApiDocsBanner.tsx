"use client";

interface ApiDocsBannerProps {
  onCheckHealth: () => void;
  backendStatus: string;
}

export default function ApiDocsBanner({ onCheckHealth, backendStatus }: ApiDocsBannerProps) {
  return (
    <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-800">API verfügbar</p>
          <p className="text-gray-500 text-xs mt-1">
            Nutze die Backend-API direkt:{" "}
            <code className="bg-white px-1 rounded">GET /api/v1/coin/BTC</code>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCheckHealth}
            className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Backend: {backendStatus}
          </button>
          <a
            href="http://localhost:3001/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-medium bg-brand text-white rounded-lg hover:bg-blue-600"
          >
            API Docs
          </a>
        </div>
      </div>
    </div>
  );
}

import { cookies } from "next/headers";
import Header from "@/components/Header";
import NavTabs from "@/components/NavTabs";
import ScanForm from "@/components/ScanForm";
import ScanResults from "@/components/ScanResults";
import { scanCoinAction } from "../actions";
import { ScanResult } from "@/lib/api";

export default async function CoinPage() {
  const cookieStore = await cookies();
  const error = cookieStore.get("scan_error")?.value;
  const resultRaw = cookieStore.get("scan_result")?.value;

  let scanData: { query: string; data: ScanResult } | null = null;

  if (resultRaw) {
    try {
      const parsed = JSON.parse(resultRaw);
      if (parsed.type === "coin") {
        scanData = { query: parsed.query, data: parsed.data };
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <NavTabs active="coin" />
        <ScanForm
          action={scanCoinAction}
          label="Coin scannen"
          placeholder="BTC · Solana · PEPE · 0x..."
          defaultValue={scanData?.query}
        />

        {error && (
          <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {scanData && <ScanResults result={scanData.data} mode="coin" />}
      </div>
      <footer className="text-center py-8 text-xs text-slate-400">
        Wallet Reputation Score
      </footer>
    </main>
  );
}

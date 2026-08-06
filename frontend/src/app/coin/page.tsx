import { cookies } from "next/headers";
import Header from "@/components/Header";
import Nav from "@/components/Nav";
import ScanForm from "@/components/ScanForm";
import ResultCard from "@/components/ResultCard";
import { scanCoinAction } from "../actions";

export default async function CoinPage() {
  const c = await cookies();
  const err = c.get("err")?.value;
  const raw = c.get("result")?.value;
  let result = null;
  let query = "";
  if (raw) {
    try {
      const p = JSON.parse(raw);
      if (p.t === "coin") { result = p.d; query = p.q; }
    } catch { /* */ }
  }

  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5 flex flex-col items-center">
        <Nav active="coin" />
        <ScanForm action={scanCoinAction} label="Coin scannen" placeholder="BTC · Solana · PEPE · 0x..." defaultValue={query} />
        {err && <div className="max-w-2xl w-full p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">{err}</div>}
        {result && <ResultCard result={result} mode="coin" />}
      </div>
    </main>
  );
}

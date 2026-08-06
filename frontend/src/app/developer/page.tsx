import { cookies } from "next/headers";
import Header from "@/components/Header";
import { createKeyAction } from "../actions";

export default async function DeveloperPage() {
  const c = await cookies();
  const keyErr = c.get("keyerr")?.value;
  const newKeyRaw = c.get("newkey")?.value;
  let newKey: { key: string; meta: { name: string; prefix: string } } | null = null;
  if (newKeyRaw) {
    try { newKey = JSON.parse(newKeyRaw); } catch { /* */ }
  }

  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="card p-6">
          <h1 className="text-xl font-bold text-slate-800 mb-2">Developer API</h1>
          <p className="text-sm text-slate-500 mb-6">
            Erstelle einen API-Key und binde die Wallet Reputation API in deine eigene Website oder App ein.
          </p>

          <form action={createKeyAction} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">App Name</label>
              <input name="name" type="text" required placeholder="Meine Crypto App"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail</label>
              <input name="email" type="email" required placeholder="you@example.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
            </div>
            <button type="submit" className="px-6 py-3 bg-brand text-white font-bold rounded-xl hover:bg-blue-600 cursor-pointer">
              API-Key erstellen
            </button>
          </form>

          {keyErr && <p className="mt-4 text-sm text-red-600">{keyErr}</p>}

          {newKey && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm font-bold text-green-800 mb-2">Dein API-Key (nur jetzt sichtbar!):</p>
              <code className="block p-3 bg-white rounded-lg text-xs font-mono break-all border">{newKey.key}</code>
              <p className="text-xs text-green-700 mt-2">Speichere ihn sicher — er wird nicht erneut angezeigt.</p>
            </div>
          )}
        </div>

        <div className="card p-6 space-y-4 text-sm text-slate-600">
          <h2 className="font-bold text-slate-800">Nutzung</h2>
          <pre className="p-4 bg-slate-50 rounded-xl text-xs overflow-x-auto font-mono">
{`# Wallet scannen
curl -H "X-API-Key: wrs_..." \\
  http://localhost:3001/api/v1/wallet/vitalik.eth

# Coin scannen
curl -H "X-API-Key: wrs_..." \\
  http://localhost:3001/api/v1/coin/BTC`}
          </pre>
          <p>Header: <code className="bg-slate-100 px-1 rounded">X-API-Key</code> oder <code className="bg-slate-100 px-1 rounded">Authorization: Bearer wrs_...</code></p>
          <p>Rate Limit: 30 Requests/Minute pro Key</p>
        </div>
      </div>
    </main>
  );
}

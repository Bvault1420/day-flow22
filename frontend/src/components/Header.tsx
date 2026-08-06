import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-slate-900 text-white">
      <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">Wallet Reputation</div>
            <div className="text-slate-400 text-xs">Crypto Risiko-Analyse</div>
          </div>
        </Link>
        <Link href="/developer" className="text-xs text-slate-300 hover:text-white no-underline px-3 py-1.5 rounded-lg border border-slate-700">
          API
        </Link>
      </div>
    </header>
  );
}

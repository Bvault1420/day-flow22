import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">404</h1>
        <p className="text-slate-500 mb-6">Seite nicht gefunden</p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600"
        >
          Zur Startseite
        </Link>
      </div>
    </main>
  );
}

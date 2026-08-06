"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md text-center card p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Fehler</h2>
        <p className="text-sm text-slate-500 mb-6">
          {error.message || "Ein Fehler ist aufgetreten."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600"
        >
          Erneut versuchen
        </button>
      </div>
    </main>
  );
}

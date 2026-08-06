import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <Link href="/" className="text-brand font-semibold">Zur Startseite</Link>
      </div>
    </main>
  );
}

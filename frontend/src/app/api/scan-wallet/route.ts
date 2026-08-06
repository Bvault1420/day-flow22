import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://127.0.0.1:3001";

async function proxyToBackend(path: string, body: unknown) {
  const res = await fetch(`${BACKEND}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(45000),
  });

  const text = await res.text();
  let data: { error?: string };
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: "Ungültige Server-Antwort" };
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: data.error || "Scan fehlgeschlagen. Bitte erneut versuchen." },
      { status: res.status === 400 ? 400 : 503 }
    );
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return await proxyToBackend("/api/scan-wallet", body);
  } catch {
    return NextResponse.json(
      {
        error:
          "Backend nicht erreichbar. Starte zuerst: cd backend && npm run dev",
      },
      { status: 503 }
    );
  }
}

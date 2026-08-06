import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://127.0.0.1:3001";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    return NextResponse.json({ frontend: "ok", backend: data });
  } catch {
    return NextResponse.json(
      { frontend: "ok", backend: { status: "offline" } },
      { status: 503 }
    );
  }
}

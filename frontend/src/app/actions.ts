"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const BACKEND = process.env.BACKEND_URL || "http://127.0.0.1:3001";

async function callBackend(path: string, body: object) {
  const res = await fetch(`${BACKEND}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(45000),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Scan fehlgeschlagen");
  return data;
}

export async function scanWalletAction(formData: FormData) {
  const query = formData.get("query")?.toString()?.trim();

  const cookieStore = await cookies();

  if (!query) {
    cookieStore.set("scan_error", "Bitte eine Wallet-Adresse eingeben", { maxAge: 30 });
    redirect("/");
  }

  try {
    const data = await callBackend("/api/scan-wallet", { wallet: query });
    cookieStore.set(
      "scan_result",
      JSON.stringify({ type: "wallet", query, data }),
      { maxAge: 300 }
    );
    cookieStore.delete("scan_error");
  } catch (err) {
    cookieStore.set(
      "scan_error",
      err instanceof Error ? err.message : "Backend nicht erreichbar",
      { maxAge: 30 }
    );
    cookieStore.delete("scan_result");
  }

  redirect("/");
}

export async function scanCoinAction(formData: FormData) {
  const query = formData.get("query")?.toString()?.trim();

  const cookieStore = await cookies();

  if (!query) {
    cookieStore.set("scan_error", "Bitte einen Coin eingeben", { maxAge: 30 });
    redirect("/coin");
  }

  try {
    const data = await callBackend("/api/scan-coin", { coin: query });
    cookieStore.set(
      "scan_result",
      JSON.stringify({ type: "coin", query, data }),
      { maxAge: 300 }
    );
    cookieStore.delete("scan_error");
  } catch (err) {
    cookieStore.set(
      "scan_error",
      err instanceof Error ? err.message : "Backend nicht erreichbar",
      { maxAge: 30 }
    );
    cookieStore.delete("scan_result");
  }

  redirect("/coin");
}

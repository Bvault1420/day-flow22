"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API = process.env.BACKEND_URL || "http://127.0.0.1:3001";

async function callApi(path: string, body: object) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(45000),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Fehler");
  return data;
}

export async function scanWalletAction(formData: FormData) {
  const query = formData.get("query")?.toString()?.trim();
  const store = await cookies();
  if (!query) {
    store.set("err", "Bitte Adresse eingeben", { maxAge: 20 });
    redirect("/");
  }
  try {
    const data = await callApi("/api/scan-wallet", { wallet: query });
    store.set("result", JSON.stringify({ t: "wallet", q: query, d: data }), { maxAge: 300 });
    store.delete("err");
  } catch (e) {
    store.set("err", e instanceof Error ? e.message : "Fehler", { maxAge: 30 });
    store.delete("result");
  }
  redirect("/");
}

export async function scanCoinAction(formData: FormData) {
  const query = formData.get("query")?.toString()?.trim();
  const store = await cookies();
  if (!query) {
    store.set("err", "Bitte Coin eingeben", { maxAge: 20 });
    redirect("/coin");
  }
  try {
    const data = await callApi("/api/scan-coin", { coin: query });
    store.set("result", JSON.stringify({ t: "coin", q: query, d: data }), { maxAge: 300 });
    store.delete("err");
  } catch (e) {
    store.set("err", e instanceof Error ? e.message : "Fehler", { maxAge: 30 });
    store.delete("result");
  }
  redirect("/coin");
}

export async function createKeyAction(formData: FormData) {
  const name = formData.get("name")?.toString()?.trim() || "Developer";
  const email = formData.get("email")?.toString()?.trim() || "dev@local";
  const store = await cookies();
  try {
    const res = await fetch(`${API}/api/keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Key-Erstellung fehlgeschlagen");
    store.set("newkey", JSON.stringify({ key: data.apiKey, meta: data.meta }), { maxAge: 120 });
    store.delete("keyerr");
  } catch (e) {
    store.set("keyerr", e instanceof Error ? e.message : "Fehler", { maxAge: 30 });
    store.delete("newkey");
  }
  redirect("/developer");
}

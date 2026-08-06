import { HistoryEntry } from "./api";

const STORAGE_KEY = "wallet-reputation-history";

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    // Migrate old entries
    return parsed.map((e: HistoryEntry & { wallet?: string }) => ({
      ...e,
      query: e.query || e.wallet || "",
      type: e.type || "wallet",
    }));
  } catch {
    return [];
  }
}

export function addToHistory(entry: Omit<HistoryEntry, "id">): HistoryEntry[] {
  const history = getHistory();
  const newEntry: HistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  };
  const updated = [newEntry, ...history].slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

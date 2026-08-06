import Link from "next/link";

export default function Nav({ active }: { active: "wallet" | "coin" }) {
  const items = [
    { id: "wallet" as const, href: "/", label: "Wallet" },
    { id: "coin" as const, href: "/coin", label: "Coin" },
  ];
  return (
    <div className="flex gap-2 max-w-2xl w-full">
      {items.map((i) => (
        <Link
          key={i.id}
          href={i.href}
          className={`flex-1 text-center py-3 rounded-xl font-semibold text-sm no-underline transition-colors ${
            active === i.id ? "bg-brand text-white shadow-lg shadow-blue-500/20" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          {i.label}
        </Link>
      ))}
    </div>
  );
}

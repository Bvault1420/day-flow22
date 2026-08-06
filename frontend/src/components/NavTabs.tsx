import Link from "next/link";

export default function NavTabs({ active }: { active: "wallet" | "coin" }) {
  const tabs = [
    { id: "wallet" as const, href: "/", label: "Wallet", desc: "Adresse oder ENS" },
    { id: "coin" as const, href: "/coin", label: "Coin", desc: "Symbol oder Token" },
  ];

  return (
    <div className="flex gap-3 w-full max-w-2xl">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={`flex-1 p-4 rounded-xl border-2 transition-all text-left no-underline ${
            active === tab.id
              ? "border-brand bg-blue-50 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <span
            className={`block text-sm font-bold ${
              active === tab.id ? "text-brand" : "text-slate-800"
            }`}
          >
            {tab.label}
          </span>
          <span className="block text-xs text-slate-500 mt-0.5">{tab.desc}</span>
        </Link>
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Shared tab bar for every page under /dashboard.
const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Cash Flow", href: "/dashboard/cash-flow" },
  { label: "Salary Planner", href: "/dashboard/salary-plan" },
  { label: "Investments", href: "/dashboard/investments" },
  { label: "Simulator", href: "/dashboard/simulator" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-2.5 shadow-xl">
          <nav aria-label="Dashboard sections" className="flex items-center gap-1.5 overflow-x-auto p-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
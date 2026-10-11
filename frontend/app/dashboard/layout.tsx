/*
 * THEORY: Persistent Sub-Route Layout & Visual Hierarchy
 * -------------------------------------------------------
 * In Next.js App Router, dashboard/layout.tsx wraps every child page 
 * (/dashboard, /dashboard/cash-flow, /dashboard/investments, /dashboard/affordability).
 * Moving the sub-navigation into this layout prevents DOM re-mounting 
 * and unifies the sub-header styling across the entire authenticated portal.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { label: "Executive Summary", href: "/dashboard" },
    { label: "Cash Flow", href: "/dashboard/cash-flow" },
    { label: "Investments & Portfolio", href: "/dashboard/investments" },
    { label: "Affordability Engine", href: "/dashboard/affordability" },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Enterprise Command Sub-Navbar */}
        <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-2.5 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Module Links */}
          <nav className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto p-1 scrollbar-none">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Telemetry Status Indicator */}
          <div className="hidden md:flex items-center gap-3 pr-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-semibold">ENGINE ONLINE</span>
            </span>
            <span className="text-slate-600">|</span>
            <span>POSTGRESQL SYNCED</span>
          </div>

        </header>

        {/* Dynamic Nested Route Content */}
        <main>{children}</main>

      </div>
    </div>
  );
}
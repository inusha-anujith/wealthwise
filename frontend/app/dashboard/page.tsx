/*
 * THEORY: Parallel Server-Side Aggregation & Net Worth Math
 * ----------------------------------------------------------
 * 1. Server Component: Executes in Node.js server runtime, eliminating client waterfalls.
 * 2. Next.js 15 Cookie Bridge: Awaits cookies() to resolve the JWT string safely.
 * 3. Concurrent Queries via Promise.all:
 *    - /api/users/me (User Identity)
 *    - /api/transactions/net-savings/{id} (Liquid Cash Reserve)
 *    - /api/assets/user/{id} (CDS Equities Valuation)
 *    - /api/fixed-deposits/user/{id} (Guaranteed FD Reserves)
 *    - /api/transactions/user/{id} (Recent Ledger History)
 * 4. Consolidated Net Worth:
 *    True Net Worth = Liquid Cash + Equity Holdings + Fixed Deposits
 */
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Data types matching Java entities
interface Asset {
  id: number;
  tickerSymbol: string;
  sharesOwned: number;
  averagePurchasePrice: number;
}

interface FixedDeposit {
  id: number;
  bankName: string;
  principalAmount: number;
  interestRate: number;
  durationMonths: number;
}

interface Transaction {
  id: number;
  category: string;
  type: string;
  amount: number;
  transactionDate: string;
}

export default async function DashboardSummaryPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;

  if (!token) {
    redirect("/login");
  }

  const fetchOptions: RequestInit = {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // 1. Resolve Authenticated Identity
  const userRes = await fetch("http://localhost:8080/api/users/me", fetchOptions);
  if (!userRes.ok) {
    redirect("/login");
  }
  const user = await userRes.json();
  const userId: number = user.id;

  // 2. Parallel Fetching Across All Four Financial Verticals
  const [netSavingsRes, assetsRes, fdsRes, txRes] = await Promise.all([
    fetch(`http://localhost:8080/api/transactions/net-savings/${userId}`, fetchOptions),
    fetch(`http://localhost:8080/api/assets/user/${userId}`, fetchOptions),
    fetch(`http://localhost:8080/api/fixed-deposits/user/${userId}`, fetchOptions),
    fetch(`http://localhost:8080/api/transactions/user/${userId}`, fetchOptions),
  ]);

  const rawNetSavings = netSavingsRes.ok ? await netSavingsRes.json() : 0;
  const assets: Asset[] = assetsRes.ok ? await assetsRes.json() : [];
  const fixedDeposits: FixedDeposit[] = fdsRes.ok ? await fdsRes.json() : [];
  const transactions: Transaction[] = txRes.ok ? await txRes.json() : [];

  // 3. Precision Financial Calculations
  const liquidCash = typeof rawNetSavings === "number" ? rawNetSavings : parseFloat(rawNetSavings) || 0;

  const totalEquitiesValue = assets.reduce(
    (sum, a) => sum + a.sharesOwned * a.averagePurchasePrice,
    0
  );

  const totalFixedDepositsValue = fixedDeposits.reduce(
    (sum, fd) => sum + fd.principalAmount,
    0
  );

  const trueNetWorth = liquidCash + totalEquitiesValue + totalFixedDepositsValue;

  // 4. Asset Allocation Weighting Calculations
  const allocationBase = trueNetWorth > 0 ? trueNetWorth : 1;
  const liquidPct = Math.max(0, Math.round((liquidCash / allocationBase) * 100));
  const equityPct = Math.max(0, Math.round((totalEquitiesValue / allocationBase) * 100));
  const fdPct = Math.max(0, Math.round((totalFixedDepositsValue / allocationBase) * 100));

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* --- DASHBOARD HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Financial Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Consolidated ledger profile for{" "}
            <span className="text-blue-400 font-mono font-medium">{user.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/cash-flow"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
          >
            + Add Transaction
          </Link>
          <Link
            href="/dashboard/investments"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
          >
            Deploy Capital
          </Link>
        </div>
      </div>

      {/* --- TELEMETRY SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Consolidated Net Worth */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-2xl rounded-full" />
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Consolidated Net Worth</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-3 font-sans">
            LKR {trueNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-medium">Zero-Drift Certified</span>
            <span className="text-slate-500 font-mono">ALL VERTICALS</span>
          </div>
        </div>

        {/* Card 2: Liquid Cash Balance */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl hover:border-emerald-500/40 transition-all">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Liquid Cash Reserves</div>
          <div className={`text-2xl sm:text-3xl font-extrabold mt-3 font-sans ${liquidCash >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            LKR {liquidCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Net Savings Pool</span>
            <Link href="/dashboard/cash-flow" className="text-blue-400 hover:underline">
              Ledger →
            </Link>
          </div>
        </div>

        {/* Card 3: Equity Holdings */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl hover:border-indigo-500/40 transition-all">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Equities & CDS Capital</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-3 font-sans">
            LKR {totalEquitiesValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>{assets.length} Active Positions</span>
            <Link href="/dashboard/investments" className="text-blue-400 hover:underline">
              Portfolio →
            </Link>
          </div>
        </div>

        {/* Card 4: Guaranteed Fixed Deposits */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl hover:border-purple-500/40 transition-all">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Guaranteed FD Reserves</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 mt-3 font-sans">
            LKR {totalFixedDepositsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>{fixedDeposits.length} Certificates</span>
            <Link href="/dashboard/investments" className="text-blue-400 hover:underline">
              Deposits →
            </Link>
          </div>
        </div>

      </div>

      {/* --- ASSET ALLOCATION BAR & BREAKDOWN --- */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-white">Consolidated Capital Allocation</h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribution across liquidity, equity, and guaranteed yield assets</p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            TOTAL CAPITAL: LKR {trueNetWorth.toLocaleString()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
          <div style={{ width: `${liquidPct}%` }} className="h-full bg-emerald-500 transition-all" title={`Liquid: ${liquidPct}%`} />
          <div style={{ width: `${equityPct}%` }} className="h-full bg-blue-500 transition-all" title={`Equities: ${equityPct}%`} />
          <div style={{ width: `${fdPct}%` }} className="h-full bg-purple-500 transition-all" title={`Fixed Deposits: ${fdPct}%`} />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0" />
            <span className="text-slate-300 font-medium">Liquid Cash:</span>
            <span className="text-slate-400 font-mono">{liquidPct}%</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-md bg-blue-500 shrink-0" />
            <span className="text-slate-300 font-medium">Equities Portfolio:</span>
            <span className="text-slate-400 font-mono">{equityPct}%</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-md bg-purple-500 shrink-0" />
            <span className="text-slate-300 font-medium">Fixed Deposits:</span>
            <span className="text-slate-400 font-mono">{fdPct}%</span>
          </div>
        </div>
      </div>

      {/* --- SPLIT VIEW: RECENT TRANSACTIONS & PORTFOLIO SNAPSHOT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Ledger Entries */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl flex flex-col">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm sm:text-base">Recent Ledger Activity</h3>
            <Link href="/dashboard/cash-flow" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
              View All Cash Flow →
            </Link>
          </div>
          <div className="p-0 flex-1">
            {transactions.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-500">No transactions recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {transactions.slice(0, 5).map((t) => (
                  <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                    <div>
                      <div className="text-sm font-semibold text-slate-200 capitalize">{t.category}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{t.transactionDate}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold font-mono ${t.type === "INCOME" ? "text-emerald-400" : "text-rose-400"}`}>
                        {t.type === "INCOME" ? "+" : "-"} LKR {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                        t.type === "INCOME" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {t.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Holdings Snapshot */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl flex flex-col">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm sm:text-base">Active Equity Holdings</h3>
            <Link href="/dashboard/investments" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
              Manage CDS Portfolio →
            </Link>
          </div>
          <div className="p-0 flex-1">
            {assets.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-500">No equity assets logged yet.</p>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {assets.map((asset) => (
                  <div key={asset.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                    <div>
                      <div className="text-sm font-bold text-blue-400 font-mono">{asset.tickerSymbol}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {asset.sharesOwned.toLocaleString()} shares @ LKR {asset.averagePurchasePrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-200 font-mono">
                        LKR {(asset.sharesOwned * asset.averagePurchasePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">Invested Value</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
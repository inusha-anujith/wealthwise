/*
 * THEORY: Unified Dark Cash Flow Engine
 * --------------------------------------
 * Client component combining dynamic form inputs with high-velocity ledger telemetry.
 * Styled with slate-900 glassmorphism, glowing focus rings, and high-contrast badges.
 */
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function CashFlowPage() {
  const { token } = useAuth();

  // Form State
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("INCOME");
  const [category, setCategory] = useState("");

  // Data State
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadTransactions = async () => {
    if (!token) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Resolve Dynamic Identity
      const userRes = await fetch("http://localhost:8080/api/users/me", { headers });
      if (!userRes.ok) throw new Error("Authentication failed");
      const user = await userRes.json();

      // 2. Fetch User Ledger Records
      const transRes = await fetch(`http://localhost:8080/api/transactions/user/${user.id}`, { headers });
      if (transRes.ok) {
        const data = await transRes.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to synchronize transaction ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [token]);

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const userRes = await fetch("http://localhost:8080/api/users/me", { headers });
      const user = await userRes.json();

      const payload = {
        userId: user.id,
        amount: parseFloat(amount),
        type: type,
        category: category,
        transactionDate: new Date().toISOString().split("T")[0],
      };

      const res = await fetch("http://localhost:8080/api/transactions", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setAmount("");
        setCategory("");
        loadTransactions();
      } else {
        setError("Backend rejected transaction. Check logs.");
      }
    } catch (err) {
      setError("Network communication error.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations for Telemetry Pills
  const totalIn = transactions
    .filter((t: any) => t.type === "INCOME")
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const totalOut = transactions
    .filter((t: any) => t.type === "EXPENSE")
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Title & Scope Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-slate-900/60 to-slate-900/40 border border-blue-500/20 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Cash Flow Management</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Track high-velocity liquid income, operational costs, and living expenses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
            In: LKR {totalIn.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-bold">
            Out: LKR {totalOut.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Dark Form Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm">
        <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Record New Transaction
        </h3>

        <form onSubmit={handleSaveTransaction} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Amount (LKR)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 125000"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Transaction Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="INCOME">Income (Credit)</option>
              <option value="EXPENSE">Expense (Debit)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Category
            </label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Salary, Rent, Utilities"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-[42px] px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? "Writing..." : "+ Save Transaction"}
          </button>
        </form>
      </div>

      {/* Dark Ledger Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl backdrop-blur-sm">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-base">Transaction Ledger History</h3>
          <span className="text-xs text-slate-400 font-mono">{transactions.length} records mapped</span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <p className="p-8 text-center text-xs text-slate-500 font-mono">Syncing ledger records...</p>
          ) : transactions.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-500">No transactions recorded in this ledger yet.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Date</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-sm font-mono text-slate-400">{t.transactionDate}</td>
                    <td className="p-4 text-sm font-semibold text-slate-200 capitalize">{t.category}</td>
                    <td className="p-4 text-sm">
                      <span
                        className={`inline-block text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                          t.type === "INCOME"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-mono font-bold text-right text-slate-100">
                      LKR {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
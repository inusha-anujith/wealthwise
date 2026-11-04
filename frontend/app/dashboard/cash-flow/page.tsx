"use client";

import { useEffect, useState } from "react";
import MonthSwitcher from "../../components/MonthSwitcher";
import { useAuth } from "../../context/AuthContext";

const API_URL = "http://localhost:8080/api/transactions";

type TransactionType = "INCOME" | "EXPENSE";

type Category = {
  value: string;
  label: string;
  type: TransactionType;
};

type Transaction = {
  id: number;
  type: TransactionType;
  amount: number;
  category: string;
  categoryLabel: string;
  transactionDate: string;
  description: string | null;
  sourceType: "MANUAL" | "ASSET_PURCHASE" | "DIVIDEND" | "FIXED_DEPOSIT";
};

type MonthlySummary = {
  totalIncome: number;
  needs: number;
  wants: number;
  totalExpenses: number;
  invested: number;
  investmentReturns: number;
  netSavings: number;
  remainingCash: number;
  savingsRate: number;
};

// en-CA formats dates as YYYY-MM-DD in the user's local time zone.
const today = () => new Date().toLocaleDateString("en-CA");

const formatLkr = (value: number) =>
  `LKR ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const inputClass =
  "w-full h-[42px] px-4 rounded-xl [color-scheme:dark] bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
const labelClass = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2";

async function readErrorMessage(res: Response) {
  try {
    const body = await res.json();
    return body.message ?? Object.values(body)[0] ?? "Could not save the transaction.";
  } catch {
    return "Could not save the transaction.";
  }
}

export default function CashFlowPage() {
  const { token, logout } = useAuth();

  const [month, setMonth] = useState(() => today().slice(0, 7));
  const [refreshKey, setRefreshKey] = useState(0);

  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formType, setFormType] = useState<TransactionType>("INCOME");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(today);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;

    // Ignores a slower response if the user has already changed month.
    let isCurrent = true;
    const headers = { Authorization: `Bearer ${token}` };

    const loadData = async () => {
      try {
        const [categoriesRes, transactionsRes, summaryRes] = await Promise.all([
          fetch(`${API_URL}/categories`, { headers }),
          fetch(`${API_URL}?month=${month}`, { headers }),
          fetch(`${API_URL}/summary?month=${month}`, { headers }),
        ]);

        if (!isCurrent) return;

        if (transactionsRes.status === 401) {
          logout();
          return;
        }

        if (!categoriesRes.ok || !transactionsRes.ok || !summaryRes.ok) {
          throw new Error("Could not load cash flow data");
        }

        const [categoryData, transactionData, summaryData] = await Promise.all([
          categoriesRes.json(),
          transactionsRes.json(),
          summaryRes.json(),
        ]);

        if (!isCurrent) return;

        setCategories(categoryData);
        setTransactions(transactionData);
        setSummary(summaryData);
        setError("");
      } catch (err) {
        console.error(err);
        if (isCurrent) setError("Failed to load your cash flow data.");
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    loadData();

    return () => {
      isCurrent = false;
    };
  }, [token, month, refreshKey, logout]);

  const resetForm = () => {
    setEditingId(null);
    setCategory("");
    setAmount("");
    setDescription("");
    setTransactionDate(today());
  };

  const handleTypeChange = (type: TransactionType) => {
    setFormType(type);
    setCategory("");
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setFormType(transaction.type);
    setCategory(transaction.category);
    setAmount(String(transaction.amount));
    setTransactionDate(transaction.transactionDate);
    setDescription(transaction.description ?? "");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (transaction: Transaction) => {
    if (!window.confirm(`Delete this ${transaction.categoryLabel} entry?`)) return;

    setError("");

    try {
      const res = await fetch(`${API_URL}/${transaction.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setError("Could not delete the transaction.");
        return;
      }

      if (editingId === transaction.id) resetForm();
      setRefreshKey((key) => key + 1);
    } catch {
      setError("Network communication error.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(editingId ? `${API_URL}/${editingId}` : API_URL, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category,
          amount: parseFloat(amount),
          transactionDate,
          description: description.trim() || null,
        }),
      });

      if (!res.ok) {
        setError(String(await readErrorMessage(res)));
        return;
      }

      // Show the month the entry belongs to, so it doesn't seem to disappear.
      setMonth(transactionDate.slice(0, 7));
      resetForm();
      setRefreshKey((key) => key + 1);
    } catch {
      setError("Network communication error.");
    } finally {
      setSubmitting(false);
    }
  };

  const visibleCategories = categories.filter((option) => option.type === formType);

  return (
    <div className="space-y-8 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Cash Flow</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Record your income and expenses, and see where each month&apos;s money went.
          </p>
        </div>
        <MonthSwitcher month={month} onChange={setMonth} />
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Income</div>
          <div className="text-xl font-extrabold text-emerald-400 mt-2">
            {formatLkr(summary?.totalIncome ?? 0)}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Expenses</div>
          <div className="text-xl font-extrabold text-rose-400 mt-2">
            {formatLkr(summary?.totalExpenses ?? 0)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Needs {formatLkr(summary?.needs ?? 0)} · Wants {formatLkr(summary?.wants ?? 0)}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Savings</div>
          <div className={`text-xl font-extrabold mt-2 ${(summary?.netSavings ?? 0) < 0 ? "text-rose-400" : "text-white"}`}>
            {formatLkr(summary?.netSavings ?? 0)}
          </div>
          <div className="text-xs text-slate-500 mt-2">{summary?.savingsRate ?? 0}% of income</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Invested</div>
          <div className="text-xl font-extrabold text-blue-400 mt-2">
            {formatLkr(summary?.invested ?? 0)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Returned {formatLkr(summary?.investmentReturns ?? 0)} · Cash left {formatLkr(summary?.remainingCash ?? 0)}
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl">
        <h2 className="text-base font-bold text-white mb-6">
          {editingId ? "Edit Transaction" : "Add Transaction"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="type" className={labelClass}>
                Type
              </label>
              <select
                id="type"
                value={formType}
                onChange={(e) => handleTypeChange(e.target.value as TransactionType)}
                className={inputClass}
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className={labelClass}>
                Category
              </label>
              <select
                id="category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {visibleCategories.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="amount" className={labelClass}>
                Amount (LKR)
              </label>
              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 125000"
                className={`${inputClass} font-mono`}
              />
            </div>

            <div>
              <label htmlFor="date" className={labelClass}>
                Date
              </label>
              <input
                id="date"
                type="date"
                required
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Description (optional)
            </label>
            <input
              id="description"
              type="text"
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. November salary"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="h-[42px] px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all disabled:opacity-50"
            >
              {submitting ? "Saving..." : editingId ? "Save Changes" : "Add Transaction"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="h-[42px] px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-white text-base">Transactions</h2>
          <span className="text-xs text-slate-400">
            {transactions.length} {transactions.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <p className="p-8 text-center text-xs text-slate-500">Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-500">No transactions for this month yet.</p>
          ) : (
            <table className="w-full min-w-[720px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Date</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-sm font-mono text-slate-400 whitespace-nowrap">
                      {transaction.transactionDate}
                    </td>
                    <td className="p-4 text-sm font-semibold text-slate-200">{transaction.categoryLabel}</td>
                    <td className="p-4 text-sm text-slate-400">{transaction.description || "—"}</td>
                    <td
                      className={`p-4 text-sm font-mono font-bold text-right whitespace-nowrap ${
                        transaction.type === "INCOME" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {transaction.type === "INCOME" ? "+" : "-"} {formatLkr(transaction.amount)}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      {transaction.sourceType === "MANUAL" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(transaction)}
                            className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-semibold transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(transaction)}
                            className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Automatic</span>
                      )}
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
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function FixedDepositForm() {
  const router = useRouter();
  const { token } = useAuth();

  const [bankName, setBankName] = useState("Commercial Bank");
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [durationMonths, setDurationMonths] = useState("12");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        bankName,
        principalAmount: parseFloat(principal),
        interestRate: parseFloat(interestRate),
        durationMonths: parseInt(durationMonths, 10),
        startDate,
      };

      const response = await fetch("http://localhost:8080/api/fixed-deposits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setPrincipal("");
        setInterestRate("");
        router.refresh();
      } else {
        setError("Failed to save Fixed Deposit. Check server logs.");
      }
    } catch (err) {
      setError("Network communication error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-teal-500" />
        Log Fixed Deposit (FD)
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Institution
          </label>
          <select
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="Commercial Bank">Commercial Bank</option>
            <option value="HNB">HNB</option>
            <option value="Sampath Bank">Sampath Bank</option>
            <option value="Bank of Ceylon">Bank of Ceylon</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Principal (LKR)
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="e.g. 2000000"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Rate (p.a. %)
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="e.g. 9.5"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Duration
          </label>
          <select
            value={durationMonths}
            onChange={(e) => setDurationMonths(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="6">6 Months</option>
            <option value="12">1 Year</option>
            <option value="24">2 Years</option>
            <option value="60">5 Years</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[42px] px-6 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-600/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? "Allocating..." : "+ Save FD"}
        </button>
      </form>
    </div>
  );
}
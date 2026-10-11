"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function AssetForm() {
  const router = useRouter();
  const { token } = useAuth();

  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");
  const [isPreExisting, setIsPreExisting] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const payload = {
        tickerSymbol: ticker.toUpperCase().trim(),
        assetName: ticker.toUpperCase().trim(),
        sharesOwned: parseFloat(shares),
        averagePurchasePrice: parseFloat(price),
      };

      const response = await fetch("http://localhost:8080/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setTicker("");
        setShares("");
        setPrice("");
        setIsPreExisting(false);
        router.refresh();
      } else {
        const errorData = await response.text();
        setErrorMessage("Backend validation failed. Check parameters.");
      }
    } catch (err) {
      setErrorMessage("Network error connecting to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Log Equity Purchase
      </h3>

      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Ticker Symbol
            </label>
            <input
              type="text"
              required
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="e.g. JKH.N"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Shares
            </label>
            <input
              type="number"
              step="any"
              required
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="e.g. 150"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Avg Price (LKR)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 20.00"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-1">
          <input
            type="checkbox"
            id="preExisting"
            checked={isPreExisting}
            onChange={(e) => setIsPreExisting(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
          />
          <label htmlFor="preExisting" className="text-xs text-slate-400">
            Pre-existing holding (Do not deduct cash from ledger)
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span>↗</span>
          {loading ? "Deploying..." : "Save Investment"}
        </button>
      </form>
    </div>
  );
}
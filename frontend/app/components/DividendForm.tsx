"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

type Asset = {
  id: number;
  tickerSymbol: string;
};

export default function DividendForm({ assets }: { assets: Asset[] }) {
  const router = useRouter();
  const { token } = useAuth();

  const [assetId, setAssetId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const parsedAmount = parseFloat(amount);
      const selectedAsset = assets.find((a) => a.id === parseInt(assetId, 10));

      const dividendData = {
        amount: parsedAmount,
        paymentDate: paymentDate,
        asset: { id: parseInt(assetId, 10) },
      };

      const res = await fetch("http://localhost:8080/api/dividends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dividendData),
      });

      if (res.ok) {
        setSuccessMessage(
          `Dividend LKR ${parsedAmount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })} for ${selectedAsset?.tickerSymbol} credited to Cash Flow!`
        );

        setAssetId("");
        setAmount("");
        router.refresh();

        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        setErrorMessage("Failed to record dividend event.");
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
        <span className="w-2 h-2 rounded-full bg-purple-500" />
        Log Dividend Income
      </h3>

      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{successMessage}</span>
          <button type="button" onClick={() => setSuccessMessage("")} className="text-emerald-400 ml-2">✕</button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Holding Asset
            </label>
            <select
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            >
              <option value="" disabled>Select Asset</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.tickerSymbol}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Dividend (LKR)
            </label>
            <input
              type="number"
              step="0.01"
              required
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1500"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Payment Date
            </label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? "Reconciling..." : "+ Save Dividend"}
        </button>
      </form>
    </div>
  );
}
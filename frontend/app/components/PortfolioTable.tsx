"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

type Asset = {
  id: number;
  tickerSymbol: string;
  sharesOwned: number;
  averagePurchasePrice: number;
};

export default function PortfolioTable({ assets }: { assets: Asset[] }) {
  const router = useRouter();
  const { token } = useAuth();

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/assets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) router.refresh();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const totalInvested = assets.reduce(
    (sum, a) => sum + a.sharesOwned * a.averagePurchasePrice,
    0
  );

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl backdrop-blur-sm">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-bold text-white text-base">Live Equity Portfolio</h3>
        <div className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold">
          Total Invested: LKR {totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
      </div>

      <div className="overflow-x-auto">
        {assets.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-500">No equity assets logged yet.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Ticker</th>
                <th className="p-4">Shares</th>
                <th className="p-4">Avg Price</th>
                <th className="p-4 text-right">Capital Invested</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {assets.map((asset) => {
                const invested = asset.sharesOwned * asset.averagePurchasePrice;
                return (
                  <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-sm font-bold font-mono text-blue-400">{asset.tickerSymbol}</td>
                    <td className="p-4 text-sm font-mono text-slate-300">{asset.sharesOwned.toLocaleString()}</td>
                    <td className="p-4 text-sm font-mono text-slate-300">
                      LKR {asset.averagePurchasePrice.toFixed(2)}
                    </td>
                    <td className="p-4 text-sm font-mono font-bold text-right text-slate-100">
                      LKR {invested.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(asset.id)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors font-semibold"
                        title="Liquidate / Delete Asset"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
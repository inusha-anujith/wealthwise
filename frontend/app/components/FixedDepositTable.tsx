"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

type FixedDeposit = {
  id: number;
  bankName: string;
  principalAmount: number;
  interestRate: number;
  durationMonths: number;
  startDate: string;
};

export default function FixedDepositTable({ deposits }: { deposits: FixedDeposit[] }) {
  const router = useRouter();
  const { token } = useAuth();

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/fixed-deposits/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) router.refresh();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const totalFD = deposits.reduce((sum, fd) => sum + fd.principalAmount, 0);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl backdrop-blur-sm">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-bold text-white text-base">Guaranteed Income Reserves (Fixed Deposits)</h3>
        <div className="px-3.5 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-mono font-bold">
          Total Locked: LKR {totalFD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
      </div>

      <div className="overflow-x-auto">
        {deposits.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-500">No fixed deposits logged yet.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Institution</th>
                <th className="p-4">Principal Amount</th>
                <th className="p-4">Rate (p.a.)</th>
                <th className="p-4">Duration</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {deposits.map((fd) => (
                <tr key={fd.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-sm font-bold text-teal-400">{fd.bankName}</td>
                  <td className="p-4 text-sm font-mono text-slate-200">
                    LKR {fd.principalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-sm font-mono font-bold text-emerald-400">{fd.interestRate}%</td>
                  <td className="p-4 text-sm font-mono text-slate-400">{fd.durationMonths} Months</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDelete(fd.id)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors font-semibold"
                      title="Liquidate Certificate"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
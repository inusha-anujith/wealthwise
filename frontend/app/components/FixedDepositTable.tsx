"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "/api/fixed-deposits";

type FixedDeposit = {
  id: number;
  bankName: string;
  principalAmount: number;
  interestRate: number;
  durationMonths: number;
  startDate: string;
  status: "ACTIVE" | "MATURED";
  maturedOn: string | null;
  maturityDate: string;
  grossInterest: number;
  withholdingTax: number;
  netInterest: number;
  maturityValue: number;
  canMature: boolean;
};

const formatLkr = (value: number) =>
  `LKR ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function FixedDepositTable({ deposits }: { deposits: FixedDeposit[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState<number | null>(null);

  const runAction = async (id: number, path: string, method: "POST" | "DELETE", failureMessage: string) => {
    setError("");
    setWorkingId(id);

    try {
      const res = await fetch(`${API_URL}/${path}`, {
        method,
      });

      if (!res.ok) {
        setError(failureMessage);
        return;
      }

      router.refresh();
    } catch {
      setError("Network communication error.");
    } finally {
      setWorkingId(null);
    }
  };

  const handleMature = (fd: FixedDeposit) => {
    const message = `Add ${formatLkr(fd.maturityValue)} from ${fd.bankName} to your cash balance?`;
    if (window.confirm(message)) {
      runAction(fd.id, `${fd.id}/mature`, "POST", "Could not mark this deposit as matured.");
    }
  };

  const handleDelete = (fd: FixedDeposit) => {
    const message = `Delete this ${fd.bankName} deposit and its ledger entries? Use this only to correct a mistake.`;
    if (window.confirm(message)) {
      runAction(fd.id, `${fd.id}`, "DELETE", "Could not delete this deposit.");
    }
  };

  const activeTotal = deposits
    .filter((fd) => fd.status === "ACTIVE")
    .reduce((sum, fd) => sum + fd.principalAmount, 0);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl backdrop-blur-sm">
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-bold text-white text-base">Your Fixed Deposits</h3>
        <div className="px-3.5 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-mono font-bold">
          Active Principal: {formatLkr(activeTotal)}
        </div>
      </div>

      {error && (
        <div role="alert" className="m-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        {deposits.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-500">No fixed deposits added yet.</p>
        ) : (
          <table className="w-full min-w-[960px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Bank</th>
                <th className="p-4 text-right">Principal</th>
                <th className="p-4 text-right">Rate</th>
                <th className="p-4">Maturity Date</th>
                <th className="p-4 text-right">Interest After Tax</th>
                <th className="p-4 text-right">Maturity Value</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {deposits.map((fd) => (
                <tr key={fd.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-sm font-bold text-teal-400">{fd.bankName}</td>
                  <td className="p-4 text-sm font-mono text-right text-slate-200 whitespace-nowrap">
                    {formatLkr(fd.principalAmount)}
                  </td>
                  <td className="p-4 text-sm font-mono text-right text-slate-200">{fd.interestRate}%</td>
                  <td className="p-4 text-sm font-mono text-slate-400 whitespace-nowrap">{fd.maturityDate}</td>
                  <td className="p-4 text-sm font-mono text-right text-emerald-400 whitespace-nowrap">
                    <div>{formatLkr(fd.netInterest)}</div>
                    <div className="text-xs text-slate-500">Tax {formatLkr(fd.withholdingTax)}</div>
                  </td>
                  <td className="p-4 text-sm font-mono font-bold text-right text-white whitespace-nowrap">
                    {formatLkr(fd.maturityValue)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        fd.status === "MATURED"
                          ? "bg-slate-500/10 text-slate-300"
                          : fd.canMature
                            ? "bg-amber-500/10 text-amber-300"
                            : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {fd.status === "MATURED" ? "Matured" : fd.canMature ? "Ready" : "Active"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2 whitespace-nowrap">
                      {fd.canMature && (
                        <button
                          type="button"
                          disabled={workingId === fd.id}
                          onClick={() => handleMature(fd)}
                          className="px-3 py-1.5 rounded-lg border border-teal-500/40 text-teal-300 hover:bg-teal-500/10 text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          Mark Matured
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={workingId === fd.id}
                        onClick={() => handleDelete(fd)}
                        className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {deposits.length > 0 && (
        <p className="p-4 border-t border-slate-800 text-xs text-slate-500">
          Estimates assume simple interest paid at maturity, with withholding tax deducted from the interest. Your
          bank&apos;s terms may differ. If your yearly income is low enough, you may be able to avoid this deduction with a
          self-declaration.
        </p>
      )}
    </div>
  );
}
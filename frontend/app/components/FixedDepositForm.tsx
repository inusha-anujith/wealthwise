"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full h-[42px] px-4 rounded-xl [color-scheme:dark] bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";
const labelClass = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2";

// en-CA formats dates as YYYY-MM-DD in the user's local time zone.
const today = () => new Date().toLocaleDateString("en-CA");

async function readErrorMessage(res: Response) {
  try {
    const body = await res.json();
    return String(body.message ?? Object.values(body)[0] ?? "Could not save the fixed deposit.");
  } catch {
    return "Could not save the fixed deposit.";
  }
}

export default function FixedDepositForm() {
  const router = useRouter();

  const [bankName, setBankName] = useState("Commercial Bank");
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [durationMonths, setDurationMonths] = useState("12");
  const [startDate, setStartDate] = useState(today);
  const [isPreExisting, setIsPreExisting] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/fixed-deposits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bankName,
          principalAmount: parseFloat(principal),
          interestRate: parseFloat(interestRate),
          durationMonths: parseInt(durationMonths, 10),
          startDate,
          deductFromCash: !isPreExisting,
        }),
      });

      if (response.ok) {
        setPrincipal("");
        setInterestRate("");
        setStartDate(today());
        setIsPreExisting(false);
        router.refresh();
      } else {
        setError(await readErrorMessage(response));
      }
    } catch {
      setError("Network communication error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-teal-500" />
        Add Fixed Deposit
      </h3>

      {error && (
        <div role="alert" className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
        <div>
          <label htmlFor="fdBank" className={labelClass}>
            Bank
          </label>
          <select id="fdBank" value={bankName} onChange={(e) => setBankName(e.target.value)} className={inputClass}>
            <option value="Commercial Bank">Commercial Bank</option>
            <option value="HNB">HNB</option>
            <option value="Sampath Bank">Sampath Bank</option>
            <option value="Bank of Ceylon">Bank of Ceylon</option>
          </select>
        </div>

        <div>
          <label htmlFor="fdPrincipal" className={labelClass}>
            Principal (LKR)
          </label>
          <input
            id="fdPrincipal"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="e.g. 500000"
            className={`${inputClass} font-mono`}
          />
        </div>

        <div>
          <label htmlFor="fdRate" className={labelClass}>
            Rate (% a year)
          </label>
          <input
            id="fdRate"
            type="number"
            min="0.01"
            max="100"
            step="0.01"
            required
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="e.g. 9.5"
            className={`${inputClass} font-mono`}
          />
        </div>

        <div>
          <label htmlFor="fdDuration" className={labelClass}>
            Duration
          </label>
          <select
            id="fdDuration"
            value={durationMonths}
            onChange={(e) => setDurationMonths(e.target.value)}
            className={inputClass}
          >
            <option value="3">3 Months</option>
            <option value="6">6 Months</option>
            <option value="12">1 Year</option>
            <option value="24">2 Years</option>
            <option value="60">5 Years</option>
          </select>
        </div>

        <div>
          <label htmlFor="fdStart" className={labelClass}>
            Start Date
          </label>
          <input
            id="fdStart"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`${inputClass} font-mono`}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[42px] px-6 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm transition-all disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save FD"}
        </button>

        <div className="md:col-span-3 lg:col-span-6 flex items-center gap-2.5">
          <input
            type="checkbox"
            id="preExistingFd"
            checked={isPreExisting}
            onChange={(e) => setIsPreExisting(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
          />
          <label htmlFor="preExistingFd" className="text-xs text-slate-400">
            Pre-existing deposit (do not deduct cash from the ledger)
          </label>
        </div>
      </form>
    </div>
  );
}
"use client";

import { useState } from "react";

const API_URL = "/api/simulator";

type Scenario = {
  name: string;
  yearlyRate: number;
  futureValue: number;
  growth: number;
  todaysMoney: number;
};

type SimulatorResult = {
  years: number;
  totalContributed: number;
  inflationRate: number;
  fdTaxRate: number;
  scenarios: Scenario[];
};

const formatLkr = (value: number) =>
  `LKR ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const inputClass =
  "w-full h-[42px] px-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
const labelClass = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2";
const cardClass = "p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl";

async function readErrorMessage(res: Response) {
  try {
    const body = await res.json();
    return String(body.message ?? Object.values(body)[0] ?? "Could not run the simulation.");
  } catch {
    return "Could not run the simulation.";
  }
}

export default function SimulatorPage() {

  // Starting values: the October 2026 inflation rate and example returns the user can change.
  const [startingAmount, setStartingAmount] = useState("100000");
  const [monthlyContribution, setMonthlyContribution] = useState("10000");
  const [years, setYears] = useState("10");
  const [fdRate, setFdRate] = useState("9");
  const [stockReturn, setStockReturn] = useState("12");
  const [inflationRate, setInflationRate] = useState("8.3");

  const [result, setResult] = useState<SimulatorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startingAmount: parseFloat(startingAmount),
          monthlyContribution: parseFloat(monthlyContribution),
          years: parseInt(years, 10),
          fdRate: parseFloat(fdRate),
          stockReturn: parseFloat(stockReturn),
          inflationRate: parseFloat(inflationRate),
        }),
      });

      if (!res.ok) {
        setError(await readErrorMessage(res));
        return;
      }

      setResult(await res.json());
    } catch {
      setError("Network communication error.");
    } finally {
      setLoading(false);
    }
  };

  // One list drives all six inputs, so the form markup isn't repeated six times.
  const fields = [
    { id: "startingAmount", label: "Starting Amount (LKR)", value: startingAmount, set: setStartingAmount, min: "0", step: "0.01" },
    { id: "monthlyContribution", label: "Monthly Amount (LKR)", value: monthlyContribution, set: setMonthlyContribution, min: "0", step: "0.01" },
    { id: "years", label: "Years", value: years, set: setYears, min: "1", max: "40", step: "1" },
    { id: "fdRate", label: "FD Rate (% a year)", value: fdRate, set: setFdRate, min: "0", max: "100", step: "0.01" },
    { id: "stockReturn", label: "Stock Return (% a year)", value: stockReturn, set: setStockReturn, min: "-50", max: "50", step: "0.01" },
    { id: "inflationRate", label: "Inflation (% a year)", value: inflationRate, set: setInflationRate, min: "0", max: "100", step: "0.01" },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Wealth Simulator</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Compare keeping cash, a fixed deposit and CSE stocks over time, after tax and inflation.
        </p>
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold">
          {error}
        </div>
      )}

      <div className={cardClass}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className={labelClass}>
                  {field.label}
                </label>
                <input
                  id={field.id}
                  type="number"
                  required
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={field.value}
                  onChange={(e) => field.set(e.target.value)}
                  className={inputClass}
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-[42px] px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all disabled:opacity-50"
          >
            {loading ? "Calculating..." : "Run Simulation"}
          </button>
        </form>
      </div>

      {result && (
        <>
          <p className="text-sm text-slate-300">
            Over {result.years} {result.years === 1 ? "year" : "years"}, you put in{" "}
            <span className="font-bold text-white">{formatLkr(result.totalContributed)}</span>.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {result.scenarios.map((scenario) => (
              <div key={scenario.name} className={cardClass}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base font-bold text-white">{scenario.name}</h2>
                  <span className="text-xs font-mono text-slate-400">{scenario.yearlyRate}% a year</span>
                </div>

                <div className="text-xs text-slate-400 mt-5">Future value</div>
                <div className="text-xl font-extrabold text-white mt-1">{formatLkr(scenario.futureValue)}</div>
                <div className={`text-xs font-semibold mt-1 ${scenario.growth >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {scenario.growth >= 0 ? "+" : ""}
                  {formatLkr(scenario.growth)} growth
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-400">Buying power in today&apos;s money</div>
                  <div className="text-lg font-bold text-blue-400 mt-1">{formatLkr(scenario.todaysMoney)}</div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500">
            These are projections from the rates you entered, not predictions. The FD rate shown is after{" "}
            {result.fdTaxRate}% tax on interest. Gains on shares listed on the CSE are excluded from capital gains tax.
            Stock returns can be negative, and inflation is assumed to stay at {result.inflationRate}% every year. This
            isn&apos;t financial advice.
          </p>
        </>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import MonthSwitcher from "../../components/MonthSwitcher";
import { useAuth } from "../../context/AuthContext";

const API_URL = "/api/salary-plan";

type BudgetLine = {
  name: string;
  percent: number;
  planned: number;
  actual: number;
  remaining: number;
  status: "ON_TRACK" | "OVER" | "BEHIND";
};

type PlanStep = {
  code: string;
  title: string;
  status: "CURRENT" | "NEXT" | "DONE";
  message: string;
  monthlyAmount: number;
  remainingAmount: number;
  monthsToComplete: number | null;
};

type SalaryPlan = {
  profile: {
    grossSalary: number;
    epfEarnings: number;
    needsPercent: number;
    wantsPercent: number;
    savingsPercent: number;
    emergencyFundMonths: number;
    highInterestDebt: number;
  };
  takeHome: {
    grossSalary: number;
    employeeEpf: number;
    apit: number;
    totalDeductions: number;
    takeHomePay: number;
    employerEpf: number;
    employerEtf: number;
  };
  budget: BudgetLine[];
  steps: PlanStep[];
  emergencyFundTarget: number;
  cashBalance: number;
  rulesEffectiveFrom: string;
  rulesSource: string;
};

const currentMonth = () => new Date().toLocaleDateString("en-CA").slice(0, 7);

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
    return String(body.message ?? Object.values(body)[0] ?? "Could not save your salary plan.");
  } catch {
    return "Could not save your salary plan.";
  }
}

function budgetMessage(line: BudgetLine) {
  const difference = formatLkr(Math.abs(line.remaining));

  if (line.name === "Savings") {
    return line.status === "ON_TRACK" ? `${difference} above target` : `${difference} below target`;
  }

  return line.status === "OVER" ? `${difference} over budget` : `${difference} left`;
}

export default function SalaryPlanPage() {
  const { logout } = useAuth();

  const [month, setMonth] = useState(currentMonth);
  const [refreshKey, setRefreshKey] = useState(0);
  const [plan, setPlan] = useState<SalaryPlan | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [grossSalary, setGrossSalary] = useState("");
  const [epfEarnings, setEpfEarnings] = useState("");
  const [needsPercent, setNeedsPercent] = useState("50");
  const [wantsPercent, setWantsPercent] = useState("30");
  const [savingsPercent, setSavingsPercent] = useState("20");
  const [emergencyFundMonths, setEmergencyFundMonths] = useState("6");
  const [highInterestDebt, setHighInterestDebt] = useState("0");

  useEffect(() => {

    let isCurrent = true;

    const loadPlan = async () => {
      try {
        const res = await fetch(`${API_URL}?month=${month}`, {
        });

        if (!isCurrent) return;

        if (res.status === 401) {
          logout();
          return;
        }

        if (res.status === 404) {
          const message = await readErrorMessage(res);
          if (!isCurrent) return;

          setPlan(null);

          if (message === "Salary profile not found") {
            setHasProfile(false);
            setError("");
          } else {
            setError("Salary rules are not available for this month.");
          }
          return;
        }

        if (!res.ok) throw new Error("Could not load salary plan");

        const data = await res.json();
        if (!isCurrent) return;

        setPlan(data);
        setHasProfile(true);
        setError("");
      } catch (err) {
        console.error(err);
        if (isCurrent) setError("Failed to load your salary plan.");
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    loadPlan();

    return () => {
      isCurrent = false;
    };
  }, [month, refreshKey, logout]);

  const handleEdit = () => {
    if (plan) {
      setGrossSalary(String(plan.profile.grossSalary));
      setEpfEarnings(String(plan.profile.epfEarnings));
      setNeedsPercent(String(plan.profile.needsPercent));
      setWantsPercent(String(plan.profile.wantsPercent));
      setSavingsPercent(String(plan.profile.savingsPercent));
      setEmergencyFundMonths(String(plan.profile.emergencyFundMonths));
      setHighInterestDebt(String(plan.profile.highInterestDebt));
    }
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grossSalary: parseFloat(grossSalary),
          epfEarnings: epfEarnings.trim() ? parseFloat(epfEarnings) : null,
          needsPercent: parseInt(needsPercent, 10),
          wantsPercent: parseInt(wantsPercent, 10),
          savingsPercent: parseInt(savingsPercent, 10),
          emergencyFundMonths: parseInt(emergencyFundMonths, 10),
          highInterestDebt: parseFloat(highInterestDebt),
        }),
      });

      if (!res.ok) {
        setError(await readErrorMessage(res));
        return;
      }

      setShowForm(false);
      setRefreshKey((key) => key + 1);
    } catch {
      setError("Network communication error.");
    } finally {
      setSubmitting(false);
    }
  };

  const splitTotal =
    (parseInt(needsPercent, 10) || 0) + (parseInt(wantsPercent, 10) || 0) + (parseInt(savingsPercent, 10) || 0);
  const formVisible = !loading && (showForm || !hasProfile);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Salary Planner</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            See your take-home pay, plan where it should go, and compare the plan with what you spent.
          </p>
        </div>
        {hasProfile && <MonthSwitcher month={month} onChange={setMonth} />}
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold">
          {error}
        </div>
      )}

      {loading && <p className="p-8 text-center text-xs text-slate-500">Loading your salary plan...</p>}

      {formVisible && (
        <div className={cardClass}>
          <h2 className="text-base font-bold text-white">
            {hasProfile ? "Update Your Salary Details" : "Enter Your Salary Details"}
          </h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Use your regular monthly salary from your main job, before deductions.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="grossSalary" className={labelClass}>
                  Gross Salary (LKR)
                </label>
                <input
                  id="grossSalary"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={grossSalary}
                  onChange={(e) => setGrossSalary(e.target.value)}
                  placeholder="e.g. 250000"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="epfEarnings" className={labelClass}>
                  EPF Earnings (Optional)
                </label>
                <input
                  id="epfEarnings"
                  type="number"
                  min="0"
                  step="0.01"
                  value={epfEarnings}
                  onChange={(e) => setEpfEarnings(e.target.value)}
                  placeholder="Same as gross"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="emergencyFundMonths" className={labelClass}>
                  Emergency Fund (Months)
                </label>
                <input
                  id="emergencyFundMonths"
                  type="number"
                  min="0"
                  max="24"
                  step="1"
                  required
                  value={emergencyFundMonths}
                  onChange={(e) => setEmergencyFundMonths(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="highInterestDebt" className={labelClass}>
                  High-Interest Debt (LKR)
                </label>
                <input
                  id="highInterestDebt"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={highInterestDebt}
                  onChange={(e) => setHighInterestDebt(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-sm font-bold text-white">Budget Split of Take-Home Pay</h3>
                <span className={`text-xs font-mono font-bold ${splitTotal === 100 ? "text-emerald-400" : "text-rose-400"}`}>
                  Total {splitTotal}%
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="needsPercent" className={labelClass}>
                    Needs (%)
                  </label>
                  <input
                    id="needsPercent"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    required
                    value={needsPercent}
                    onChange={(e) => setNeedsPercent(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="wantsPercent" className={labelClass}>
                    Wants (%)
                  </label>
                  <input
                    id="wantsPercent"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    required
                    value={wantsPercent}
                    onChange={(e) => setWantsPercent(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="savingsPercent" className={labelClass}>
                    Savings (%)
                  </label>
                  <input
                    id="savingsPercent"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    required
                    value={savingsPercent}
                    onChange={(e) => setSavingsPercent(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={submitting || splitTotal !== 100}
                className="h-[42px] px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Saving..." : "Save Plan"}
              </button>
              {hasProfile && (
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="h-[42px] px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {plan && (
        <>
          <div className={cardClass}>
            <div className="flex items-center justify-between gap-3 mb-5">
              <h2 className="text-base font-bold text-white">Your Monthly Pay</h2>
              {!showForm && (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-semibold transition-colors"
                >
                  Edit Details
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <div className="text-xs text-slate-400">Gross salary</div>
                <div className="text-lg font-bold text-white mt-1">{formatLkr(plan.takeHome.grossSalary)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Your EPF contribution</div>
                <div className="text-lg font-bold text-rose-400 mt-1">- {formatLkr(plan.takeHome.employeeEpf)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">APIT</div>
                <div className="text-lg font-bold text-rose-400 mt-1">- {formatLkr(plan.takeHome.apit)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Take-home pay</div>
                <div className="text-lg font-extrabold text-emerald-400 mt-1">{formatLkr(plan.takeHome.takeHomePay)}</div>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-5 pt-4 border-t border-slate-800">
              Your employer also pays {formatLkr(plan.takeHome.employerEpf)} into EPF and{" "}
              {formatLkr(plan.takeHome.employerEtf)} into ETF. These aren&apos;t deducted from your pay.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-4">Plan vs Actual</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {plan.budget.map((line) => {
                const isGood = line.status === "ON_TRACK";
                const progress = line.planned > 0 ? Math.min((Math.max(line.actual, 0) / line.planned) * 100, 100) : 0;

                return (
                  <div key={line.name} className={cardClass}>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-bold text-white">
                        {line.name} ({line.percent}%)
                      </h3>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          isGood ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {isGood ? "On track" : line.status === "OVER" ? "Over budget" : "Behind"}
                      </span>
                    </div>

                    <div className="text-xl font-extrabold text-white mt-3">{formatLkr(line.actual)}</div>
                    <div className="text-xs text-slate-400 mt-1">of {formatLkr(line.planned)} planned</div>

                    <div
                      role="progressbar"
                      aria-label={`${line.name} progress`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(progress)}
                      className="h-2 rounded-full bg-slate-800 overflow-hidden mt-4"
                    >
                      <div
                        style={{ width: `${progress}%` }}
                        className={`h-full rounded-full ${isGood ? "bg-emerald-500" : "bg-rose-500"}`}
                      />
                    </div>

                    <div className={`text-xs font-semibold mt-2 ${isGood ? "text-slate-400" : "text-rose-400"}`}>
                      {budgetMessage(line)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={cardClass}>
            <h2 className="text-base font-bold text-white">What To Do With Your Savings</h2>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Your plan saves {formatLkr(plan.budget[2].planned)} a month. Work through these steps in order.
            </p>

            <ol className="space-y-3">
              {plan.steps.map((step, index) => (
                <li
                  key={step.code}
                  className={`p-4 rounded-xl border ${
                    step.status === "CURRENT" ? "border-blue-500/50 bg-blue-500/5" : "border-slate-800"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {index + 1}. {step.title}
                    </h3>
                    <span className="text-xs font-semibold text-slate-400">
                      {step.status === "CURRENT" ? "Do this now" : step.status === "DONE" ? "Done" : "Up next"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{step.message}</p>
                  {step.remainingAmount > 0 && (
                    <p className="text-xs font-semibold text-slate-200 mt-2">
                      {formatLkr(step.remainingAmount)} to go
                      {step.monthsToComplete !== null
                        ? ` · about ${step.monthsToComplete} ${step.monthsToComplete === 1 ? "month" : "months"}`
                        : " · add a savings budget to estimate the time"}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>

          <p className="text-xs text-slate-500">
            This is an estimate for a resident&apos;s regular salary from their main job, using rules effective from{" "}
            {plan.rulesEffectiveFrom}. {plan.rulesSource} It excludes bonuses and non-cash benefits, and isn&apos;t tax or
            financial advice.
          </p>
        </>
      )}
    </div>
  );
}
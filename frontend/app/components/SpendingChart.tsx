"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type CategoryTotal = {
  category: string;
  label: string;
  group: "INCOME" | "NEEDS" | "WANTS" | "INVESTMENTS" | "INVESTMENT_RETURNS";
  total: number;
};

// One colour per slice, chosen to stay readable on the dark background.
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#a855f7", "#ef4444", "#14b8a6", "#ec4899", "#84cc16"];

const formatLkr = (value: number) =>
  `LKR ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function SpendingChart({ categories }: { categories: CategoryTotal[] }) {
  // Only living expenses: income and investments aren't spending.
  const spending = categories
    .filter((item) => item.group === "NEEDS" || item.group === "WANTS")
    .map((item) => ({ name: item.label, value: Number(item.total) }));

  const total = spending.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl">
      <h2 className="text-base font-bold text-white">Where the Money Went</h2>
      <p className="text-xs text-slate-400 mt-1">Living expenses by category this month.</p>

      {spending.length === 0 ? (
        <p className="py-10 text-center text-xs text-slate-500">No expenses recorded this month.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={spending} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="90%" paddingAngle={2}>
                  {spending.map((item, index) => (
                    <Cell key={item.name} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatLkr(Number(value))}
                  contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12 }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* The legend lists exact amounts, so the chart never relies on colour alone. */}
          <ul className="space-y-2">
            {spending.map((item, index) => (
              <li key={item.name} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-3 h-3 rounded-sm" style={{ background: COLORS[index % COLORS.length] }} />
                  {item.name}
                </span>
                <span className="font-mono text-slate-200">
                  {formatLkr(item.value)}
                  <span className="text-slate-500"> · {Math.round((item.value / total) * 100)}%</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

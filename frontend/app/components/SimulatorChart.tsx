"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Scenario = {
  name: string;
  futureValue: number;
  todaysMoney: number;
};

const formatLkr = (value: number) =>
  `LKR ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Short axis labels, for example 2.6M instead of 2,630,425.58.
const formatShort = (value: number) =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);

export default function SimulatorChart({
  scenarios,
  totalContributed,
}: {
  scenarios: Scenario[];
  totalContributed: number;
}) {
  const data = scenarios.map((scenario) => ({
    name: scenario.name,
    "Put in": Number(totalContributed),
    "Future value": Number(scenario.futureValue),
    "Today's money": Number(scenario.todaysMoney),
  }));

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl">
      <h2 className="text-base font-bold text-white">Compare the Options</h2>
      <p className="text-xs text-slate-400 mt-1">
        When &quot;Today&apos;s money&quot; is below &quot;Put in&quot;, inflation has eaten part of your savings.
      </p>

      <div className="h-80 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={formatShort} width={48} />
            <Tooltip
              formatter={(value) => formatLkr(Number(value))}
              cursor={{ fill: "#1e293b55" }}
              contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12 }}
              itemStyle={{ color: "#e2e8f0" }}
              labelStyle={{ color: "#ffffff", fontWeight: 700 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Put in" fill="#64748b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Future value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Today's money" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

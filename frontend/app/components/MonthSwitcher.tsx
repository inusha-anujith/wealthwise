"use client";

type MonthSwitcherProps = {
  month: string;
  onChange: (month: string) => void;
};

function shiftMonth(month: string, change: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(year, monthNumber - 1 + change, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

const buttonClass =
  "w-10 h-[42px] rounded-xl bg-slate-950 border border-slate-800 text-slate-200 hover:bg-slate-800 transition-colors font-bold";

export default function MonthSwitcher({ month, onChange }: MonthSwitcherProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Previous month"
        onClick={() => onChange(shiftMonth(month, -1))}
        className={buttonClass}
      >
        ‹
      </button>
      <div aria-live="polite" className="min-w-[150px] text-center text-sm font-semibold text-slate-100">
        {formatMonth(month)}
      </div>
      <button
        type="button"
        aria-label="Next month"
        onClick={() => onChange(shiftMonth(month, 1))}
        className={buttonClass}
      >
        ›
      </button>
    </div>
  );
}
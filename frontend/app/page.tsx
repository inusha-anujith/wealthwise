"use client";

import Link from "next/link";
import { useAuth } from "./context/AuthContext";

const features = [
  {
    title: "Salary Planner",
    text: "Enter your gross salary to see EPF, APIT and take-home pay, then split it into needs, wants and savings.",
  },
  {
    title: "Cash Flow",
    text: "Record income and expenses by category, and compare each month's spending with your plan.",
  },
  {
    title: "Fixed Deposits",
    text: "See each deposit's maturity value after tax, and return the money to cash when it matures.",
  },
  {
    title: "CSE Stocks",
    text: "Track holdings at prices you enter, with profit or loss, dividends and sales.",
  },
  {
    title: "Wealth Simulator",
    text: "Compare idle cash, fixed deposits and stocks over time, after tax and inflation.",
  },
  {
    title: "Private by Design",
    text: "Each account only sees its own data, checked by the server on every request.",
  },
];

const steps = [
  "Create an account and enter your monthly salary.",
  "Record what you earn and spend each month.",
  "Add your fixed deposits and CSE stocks.",
  "Follow the plan, and use the simulator to compare options.",
];

const techStack = ["Next.js", "TypeScript", "Tailwind CSS", "Spring Boot", "Spring Security + JWT", "PostgreSQL", "Flyway", "Docker", "JUnit"];

export default function LandingPage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 sm:px-8 pt-6 pb-16">
      <section className="max-w-5xl mx-auto pt-12 pb-16 sm:pt-20 text-center">
        <p className="inline-block px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold mb-8">
          Built for salaried employees in Sri Lanka
        </p>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Turn your salary into a{" "}
          <span className="bg-gradient-to-r from-blue-400 to-emerald-300 bg-clip-text text-transparent">clear plan.</span>
        </h1>

        <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          WealthWise shows your take-home pay, tracks where your money goes, and helps you decide what to do with your
          savings.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {loading ? null : user ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
            >
              Open Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 border border-slate-700 hover:bg-slate-900 text-slate-200 font-bold rounded-xl transition-colors"
              >
                Log In
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">What you can do</h2>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div key={feature.title} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h3 className="font-bold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">How it works</h2>
        <ol className="mt-10 space-y-4">
          {steps.map((step, index) => (
            <li key={step} className="flex items-start gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/40">
              <span className="flex-none w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                {index + 1}
              </span>
              <span className="pt-1 text-slate-300">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Built with</h2>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {techStack.map((tech) => (
            <span key={tech} className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs text-slate-300">
              {tech}
            </span>
          ))}
        </div>
      </section>

      <footer className="max-w-6xl mx-auto mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500 space-y-2">
        <p>WealthWise is a portfolio project. Its estimates are for learning and planning, not financial or tax advice.</p>
        <p>© 2026 WealthWise</p>
      </footer>
    </div>
  );
}
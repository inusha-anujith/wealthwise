/*
 * THEORY: High-Conversion Enterprise Landing Architecture
 * ---------------------------------------------------------
 * 1. Client-Side Rendering ("use client"): Consumes the global AuthContext
 *    to dynamically adapt CTA buttons based on active JWT session status.
 * 2. Component Structure:
 *    - Hero Section: Headline typography with dual dynamic CTA.
 *    - Metrics Ribbon: Key technical and operational benchmarks.
 *    - Interactive Feature Showcase: 4 core financial verticals.
 *    - Dual-Ledger Architecture Breakdown: Explaining automated transaction cascades.
 *    - Security & Multi-Tenancy Assurance: Spring Security & JWT isolation highlights.
 *    - Global Enterprise Footer: Professional branding and navigation.
 */
"use client";

import Link from "next/link";
import { useAuth } from "./context/AuthContext";

export default function LandingPage() {
  const { token } = useAuth();

  return (
<div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white px-4 sm:px-8 pt-6 pb-20">      
      {/* --- HERO SECTION --- */}
      <section className="relative max-w-7xl mx-auto pt-12 pb-20 sm:pt-20 sm:pb-28 text-center px-4 overflow-hidden">
        {/* Ambient Gradient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Enterprise Announcement Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          Enterprise Wealth Engine 2.0 • Live
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          Master your financial reality with{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            algorithmic precision.
          </span>
        </h1>

        {/* Subtitle Value Proposition */}
        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
          The unified wealth ecosystem that binds daily cash flows, Colombo Stock Exchange equity portfolios, 
          and fixed deposit reserves into one cryptographically isolated, zero-drift financial ledger.
        </p>

        {/* Dynamic Context-Aware Call to Action */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {token ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base"
            >
              Launch Master Dashboard
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base"
              >
                Start Building Wealth Free
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold rounded-xl transition-all text-base"
              >
                Sign In to Account
              </Link>
            </>
          )}
          <a
            href="#features"
            className="w-full sm:w-auto px-6 py-3.5 text-slate-400 hover:text-slate-200 font-medium transition-colors text-base"
          >
            Explore Core Engine ↓
          </a>
        </div>
      </section>

      {/* --- LIVE SYSTEM METRICS RIBBON --- */}
      <section className="max-w-7xl mx-auto px-4 mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
          <div className="text-center p-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">100%</div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-medium">Relational Isolation</div>
          </div>
          <div className="text-center p-3 border-l border-slate-800">
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">Dual-Entry</div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-medium">Automatic Ledgers</div>
          </div>
          <div className="text-center p-3 border-l border-slate-800">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">0.00%</div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-medium">Net Worth Drift</div>
          </div>
          <div className="text-center p-3 border-l border-slate-800">
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">JWT 256-Bit</div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-medium">Cryptographic Guard</div>
          </div>
        </div>
      </section>

      {/* --- PLATFORM PREVIEW UI MOCKUP --- */}
      <section className="max-w-6xl mx-auto px-4 mb-28">
        <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl shadow-blue-900/20 p-4 sm:p-6 overflow-hidden">
          
          {/* Top Window Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              <span className="ml-3 text-xs text-slate-400 font-mono">wealthwise-engine://live-telemetry</span>
            </div>
            <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              LEDGER SYNCED
            </span>
          </div>

          {/* Interactive UI Mockup Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
            {/* Net Worth Card */}
            <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">True Consolidated Net Worth</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2">LKR 2,133,750.00</div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <span>↗ +12.4%</span>
                <span className="text-slate-500">consolidated return rate</span>
              </div>
            </div>

            {/* Equities Card */}
            <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Equities & CDS Holdings</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-2">LKR 8,750.00</div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>JKH.N (100)</span>
                <span>PLR.N (150)</span>
                <span className="text-purple-400 font-semibold">Dividends Active</span>
              </div>
            </div>

            {/* Guaranteed Capital Card */}
            <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Guaranteed Fixed Reserves</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-2">LKR 2,000,000.00</div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>Commercial Bank</span>
                <span className="text-emerald-400 font-bold">9.5% p.a.</span>
                <span>12 Months</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- CORE FEATURES & CAPABILITIES --- */}
      <section id="features" className="max-w-7xl mx-auto px-4 mb-28 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Enterprise Architecture</h2>
          <h3 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Engineered for high-conviction wealth allocation.
          </h3>
          <p className="mt-4 text-slate-400 text-base sm:text-lg">
            Standard budgeting apps fail because they isolate expenses from balance sheets. 
            WealthWise bridges cash flow, investments, and capital reserves into one engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Cash Flow */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Cash Flow Management</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Track multi-category income and operational expenditures. High-velocity ledger keeps your liquid burn rate balanced in real time.
            </p>
          </div>

          {/* Card 2: Stock Engine */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-white mb-2">CSE Equity Tracking</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Log equity transactions with automated weighted-average pricing and automatic liquid cash balance deductions.
            </p>
          </div>

          {/* Card 3: Fixed Deposits */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Guaranteed Fixed Reserves</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Model institutional banking deposits across varying tenor profiles (6 months to 5 years) to lock in low-risk yields.
            </p>
          </div>

          {/* Card 4: Dividend Reconciliation */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Dual-Ledger Dividend Engine</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Dividends logged on equity holdings automatically write an authenticated INCOME transaction into cash flow with zero duplicate entries.
            </p>
          </div>

        </div>
      </section>

      {/* --- HOW IT WORKS (THE 3-STEP PIPELINE) --- */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 mb-28">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/30 p-8 sm:p-12">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white">How the Dual Ledger Operates</h3>
            <p className="text-slate-400 mt-2 text-sm sm:text-base">
              Automated cascading logic ensures your liquid accounts, portfolios, and reports remain perfectly balanced.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mb-4 shadow-lg shadow-blue-600/30">
                1
              </div>
              <h5 className="text-lg font-bold text-white mb-2">Authenticate & Input</h5>
              <p className="text-xs sm:text-sm text-slate-400">
                Every request carries an encrypted JWT token. Enter salary, purchase equities, or lock in fixed deposits securely.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/30">
                2
              </div>
              <h5 className="text-lg font-bold text-white mb-2">Relational Cascading</h5>
              <p className="text-xs sm:text-sm text-slate-400">
                Stock purchases auto-deduct cash. Dividends auto-credit liquid reserves. Foreign keys enforce user isolation across all tables.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center mb-4 shadow-lg shadow-emerald-600/30">
                3
              </div>
              <h5 className="text-lg font-bold text-white mb-2">Consolidated Intelligence</h5>
              <p className="text-xs sm:text-sm text-slate-400">
                The master dashboard executes non-blocking parallel queries via Promise.all to recalculate your real-time net worth with zero drift.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* --- ENTERPRISE SECURITY ARCHITECTURE --- */}
      <section className="max-w-7xl mx-auto px-4 mb-24">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 text-center max-w-4xl mx-auto">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
            Zero-Trust Security & Multi-Tenancy
          </h3>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
            Built with modern security principles. Spring Security validates JWT cryptographic signatures on every HTTP mutation. 
            User identities are extracted server-side using Spring Security&apos;s authentication principal—mitigating IDOR vulnerabilities completely.
          </p>

          <div className="flex flex-wrap justify-center gap-3 text-xs font-mono text-slate-300">
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">Spring Security 7</span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">PostgreSQL Strict Constraints</span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">Next.js 15 App Router</span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">HTTP-Only JWT Bridge</span>
          </div>
        </div>
      </section>

      {/* --- BOTTOM CALL TO ACTION BANNER --- */}
      <section className="max-w-5xl mx-auto px-4 mb-20 text-center">
        <div className="p-10 rounded-3xl bg-blue-600 text-white relative overflow-hidden shadow-2xl shadow-blue-600/30">
          <div className="relative z-10">
            <h3 className="text-3xl sm:text-4xl font-extrabold mb-4">Ready to take control of your wealth?</h3>
            <p className="text-blue-100 max-w-xl mx-auto mb-8 text-sm sm:text-base">
              Start consolidating your assets, dividends, and banking deposits in one intelligent workspace today.
            </p>
            {token ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-950 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-lg"
              >
                Go to Master Dashboard →
              </Link>
            ) : (
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
              >
                Create Your Account Now →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="max-w-7xl mx-auto px-4 pt-12 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-2 font-bold text-slate-400">
          <span className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">W</span>
          WealthWise Financial Systems
        </div>
        <p>© 2026 WealthWise Ecosystem. Enterprise Financial Modeling Architecture.</p>
        <div className="flex items-center gap-4">
          <a href="#features" className="hover:text-slate-400 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-slate-400 transition-colors">Architecture</a>
          <Link href="/login" className="hover:text-slate-400 transition-colors">Sign In</Link>
        </div>
      </footer>

    </div>
  );
}
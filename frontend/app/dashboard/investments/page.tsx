/*
 * THEORY: Next.js Server Components, Cookie Authentication & Parallel Aggregation
 * ---------------------------------------------------------------------------------
 * 1. Server Component Execution: This component executes exclusively on the server (Node runtime),
 *    never exposing API secrets or raw tokens to the client browser bundle.
 * 2. Next.js 15 Async Cookie Resolution: In newer Next.js releases, cookies() returns a Promise. 
 *    We must 'await cookies()' before invoking .get("jwt") to prevent runtime Promise rejection.
 * 3. Dynamic User Resolution: Rather than requesting hardcoded sandbox data ('user/1'), 
 *    we query '/api/users/me' to dynamically determine the authenticated user's database ID.
 * 4. Eliminating Network Waterfalls: Once the dynamic userId is known, Promise.all initiates 
 *    both the Portfolio and Fixed Deposit HTTP queries concurrently, avoiding sequential round trips.
 */
import AssetForm from "../../components/AssetForm";
import DividendForm from "../../components/DividendForm";
import PortfolioTable from "../../components/PortfolioTable";
import FixedDepositForm from "../../components/FixedDepositForm";
import FixedDepositTable from "../../components/FixedDepositTable";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Dedicated data fetcher for equities/shares vertical
async function getPortfolio(userId: number, fetchOptions: RequestInit) {
  const res = await fetch(`http://localhost:8080/api/assets/user/${userId}`, fetchOptions);
  return res.ok ? res.json() : [];
}

// Dedicated data fetcher for fixed deposit vertical
async function getFixedDeposits(userId: number, fetchOptions: RequestInit) {
  const res = await fetch(`http://localhost:8080/api/fixed-deposits/user/${userId}`, fetchOptions);
  return res.ok ? res.json() : [];
}

export default async function InvestmentsPage() {
  /*
   * THEORY: Cookie Bridge Extraction & Route Guard
   * Retrieve the JWT token saved by AuthContext. If no token exists, the user is unauthenticated;
   * redirect immediately to the login portal before rendering any protected markup.
   */
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;

  if (!token) {
    redirect("/login");
  }

  // Construct standard Bearer authorization header required by Spring Security filter chain
  const fetchOptions: RequestInit = {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  /*
   * THEORY: Sequential Identity Query
   * Resolve who the active user is before requesting their domain-specific financial records.
   */
  const userRes = await fetch("http://localhost:8080/api/users/me", fetchOptions);
  if (!userRes.ok) {
    redirect("/login");
  }
  const user = await userRes.json();
  const dynamicUserId: number = user.id;

  /*
   * THEORY: Parallel Data Fetching via Promise.all
   * Both data streams execute simultaneously over the network. The thread resumes only when both
   * requests resolve, halving total load time compared to sequential 'await' calls.
   */
  const [assets, fixedDeposits] = await Promise.all([
    getPortfolio(dynamicUserId, fetchOptions),
    getFixedDeposits(dynamicUserId, fetchOptions),
  ]);

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* --- EQUITY SECTION --- */}
      <section className="space-y-8">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Stock Market Simulator</h2>
          <p className="text-gray-500 mt-2">Deploy capital, log dividends, and manage your CDS portfolio.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AssetForm />
          {/* Passing the live asset collection as props to populate the dividend dropdown */}
          <DividendForm assets={assets} />
        </div>

        {/* Live holdings table reflecting dynamic database state */}
        <PortfolioTable assets={assets} />
      </section>

      {/* --- FIXED DEPOSIT SECTION --- */}
      <section className="space-y-8 mt-12">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Guaranteed Investments</h2>
          <p className="text-gray-500 mt-2">Track low-risk Fixed Deposits to balance your portfolio.</p>
        </div>

        {/* Constraining maximum width for balanced typography and UI hierarchy on wide monitors */}
        <div className="max-w-5xl">
          <FixedDepositForm />
        </div>

        <FixedDepositTable deposits={fixedDeposits} />
      </section>
    </div>
  );
}
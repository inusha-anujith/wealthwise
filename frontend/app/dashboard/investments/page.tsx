import AssetForm from "../../components/AssetForm";
import DividendForm from "../../components/DividendForm";
import PortfolioTable from "../../components/PortfolioTable";
import FixedDepositForm from "../../components/FixedDepositForm";
import FixedDepositTable from "../../components/FixedDepositTable";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function getPortfolio(fetchOptions: RequestInit) {
  const res = await fetch("http://localhost:8080/api/assets", fetchOptions);
  return res.ok ? res.json() : [];
}

async function getFixedDeposits(fetchOptions: RequestInit) {
  const res = await fetch("http://localhost:8080/api/fixed-deposits", fetchOptions);
  return res.ok ? res.json() : [];
}

export default async function InvestmentsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;

  if (!token) {
    redirect("/login");
  }

  const fetchOptions: RequestInit = {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // An expired or invalid session goes back to login.
  const userRes = await fetch("http://localhost:8080/api/users/me", fetchOptions);
  if (!userRes.ok) {
    redirect("/login");
  }

  const [assets, fixedDeposits] = await Promise.all([
    getPortfolio(fetchOptions),
    getFixedDeposits(fetchOptions),
  ]);

  return (
    <div className="space-y-12 animate-fadeIn">
      <section className="space-y-8">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">CSE Stocks</h2>
          <p className="text-slate-400 mt-2">Track your holdings, current value, dividends and sales.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AssetForm />
          <DividendForm assets={assets} />
        </div>

        <PortfolioTable assets={assets} />
      </section>

      <section className="space-y-8 mt-12">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Fixed Deposits</h2>
          <p className="text-slate-400 mt-2">Track your deposits, maturity values and returned money.</p>
        </div>

        <FixedDepositForm />

        <FixedDepositTable deposits={fixedDeposits} />
      </section>
    </div>
  );
}
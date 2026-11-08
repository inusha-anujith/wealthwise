import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "WealthWise | Salary and Wealth Planner",
  description: "Plan your salary, track cash flow, and compare fixed deposits and CSE stocks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <Navbar />

          <main className="w-full">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
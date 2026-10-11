import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "WealthWise | Enterprise Financial Architecture",
  description: "Unified cash flow, equity portfolio, and fixed deposit management ecosystem.",
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
          {/* Global Dark Navigation Bar */}
          <Navbar />
          
          {/* Main Viewport Container */}
          <main className="w-full">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
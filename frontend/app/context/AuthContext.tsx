/*
 * THEORY: Global State & The Cookie Bridge.
 * The AuthContext acts as a global state manager for the frontend.
 * We must store the JWT in TWO places: 
 * 1. localStorage (for the React Client Components to read).
 * 2. cookies (for the Next.js Server Components to intercept during rendering).
 */
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type AuthContextType = {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // THEORY: Hydration. When the app boots, check if a token exists from a previous session.
    const storedToken = localStorage.getItem("jwt");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const login = (jwt: string) => {
    // 1. Save to localStorage for standard React components
    localStorage.setItem("jwt", jwt);
    
    // 2. Build the Cookie Bridge. 'path=/' ensures the cookie travels to all backend routes.
    document.cookie = `jwt=${jwt}; path=/`;
    
    setToken(jwt);
    
    /* 
     * THEORY: The Hard Redirect.
     * Instead of a soft Next.js router.push(), we force the browser to reload the page.
     * This guarantees the HTTP request physically carries our newly minted cookie 
     * to the backend Server Component, bypassing the "Bouncer Bounce-Back Loop".
     */
    window.location.href = "/dashboard";
  };

  const logout = () => {
    // THEORY: Security Cleanup. Actively destroy both storage mediums to prevent session hijacking.
    localStorage.removeItem("jwt");
    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setToken(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

// The login token lives in an HttpOnly cookie that JavaScript can't read.
// This context only knows who is logged in, by asking the backend.
type User = {
  id: number;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    // The browser sends the cookie automatically, because /api is on the same site.
    fetch("/api/users/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: User | null) => {
        if (isCurrent) setUser(data);
      })
      .catch(() => {
        if (isCurrent) setUser(null);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  // A full page load makes the server pages read the new cookie straight away.
  const login = useCallback(() => {
    window.location.href = "/dashboard";
  }, []);

  // Only the backend can delete an HttpOnly cookie, so logging out is an API call.
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  }, []);

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

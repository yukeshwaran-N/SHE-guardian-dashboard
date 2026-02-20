// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

// Update User type to match your table
interface User {
  id: string;        // This stores the ID (admin01, delivery01)
  role: 'admin' | 'delivery';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (id: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("sakhi_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (id: string, password: string) => {
    try {
      console.log("Attempting login with ID:", id); // For debugging
      
      // Query Supabase directly
      const { data, error } = await supabase
        .from('user')
        .select('id, role')
        .eq('id', id)
        .eq('password', password)
        .single();

      if (error || !data) {
        console.log("Login error or no data:", error);
        return { success: false, error: "Invalid ID or Password" };
      }

      // Login successful
      const userData = {
        id: data.id,
        role: data.role as 'admin' | 'delivery'
      };

      setUser(userData);
      localStorage.setItem("sakhi_user", JSON.stringify(userData));

      return { success: true };

    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: "Connection error. Please try again." };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("sakhi_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
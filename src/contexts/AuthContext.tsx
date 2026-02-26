// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { usersService, User } from "@/services/usersService";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session
  useEffect(() => {
    const storedUser = localStorage.getItem("sakhi_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log("Login attempt:", email);
      
      const userData = await usersService.login(email, password);
      
      // Update last login (don't wait for it)
      usersService.updateLastLogin(userData.id).catch(console.error);

      setUser(userData);
      localStorage.setItem("sakhi_user", JSON.stringify(userData));

      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (userData.role === 'delivery') {
        navigate('/delivery', { replace: true });
      } else if (userData.role === 'asha') {
        navigate('/asha', { replace: true });
      } else if (userData.role === 'woman') {
        navigate('/woman', { replace: true });
      }

      return { success: true };

    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Invalid email or password" };
    }
  }, [navigate]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("sakhi_user");
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      loading,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
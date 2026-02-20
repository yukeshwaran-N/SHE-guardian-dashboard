// src/pages/Login.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Shield } from "lucide-react";
import sakhiLogo from "@/assets/sakhi-logo.png";

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [id, setId] = useState(""); // Changed from email to id
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const dest = user.role === "admin" ? "/admin" : "/delivery";
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!id || !password) { 
      setError("Please enter ID and password"); 
      return; 
    }
    
    setLoading(true);
    const res = await login(id, password);
    setLoading(false);
    
    if (!res.success) {
      setError(res.error || "Login failed");
    }
    // No need for manual redirect here - useEffect will handle it
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <img src={sakhiLogo} alt="SAKHI" className="mx-auto h-20 w-20" />
          <h1 className="mt-4 text-2xl font-bold text-foreground">SAKHI</h1>
          <p className="text-sm text-muted-foreground">Women's Health Support Platform</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-primary/5 p-3 text-sm text-primary">
            <Shield className="h-4 w-4 shrink-0" />
            <span>Secure Government Portal — Authorized access only</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="id">ID</Label>
              <Input
                id="id"
                type="text"
                placeholder="Enter your ID (e.g., admin01)"
                value={id}
                onChange={(e) => setId(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button className="text-sm text-primary hover:underline">Forgot Password?</button>
          </div>

          {/* Demo credentials - Updated to show ID instead of email */}
          <div className="mt-5 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
            <p className="mb-1 font-semibold">Demo Credentials:</p>
            <p>Admin: admin01 / admin123</p>
            <p>Delivery: delivery01 / delivery123</p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © 2026 SAKHI — Government of India Initiative
        </p>
      </div>
    </div>
  );
}
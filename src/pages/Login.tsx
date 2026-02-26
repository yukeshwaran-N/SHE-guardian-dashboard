// src/pages/Login.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Shield, Loader2 } from "lucide-react";
import sakhiLogo from "@/assets/sakhi-logo.png";

export default function Login() {
  const { login, isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const dest = `/${user.role}`;
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) { 
      setError("Please enter email and password"); 
      return; 
    }
    
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    
    if (!res.success) {
      setError(res.error || "Login failed");
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <img src={sakhiLogo} alt="SAKHI" className="mx-auto h-20 w-20" />
          <h1 className="mt-4 text-2xl font-bold text-foreground">SAKHI</h1>
          <p className="text-sm text-muted-foreground">Women's Health Support Platform</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-primary/5 p-3 text-sm text-primary">
            <Shield className="h-4 w-4 shrink-0" />
            <span>Secure Government Portal — Authorized access only</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
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
                  disabled={loading}
                  required
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
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-5 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
            <p className="mb-1 font-semibold">Demo Credentials:</p>
            <p>Admin: admin@sakhi.gov.in / admin123</p>
            <p>Delivery: delivery@sakhi.gov.in / delivery123</p>
            <p>ASHA: asha1@sakhi.gov.in / asha123</p>
            <p>Woman: woman1@sakhi.gov.in / woman123</p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © 2026 SAKHI — Government of India Initiative
        </p>
      </div>
    </div>
  );
}
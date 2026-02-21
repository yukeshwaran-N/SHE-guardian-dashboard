// src/pages/Login.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import sakhiLogo from "@/assets/sakhi-logo.png";

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
  };

  // Animated background elements
  const floatingShapes = Array.from({ length: 8 });

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Animated Background Shapes */}
      {floatingShapes.map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full mix-blend-multiply filter blur-3xl"
          style={{
            background: `linear-gradient(135deg, ${
              i % 3 === 0 ? '#fce7f3' : i % 3 === 1 ? '#f3e8ff' : '#e0e7ff'
            } 0%, ${
              i % 3 === 0 ? '#fbcfe8' : i % 3 === 1 ? '#e9d5ff' : '#c7d2fe'
            } 100%)`,
            width: `${Math.random() * 400 + 200}px`,
            height: `${Math.random() * 400 + 200}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo Section with Animation */}
          <motion.div 
            className="mb-8 text-center"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full blur-xl opacity-30 animate-pulse" />
              <img 
                src={sakhiLogo} 
                alt="SHE" 
                className="relative h-24 w-24 mx-auto drop-shadow-2xl"
              />
            </div>
            <motion.h1 
              className="mt-4 text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: '200% 200%' }}
            >
              SHE
            </motion.h1>
            <p className="text-sm text-gray-600 mt-1">Women's Health Support Platform</p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20"
          >
            {/* Security Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="mb-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 p-3 text-sm text-pink-700 border border-pink-200"
            >
              <Shield className="h-4 w-4 shrink-0" />
              <span>Secure Government Portal — Authorized access only</span>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* ID Field */}
              <div className="space-y-2">
                <Label htmlFor="id" className="text-gray-700 font-medium">
                  ID
                </Label>
                <div className="relative">
                  <Input
                    id="id"
                    type="text"
                    placeholder="Enter your ID (e.g., admin01)"
                    className={`pl-4 py-6 text-base border-2 transition-all duration-300 ${
                      focusedField === 'id' 
                        ? 'border-pink-400 ring-4 ring-pink-100 scale-[1.02]' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    onFocus={() => setFocusedField('id')}
                    onBlur={() => setFocusedField(null)}
                    autoComplete="username"
                  />
                  {focusedField === 'id' && (
                    <motion.div
                      layoutId="fieldGlow"
                      className="absolute -inset-0.5 bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg -z-10 opacity-30"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    className={`pl-4 pr-12 py-6 text-base border-2 transition-all duration-300 ${
                      focusedField === 'password' 
                        ? 'border-purple-400 ring-4 ring-purple-100 scale-[1.02]' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  {focusedField === 'password' && (
                    <motion.div
                      layoutId="fieldGlow"
                      className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg -z-10 opacity-30"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-3"
                >
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <span className="h-2 w-2 bg-red-600 rounded-full animate-pulse" />
                    {error}
                  </p>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full py-6 text-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/25 transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </motion.div>

              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-gray-500 hover:text-pink-600 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </form>

            {/* Demo Credentials Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-6 rounded-xl border border-dashed border-pink-200 bg-gradient-to-r from-pink-50/50 to-purple-50/50 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-pink-600" />
                <span className="text-sm font-semibold text-gray-700">Demo Access</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-pink-100">
                  <p className="text-xs font-bold text-pink-700 mb-1">Admin</p>
                  <p className="text-xs text-gray-600">ID: admin01</p>
                  <p className="text-xs text-gray-600">Pass: admin123</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-purple-100">
                  <p className="text-xs font-bold text-purple-700 mb-1">Delivery</p>
                  <p className="text-xs text-gray-600">ID: delivery01</p>
                  <p className="text-xs text-gray-600">Pass: delivery123</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-500">
            © 2026 SHE — Government of India Initiative
          </p>
        </motion.div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
          <path
            fill="url(#footerGradient)"
            fillOpacity="0.3"
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          />
          <defs>
            <linearGradient id="footerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
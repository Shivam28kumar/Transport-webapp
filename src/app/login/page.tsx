"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/logo";
import {
  Lock,
  User,
  AlertCircle,
  Loader2,
  Leaf,
  Truck,
  TrendingUp,
  Handshake,
  Route,
} from "lucide-react";

const featurePills = [
  { label: "Logistics", icon: Truck },
  { label: "Bioenergy", icon: Leaf },
  { label: "Sustainable Future", icon: Route },
];

const trustBadges = [
  { label: "Sustainable", desc: "Eco-friendly & renewable future", icon: Leaf },
  { label: "Reliable", desc: "Strong logistics network", icon: Truck },
  { label: "Growth", desc: "Built for today, ready for tomorrow", icon: TrendingUp },
  { label: "Trust", desc: "Integrity, transparency & commitment", icon: Handshake },
];

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Force a hard navigation to refresh the middleware state
        window.location.href = "/dashboard";
      } else {
        setError(data.error || "Invalid username or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F4F7FA]">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden brand-hero-gradient flex-col justify-between p-12">
        <div className="absolute top-1/3 -left-24 w-72 h-72 bg-[#3fae57]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#d4af6a]/10 rounded-full blur-[110px] pointer-events-none" />

        <Logo markSize={44} inverted tagline />

        <div className="relative z-10 space-y-8 max-w-md">
          <h1 className="font-heading text-4xl font-black text-white leading-tight tracking-tight">
            Enterprise logistics,
            <br />
            engineered for scale.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            One cockpit for fleet operations, dispatch, and finance — built for
            transport and bioenergy businesses that move fast and stay accountable.
          </p>
          <div className="flex flex-wrap gap-2">
            {featurePills.map((pill) => (
              <span
                key={pill.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-white backdrop-blur-sm"
              >
                <pill.icon className="w-3.5 h-3.5 text-emerald-300" />
                {pill.label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {trustBadges.map((badge) => (
            <div key={badge.label} className="space-y-1.5">
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                <badge.icon className="w-4 h-4 text-emerald-300" />
              </div>
              <p className="text-xs font-bold text-white">{badge.label}</p>
              <p className="text-[10px] text-slate-400 leading-snug">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1f8a4c]/5 rounded-full blur-3xl pointer-events-none lg:hidden" />

        <div className="w-full max-w-md relative z-10 space-y-8">
          {/* Mobile-only brand header */}
          <div className="lg:hidden flex flex-col items-center text-center gap-2">
            <Logo markSize={44} tagline />
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-[20px] shadow-xl shadow-[#0B1F4D]/5 p-8">
            <div className="text-center mb-6 space-y-1">
              <h2 className="font-heading text-xl font-black text-[#0B1F4D]">
                Welcome back
              </h2>
              <p className="text-sm text-slate-400 font-medium">
                Sign in to the Logistics &amp; Fleet Management Console
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-600 font-medium animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#0B1F4D]">Username</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="admin"
                    className="pl-10 h-11 bg-white border-[#E5E7EB] rounded-xl text-[#0B1F4D] placeholder-slate-400 focus-visible:ring-[#1f8a4c]/40 focus-visible:border-[#1f8a4c]"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#0B1F4D]">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-11 bg-white border-[#E5E7EB] rounded-xl text-[#0B1F4D] placeholder-slate-400 focus-visible:ring-[#1f8a4c]/40 focus-visible:border-[#1f8a4c]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#0B1F4D] hover:bg-[#0B1F4D]/90 text-white font-bold rounded-xl shadow-lg shadow-[#0B1F4D]/20 mt-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Access Dashboard"
                )}
              </Button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-4 text-center">
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Authorized personnel only. Create login credentials directly inside
                the MongoDB database{" "}
                <code className="text-slate-500 font-mono">users</code> collection
                to grant console access.
              </p>
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-400 font-medium">
            © {new Date().getFullYear()} Veltrix Group — Logistics · Bioenergy · Sustainable Future
          </p>
        </div>
      </div>
    </div>
  );
}

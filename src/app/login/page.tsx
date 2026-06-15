"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bot,
  BookOpen,
  Shield,
  TrendingUp,
} from "lucide-react";
import { apiPost } from "@/lib/api-client";
import { TradeQuestLogo } from "@/components/TradeQuestLogo";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email, password }
          : { email, password, name };

      const { ok, data } = await apiPost<{ error?: string }>(endpoint, body);

      if (!ok) {
        setError(data?.error ?? "Something went wrong.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: TrendingUp, text: "Realistic simulated markets" },
    { icon: BookOpen, text: "12 guided trading lessons" },
    { icon: Bot, text: "AI coach that teaches, not tells" },
    { icon: Shield, text: "Your progress saved to your account" },
  ];

  return (
    <div className="relative min-h-screen flex">
      <div className="app-bg" />

      {/* Left branding panel */}
      <div className="relative z-10 hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <TradeQuestLogo size={48} priority />
            <span className="text-2xl font-bold tracking-tight">TradeQuest</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight mb-4">
            Master day trading
            <br />
            <span className="gradient-text">without risking real money.</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-md leading-relaxed">
            Start with $100 in a realistic simulator. Learn from expert guides and an AI coach
            that helps you think like a trader.
          </p>
        </div>

        <div className="space-y-4">
          {features.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-[var(--text-secondary)]">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-[var(--border-subtle)]">
                <Icon className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-sm">{text}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          Educational simulation only. Not financial advice.
        </p>
      </div>

      {/* Right form panel */}
      <div className="relative z-10 flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <TradeQuestLogo size={44} priority />
            <span className="text-xl font-bold">TradeQuest</span>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {mode === "login"
                  ? "Sign in to continue your trading journey."
                  : "Start learning with $100 virtual cash."}
              </p>
            </div>

            <div className="mb-6 flex rounded-xl bg-black/30 p-1 border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
                  mode === "login"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => { setMode("register"); setError(""); }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
                  mode === "register"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="input-field w-full rounded-xl px-4 py-3 text-sm"
                    required
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field w-full rounded-xl px-4 py-3 text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "Min. 6 characters" : "Your password"}
                  className="input-field w-full rounded-xl px-4 py-3 text-sm"
                  required
                  minLength={mode === "register" ? 6 : 1}
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm"
              >
                {loading ? (
                  <div className="loading-spinner !w-5 !h-5 !border-2" />
                ) : (
                  <>
                    {mode === "login" ? "Sign in" : "Create account"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  BookOpen,
  ChartLine,
  Cloud,
  LogOut,
  RotateCcw,
} from "lucide-react";
import { AppProvider, useApp } from "./AppProvider";
import { AuthProvider, useAuth } from "./AuthProvider";
import { TradeView } from "./TradeView";
import { GuidesView } from "./GuidesView";
import { CoachFab } from "./CoachFab";
import { TradeQuestLogo } from "./TradeQuestLogo";

type Tab = "trade" | "guides";

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-xs font-bold text-white shadow-lg shadow-emerald-500/20">
      {initials}
    </div>
  );
}

function AppShell() {
  const [tab, setTab] = useState<Tab>("trade");
  const { user, logout } = useAuth();
  const { totalValue, totalPnL, portfolio, resetAccount, saving } = useApp();

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="app-bg" />

      <header className="relative z-50 sticky top-0 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <TradeQuestLogo size={44} priority />
            <div>
              <h1 className="text-lg font-bold tracking-tight">TradeQuest</h1>
              <p className="text-xs text-[var(--text-muted)]">Paper trading simulator</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex items-center gap-3">
              <div className="stat-pill">
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Portfolio</p>
                <p className="font-mono text-sm font-semibold text-emerald-400">
                  ${totalValue.toFixed(2)}
                </p>
              </div>
              <div className="stat-pill">
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">P&L</p>
                <p
                  className={`font-mono text-sm font-semibold ${
                    totalPnL >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
                </p>
              </div>
              <div className="stat-pill">
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Cash</p>
                <p className="font-mono text-sm font-semibold">${portfolio.cash.toFixed(2)}</p>
              </div>
            </div>

            {saving && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <Cloud className="h-3.5 w-3.5 animate-pulse-glow" />
                Saving…
              </div>
            )}

            <button
              onClick={() => {
                if (confirm("Reset your account back to $100? All trades will be cleared.")) {
                  resetAccount();
                }
              }}
              className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-white/5 px-3 py-2 text-xs text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-subtle)]">
                <UserAvatar name={user.name} />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)] transition hover:bg-white/5 hover:text-white"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-2 px-4 pb-3 lg:px-6">
          {([
            { id: "trade" as Tab, label: "Trade", icon: ChartLine },
            { id: "guides" as Tab, label: "Guides", icon: BookOpen },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                tab === id
                  ? "nav-tab-active"
                  : "text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-secondary)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex-1 w-full max-w-7xl px-4 py-6 lg:px-6">
        {tab === "trade" && <TradeView />}
        {tab === "guides" && <GuidesView />}
      </main>

      <CoachFab />

      <footer className="relative z-10 border-t border-[var(--border-subtle)] py-4 text-center text-xs text-[var(--text-muted)]">
        Simulated market data for educational purposes only. Not financial advice.
      </footer>
    </div>
  );
}

export function TradeQuestApp() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </AuthProvider>
  );
}

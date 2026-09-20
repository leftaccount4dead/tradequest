"use client";

import { useEffect, useState } from "react";
import { Medal, RefreshCw, Trophy } from "lucide-react";
import { apiGet } from "@/lib/api-client";
import type { LeaderboardEntry } from "@/lib/leaderboard";
import { STARTING_BALANCE } from "@/lib/constants";

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Medal className="h-5 w-5 text-amber-400" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-300" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-xs font-semibold text-[var(--text-muted)]">
      {rank}
    </span>
  );
}

export function LeaderboardView() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    const { ok, data } = await apiGet<{ entries?: LeaderboardEntry[]; error?: string }>(
      "/api/leaderboard",
    );
    if (!ok || !data?.entries) {
      setError(data?.error ?? "Could not load leaderboard.");
      setEntries([]);
    } else {
      setEntries(data.entries);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h2 className="text-xl font-bold tracking-tight">Classroom leaderboard</h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)] leading-relaxed">
            Everyone starts with ${STARTING_BALANCE} virtual cash. Rankings use your latest portfolio
            value — compete on return %, not trade picks. The AI coach teaches; it never tells you
            what to buy.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-white/5 px-4 py-2.5 text-sm text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl">
        {loading && entries.length === 0 ? (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-[var(--text-muted)]">
            <div className="loading-spinner" />
            Loading rankings…
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center text-sm text-red-400">{error}</div>
        ) : entries.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
            No traders on the board yet. Make a trade and refresh.
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {entries.map((entry) => (
              <div
                key={`${entry.rank}-${entry.name}`}
                className={`flex items-center gap-3 px-4 py-3.5 sm:px-6 sm:py-4 ${
                  entry.isYou ? "bg-emerald-500/5" : ""
                }`}
              >
                <RankBadge rank={entry.rank} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">
                    {entry.name}
                    {entry.isYou && (
                      <span className="ml-2 text-xs font-normal text-emerald-400">You</span>
                    )}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    ${entry.totalValue.toFixed(2)} portfolio value
                  </p>
                </div>
                <p
                  className={`font-mono text-sm font-semibold shrink-0 ${
                    entry.returnPercent >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {entry.returnPercent >= 0 ? "+" : ""}
                  {entry.returnPercent.toFixed(2)}%
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-[var(--text-muted)] text-center">
        Rankings update when traders save progress. Values reflect simulated mark-to-market when available.
      </p>
    </div>
  );
}

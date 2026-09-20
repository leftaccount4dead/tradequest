"use client";

import { useApp } from "./AppProvider";
import { cn } from "@/lib/utils";
import { GlassCard } from "./ui/GlassCard";

export function TradeHistory() {
  const { portfolio } = useApp();
  const recentTrades = portfolio.trades.slice(-10).reverse();

  return (
    <GlassCard padding="md">
      <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Recent Trades
      </h2>

      {recentTrades.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] text-center py-6">No trades yet</p>
      ) : (
        <div className="space-y-2">
          {recentTrades.map((trade) => (
            <div
              key={trade.id}
              className="flex items-center justify-between rounded-xl bg-black/25 border border-[var(--border-subtle)] px-3 py-2.5"
            >
              <div>
                <span
                  className={cn(
                    "text-xs font-bold uppercase",
                    trade.side === "buy" ? "text-emerald-400" : "text-red-400",
                  )}
                >
                  {trade.side}
                </span>
                <span className="text-sm font-medium ml-1.5">{trade.symbol}</span>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  {new Date(trade.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm">{trade.shares} @ ${trade.price.toFixed(2)}</p>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  ${(trade.shares * trade.price).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

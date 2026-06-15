"use client";

import { useApp } from "./AppProvider";
import { getChange } from "@/lib/market/simulator";
import { cn } from "@/lib/utils";
import { GlassCard } from "./ui/GlassCard";

export function StockList() {
  const { stocks, selectedSymbol, setSelectedSymbol } = useApp();

  return (
    <GlassCard padding="sm">
      <h2 className="mb-3 px-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Watchlist
      </h2>
      <div className="space-y-1">
        {stocks.map((stock) => {
          const { percent } = getChange(stock);
          const isSelected = stock.symbol === selectedSymbol;

          return (
            <button
              key={stock.symbol}
              onClick={() => setSelectedSymbol(stock.symbol)}
              className={cn(
                "w-full rounded-xl px-3 py-3 text-left transition-all duration-200",
                isSelected
                  ? "bg-emerald-500/10 border border-emerald-500/30 shadow-[var(--glow-emerald)]"
                  : "border border-transparent hover:bg-white/5",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-semibold text-sm">{stock.symbol}</span>
                  <p className="text-xs text-[var(--text-muted)] truncate">{stock.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-sm font-medium">${stock.price.toFixed(2)}</p>
                  <p
                    className={cn(
                      "font-mono text-xs font-medium",
                      percent >= 0 ? "text-emerald-400" : "text-red-400",
                    )}
                  >
                    {percent >= 0 ? "+" : ""}{percent.toFixed(2)}%
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}

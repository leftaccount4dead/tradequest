"use client";

import { useApp } from "./AppProvider";
import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "./ui/GlassCard";

export function PortfolioPanel() {
  const { portfolio, stocks, totalValue, unrealizedPnL, totalPnL } = useApp();

  const prices: Record<string, number> = {};
  stocks.forEach((s) => { prices[s.symbol] = s.price; });

  return (
    <GlassCard padding="md">
      <div className="mb-4 flex items-center gap-2">
        <Wallet className="h-4 w-4 text-emerald-400" />
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Portfolio
        </h2>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-black/30 border border-[var(--border-subtle)] p-3">
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Value</p>
          <p className="font-mono text-lg font-bold text-emerald-400 mt-1">
            ${totalValue.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl bg-black/30 border border-[var(--border-subtle)] p-3">
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">P&L</p>
          <p
            className={cn(
              "font-mono text-lg font-bold mt-1",
              totalPnL >= 0 ? "text-emerald-400" : "text-red-400",
            )}
          >
            {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
          </p>
        </div>
      </div>

      {portfolio.positions.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] text-center py-6">
          No positions yet. Pick a stock and place your first trade!
        </p>
      ) : (
        <div className="space-y-2">
          {portfolio.positions.map((pos) => {
            const currentPrice = prices[pos.symbol] ?? pos.avgCost;
            const value = pos.shares * currentPrice;
            const pnl = (currentPrice - pos.avgCost) * pos.shares;
            const pnlPercent = ((currentPrice - pos.avgCost) / pos.avgCost) * 100;
            const riskOrder = portfolio.riskOrders?.find((order) => order.symbol === pos.symbol);

            return (
              <div
                key={pos.symbol}
                className="rounded-xl bg-black/25 border border-[var(--border-subtle)] px-3 py-3"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">{pos.symbol}</span>
                  <span className="font-mono text-sm font-medium">${value.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1.5">
                  <span>{pos.shares} @ ${pos.avgCost.toFixed(2)}</span>
                  <span
                    className={cn(
                      "font-mono font-medium",
                      pnl >= 0 ? "text-emerald-400" : "text-red-400",
                    )}
                  >
                    {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} ({pnlPercent >= 0 ? "+" : ""}{pnlPercent.toFixed(1)}%)
                  </span>
                </div>
                {riskOrder && (
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-[var(--border-subtle)] pt-2 text-[10px]">
                    {riskOrder.stopLoss !== undefined && <span className="text-red-400">Stop ${riskOrder.stopLoss.toFixed(2)}</span>}
                    {riskOrder.takeProfit !== undefined && <span className="text-emerald-400">Target ${riskOrder.takeProfit.toFixed(2)}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {unrealizedPnL !== 0 && (
        <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
          Unrealized: {unrealizedPnL >= 0 ? "+" : ""}${unrealizedPnL.toFixed(2)}
        </p>
      )}
    </GlassCard>
  );
}

"use client";

import { useMemo } from "react";
import type { Stock } from "@/lib/types";
import { generateOrderBook } from "@/lib/market/candles";
import { GlassCard } from "./ui/GlassCard";

export function MarketDepth({ stock }: { stock: Stock }) {
  const { bids, asks } = useMemo(
    () => generateOrderBook(stock.bid, stock.ask, stock.price),
  // Round to avoid regenerating on tiny price flickers
    [stock.bid, stock.ask, stock.price],
  );

  const maxSize = Math.max(...bids.map((b) => b.size), ...asks.map((a) => a.size), 1);
  const asksReversed = [...asks].reverse();

  return (
    <GlassCard padding="md">
      <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Order Book
      </h2>

      <div className="space-y-0.5 text-xs font-mono">
        <div className="mb-2">
          {asksReversed.map((level, i) => (
            <div key={`ask-${i}`} className="relative flex justify-between py-0.5 px-1">
              <div
                className="absolute inset-y-0 right-0 bg-red-500/15 rounded-sm"
                style={{ width: `${(level.size / maxSize) * 100}%` }}
              />
              <span className="relative text-red-600 dark:text-red-400 z-10">${level.price.toFixed(2)}</span>
              <span className="relative text-[var(--text-muted)] z-10">{level.size}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center py-2 border-y border-[var(--border-subtle)] my-1">
          <span className="text-[10px] text-[var(--text-muted)] uppercase">Spread</span>
          <span className="font-semibold text-[var(--text-primary)]">${stock.price.toFixed(2)}</span>
          <span className="text-[10px] text-[var(--text-muted)]">
            ${(stock.ask - stock.bid).toFixed(2)}
          </span>
        </div>

        <div>
          {bids.map((level, i) => (
            <div key={`bid-${i}`} className="relative flex justify-between py-0.5 px-1">
              <div
                className="absolute inset-y-0 right-0 bg-emerald-500/15 rounded-sm"
                style={{ width: `${(level.size / maxSize) * 100}%` }}
              />
              <span className="relative text-emerald-600 dark:text-emerald-400 z-10">${level.price.toFixed(2)}</span>
              <span className="relative text-[var(--text-muted)] z-10">{level.size}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-[10px] text-[var(--text-muted)] text-center">
        Simulated depth · Buy fills at ask · Sell fills at bid
      </p>
    </GlassCard>
  );
}

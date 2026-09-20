"use client";

import { BarChart3, Clock3, ExternalLink, Info } from "lucide-react";
import type { Stock } from "@/lib/types";
import { getChange, getSpread } from "@/lib/market/simulator";
import { GlassCard } from "./ui/GlassCard";

export function ResearchPanel({ stock }: { stock: Stock }) {
  const { percent } = getChange(stock);
  const spread = getSpread(stock);
  const range = stock.dayHigh - stock.dayLow;
  const rangePosition = range > 0 ? ((stock.price - stock.dayLow) / range) * 100 : 50;

  return (
    <GlassCard padding="md">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-cyan-400" />
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Research</h2>
        </div>
        <span className="flex items-center gap-1 text-[10px] text-amber-400" title="Quotes are delayed">
          <Clock3 className="h-3 w-3" /> Delayed
        </span>
      </div>

      <div className="mb-4">
        <p className="text-lg font-bold">{stock.name}</p>
        <p className="text-xs text-[var(--text-muted)]">{stock.symbol} · {stock.sector} · Paper trading only</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          ["Previous close", `$${stock.previousClose.toFixed(2)}`],
          ["Day change", `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`],
          ["Day high", `$${stock.dayHigh.toFixed(2)}`],
          ["Day low", `$${stock.dayLow.toFixed(2)}`],
          ["Volume", stock.volume.toLocaleString()],
          ["Spread", `$${spread.toFixed(2)}`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-[var(--border-subtle)] bg-black/20 px-2.5 py-2">
            <p className="text-[10px] text-[var(--text-muted)]">{label}</p>
            <p className="mt-0.5 font-mono font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-[10px] text-[var(--text-muted)]">
          <span>Day range</span>
          <span>{Math.max(0, Math.min(100, rangePosition)).toFixed(0)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-red-500/40">
          <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.max(0, Math.min(100, rangePosition))}%` }} />
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 border-t border-[var(--border-subtle)] pt-3 text-[10px] leading-relaxed text-[var(--text-muted)]">
        <Info className="mt-0.5 h-3 w-3 shrink-0 text-cyan-400" />
        <span>Use price, volume, range, and indicators to form a thesis before opening a position.</span>
        <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 opacity-50" />
      </div>
    </GlassCard>
  );
}
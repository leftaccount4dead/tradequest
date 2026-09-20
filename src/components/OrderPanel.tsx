"use client";

import { useState } from "react";
import { useApp } from "./AppProvider";
import { getPosition } from "@/lib/market/portfolio";
import { getSpread } from "@/lib/market/simulator";
import { cn } from "@/lib/utils";
import { GlassCard } from "./ui/GlassCard";

export function OrderPanel() {
  const { selectedStock, portfolio, buy, sell, setRiskOrder, tradeError, clearTradeError } = useApp();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [shares, setShares] = useState(1);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");

  const position = getPosition(portfolio, selectedStock.symbol);
  const fillPrice = side === "buy" ? selectedStock.ask : selectedStock.bid;
  const maxBuyShares = Math.floor(portfolio.cash / selectedStock.ask);
  const maxSellShares = position?.shares ?? 0;
  const totalCost = shares * fillPrice;
  const spread = getSpread(selectedStock);

  const handleSubmit = () => {
    setSuccess(null);
    clearTradeError();

    const stop = stopLoss ? Number(stopLoss) : undefined;
    const target = takeProfit ? Number(takeProfit) : undefined;
    if (side === "buy" && stop !== undefined && (stop <= 0 || stop >= fillPrice)) {
      setSuccess("Stop loss must be below the entry price.");
      return;
    }
    if (side === "buy" && target !== undefined && (target <= fillPrice)) {
      setSuccess("Take profit must be above the entry price.");
      return;
    }

    const error = side === "buy" ? buy(shares) : sell(shares);
    if (!error) {
      if (side === "buy" && (stop !== undefined || target !== undefined)) {
        setRiskOrder({ symbol: selectedStock.symbol, shares, stopLoss: stop, takeProfit: target });
      }
      setSuccess(
        `${side === "buy" ? "Opened" : "Closed"} ${shares} ${selectedStock.symbol} @ $${fillPrice.toFixed(2)} (market)`,
      );
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  return (
    <GlassCard padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Place Order
        </h2>
        <span className="rounded-md bg-white/5 border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
          Market Order
        </span>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 py-2">
          <p className="text-[10px] text-red-400/80">Bid</p>
          <p className="font-mono font-bold text-red-400">${selectedStock.bid.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-black/30 border border-[var(--border-subtle)] py-2">
          <p className="text-[10px] text-[var(--text-muted)]">Last</p>
          <p className="font-mono font-bold">${selectedStock.price.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 py-2">
          <p className="text-[10px] text-emerald-400/80">Ask</p>
          <p className="font-mono font-bold text-emerald-400">${selectedStock.ask.toFixed(2)}</p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-black/30 p-1.5 border border-[var(--border-subtle)]">
        <button
          onClick={() => { setSide("buy"); clearTradeError(); }}
          className={cn(
            "min-h-14 rounded-lg px-3 py-3 text-sm font-bold leading-tight transition",
            side === "buy"
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
              : "text-[var(--text-muted)] hover:text-white",
          )}
        >
          Open long @ Ask
        </button>
        <button
          onClick={() => { setSide("sell"); clearTradeError(); }}
          className={cn(
            "min-h-14 rounded-lg px-3 py-3 text-sm font-bold leading-tight transition",
            side === "sell"
              ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
              : "text-[var(--text-muted)] hover:text-white",
          )}
        >
          Close long @ Bid
        </button>
      </div>

      <div className="mb-5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-cyan-300">Risk controls</p>
          <p className="text-[10px] text-[var(--text-muted)]">Checked every 15 seconds</p>
        </div>
        {side === "buy" ? (
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[10px] text-[var(--text-muted)]">
              Stop loss
              <input type="number" min="0.01" step="0.01" placeholder={`Below $${fillPrice.toFixed(2)}`} value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} className="input-field mt-1 w-full rounded-lg px-2.5 py-2 text-xs" />
            </label>
            <label className="text-[10px] text-[var(--text-muted)]">
              Take profit
              <input type="number" min="0.01" step="0.01" placeholder={`Above $${fillPrice.toFixed(2)}`} value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} className="input-field mt-1 w-full rounded-lg px-2.5 py-2 text-xs" />
            </label>
          </div>
        ) : (
          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">Closing this position cancels its saved risk controls.</p>
        )}
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
          Shares
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            max={side === "buy" ? maxBuyShares : maxSellShares}
            value={shares}
            onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
            className="input-field flex-1 rounded-xl px-4 py-3 font-mono text-sm"
          />
          <button
            onClick={() =>
              setShares(side === "buy" ? Math.max(1, maxBuyShares) : Math.max(1, maxSellShares))
            }
            className="rounded-xl border border-[var(--border-subtle)] bg-white/5 px-4 py-3 text-xs font-medium text-[var(--text-secondary)] hover:bg-white/10"
          >
            Max
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          {side === "buy"
            ? `Max ${maxBuyShares} shares · Fills at ask $${selectedStock.ask.toFixed(2)}`
            : `Owned ${maxSellShares} shares · Fills at bid $${selectedStock.bid.toFixed(2)}`}
        </p>
      </div>

      <div className="mb-5 rounded-xl bg-black/30 border border-[var(--border-subtle)] px-4 py-3 space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-muted)]">Fill price</span>
          <span className="font-mono font-semibold">${fillPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-muted)]">
            {side === "buy" ? "Est. cost" : "Est. proceeds"}
          </span>
          <span className="font-mono font-semibold">${totalCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-[var(--text-muted)]">
          <span>Spread</span>
          <span className="font-mono">${spread.toFixed(2)}</span>
        </div>
      </div>

      {tradeError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {tradeError}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          {success}
        </div>
      )}

      {confirming && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          <p className="font-semibold text-amber-300">
            Confirm {side === "buy" ? "opening" : "closing"} {shares} {selectedStock.symbol} share{shares === 1 ? "" : "s"}?
          </p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            This simulated market order fills at the {side === "buy" ? "ask" : "bid"} of ${fillPrice.toFixed(2)}.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => { setConfirming(false); handleSubmit(); }}
              className={cn("flex-1 rounded-lg py-2 text-xs font-bold text-white", side === "buy" ? "bg-emerald-500" : "bg-red-500")}
            >
              Confirm order
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="flex-1 rounded-lg border border-[var(--border-subtle)] py-2 text-xs text-[var(--text-secondary)]">
              Cancel
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setConfirming(true)}
        disabled={
          (side === "buy" && maxBuyShares < 1) ||
          (side === "sell" && maxSellShares < 1) ||
          shares <= 0
        }
        className={cn(
          "w-full rounded-xl py-3.5 text-sm font-bold transition disabled:opacity-40 disabled:cursor-not-allowed",
          side === "buy"
            ? "btn-primary"
            : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 border border-white/10",
        )}
      >
        {side === "buy" ? "Open" : "Close"} {selectedStock.symbol} · Market
      </button>
    </GlassCard>
  );
}

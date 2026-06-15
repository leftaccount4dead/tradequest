"use client";

import { useState } from "react";
import { BarChart3, Briefcase, ShoppingCart } from "lucide-react";
import { useApp } from "./AppProvider";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { StockList } from "./StockList";
import { TradingChart } from "./TradingChart";
import { MarketDepth } from "./MarketDepth";
import { OrderPanel } from "./OrderPanel";
import { PortfolioPanel } from "./PortfolioPanel";
import { TradeHistory } from "./TradeHistory";
import { cn } from "@/lib/utils";

type MobilePanel = "chart" | "trade" | "portfolio";

const MOBILE_PANELS: {
  id: MobilePanel;
  label: string;
  icon: typeof BarChart3;
}[] = [
  { id: "chart", label: "Chart", icon: BarChart3 },
  { id: "trade", label: "Trade", icon: ShoppingCart },
  { id: "portfolio", label: "Portfolio", icon: Briefcase },
];

export function TradeView() {
  const { selectedStock } = useApp();
  const isMobile = useIsMobile();
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("chart");

  if (isMobile) {
    return (
      <div className="space-y-3 pb-20">
        <StockList horizontal />

        <div
          className="grid grid-cols-3 gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-1"
        >
          {MOBILE_PANELS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMobilePanel(id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-lg py-2.5 text-xs font-semibold transition touch-manipulation",
                mobilePanel === id
                  ? "bg-[var(--bg-surface)] text-emerald-600 dark:text-emerald-400 shadow-sm border border-[var(--border-subtle)]"
                  : "text-[var(--text-muted)]",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {mobilePanel === "chart" && (
          <div className="space-y-3">
            <TradingChart stock={selectedStock} compact />
            <MarketDepth stock={selectedStock} />
          </div>
        )}

        {mobilePanel === "trade" && (
          <div className="space-y-3">
            <OrderPanel />
            <MarketDepth stock={selectedStock} />
          </div>
        )}

        {mobilePanel === "portfolio" && (
          <div className="space-y-3">
            <PortfolioPanel />
            <TradeHistory />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <div className="lg:col-span-2 space-y-4">
        <StockList />
        <MarketDepth stock={selectedStock} />
      </div>

      <div className="lg:col-span-7 space-y-4">
        <TradingChart stock={selectedStock} />
        <OrderPanel />
      </div>

      <div className="lg:col-span-3 space-y-4">
        <PortfolioPanel />
        <TradeHistory />
      </div>
    </div>
  );
}

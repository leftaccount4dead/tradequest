"use client";

import { useApp } from "./AppProvider";
import { StockList } from "./StockList";
import { TradingChart } from "./TradingChart";
import { MarketDepth } from "./MarketDepth";
import { OrderPanel } from "./OrderPanel";
import { PortfolioPanel } from "./PortfolioPanel";
import { TradeHistory } from "./TradeHistory";

export function TradeView() {
  const { selectedStock } = useApp();

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

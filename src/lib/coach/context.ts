import type { CoachMessage, Portfolio, Stock } from "../types";
import { getChange } from "../market/simulator";
import { getPortfolioValue, getUnrealizedPnL } from "../market/portfolio";

export interface CoachCandleSnapshot {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CoachStockSnapshot {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  bid: number;
  ask: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  recentCandles: CoachCandleSnapshot[];
}

export interface CoachPortfolioSnapshot {
  cash: number;
  totalValue: number;
  totalPnL: number;
  unrealizedPnL: number;
  positions: { symbol: string; shares: number; avgCost: number; currentPrice: number; pnl: number }[];
  recentTrades: { side: string; symbol: string; shares: number; price: number; time: string }[];
}

export interface CoachMarketContext {
  selectedSymbol: string;
  stocks: CoachStockSnapshot[];
  portfolio: CoachPortfolioSnapshot;
}

export function buildCoachMarketContext(
  stocks: Stock[],
  portfolio: Portfolio,
  selectedSymbol: string,
): CoachMarketContext {
  const prices: Record<string, number> = {};
  stocks.forEach((s) => { prices[s.symbol] = s.price; });

  const totalValue = getPortfolioValue(portfolio, prices);
  const unrealizedPnL = getUnrealizedPnL(portfolio, prices);

  return {
    selectedSymbol,
    stocks: stocks.map((stock) => {
      const { percent } = getChange(stock);
      const recent = [...stock.candles.slice(-12), stock.formingCandle];
      return {
        symbol: stock.symbol,
        name: stock.name,
        sector: stock.sector,
        price: stock.price,
        bid: stock.bid,
        ask: stock.ask,
        changePercent: percent,
        dayHigh: stock.dayHigh,
        dayLow: stock.dayLow,
        volume: stock.volume,
        recentCandles: recent.map((c) => ({
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          volume: c.volume,
        })),
      };
    }),
    portfolio: {
      cash: portfolio.cash,
      totalValue,
      totalPnL: totalValue - portfolio.startingBalance,
      unrealizedPnL,
      positions: portfolio.positions.map((p) => {
        const current = prices[p.symbol] ?? p.avgCost;
        return {
          symbol: p.symbol,
          shares: p.shares,
          avgCost: p.avgCost,
          currentPrice: current,
          pnl: (current - p.avgCost) * p.shares,
        };
      }),
      recentTrades: portfolio.trades.slice(-8).map((t) => ({
        side: t.side,
        symbol: t.symbol,
        shares: t.shares,
        price: t.price,
        time: new Date(t.timestamp).toLocaleString(),
      })),
    },
  };
}

export function formatContextForPrompt(ctx: CoachMarketContext): string {
  const selected = ctx.stocks.find((s) => s.symbol === ctx.selectedSymbol);
  const lines: string[] = [
    "=== LIVE SIMULATED MARKET (updates every few seconds) ===",
    `User is currently viewing: ${ctx.selectedSymbol}`,
  ];

  if (selected) {
    lines.push(
      "",
      `FOCUS STOCK: ${selected.name} (${selected.symbol})`,
      `Price: $${selected.price.toFixed(2)} | Bid: $${selected.bid.toFixed(2)} | Ask: $${selected.ask.toFixed(2)}`,
      `Day change: ${selected.changePercent >= 0 ? "+" : ""}${selected.changePercent.toFixed(2)}%`,
      `Day range: $${selected.dayLow.toFixed(2)} – $${selected.dayHigh.toFixed(2)} | Volume: ${selected.volume.toLocaleString()}`,
      "Recent 1-min candles (O/H/L/C/V):",
    );
    selected.recentCandles.slice(-8).forEach((c, i) => {
      lines.push(
        `  ${i + 1}. O:${c.open.toFixed(2)} H:${c.high.toFixed(2)} L:${c.low.toFixed(2)} C:${c.close.toFixed(2)} V:${c.volume}`,
      );
    });
  }

  lines.push("", "ALL WATCHLIST:");
  ctx.stocks.forEach((s) => {
    lines.push(
      `  ${s.symbol} $${s.price.toFixed(2)} (${s.changePercent >= 0 ? "+" : ""}${s.changePercent.toFixed(2)}%)`,
    );
  });

  lines.push(
    "",
    "=== USER PORTFOLIO ===",
    `Cash: $${ctx.portfolio.cash.toFixed(2)}`,
    `Total value: $${ctx.portfolio.totalValue.toFixed(2)}`,
    `P&L: ${ctx.portfolio.totalPnL >= 0 ? "+" : ""}$${ctx.portfolio.totalPnL.toFixed(2)}`,
    `Unrealized P&L: ${ctx.portfolio.unrealizedPnL >= 0 ? "+" : ""}$${ctx.portfolio.unrealizedPnL.toFixed(2)}`,
  );

  if (ctx.portfolio.positions.length > 0) {
    lines.push("Open positions:");
    ctx.portfolio.positions.forEach((p) => {
      lines.push(
        `  ${p.symbol}: ${p.shares} shares @ $${p.avgCost.toFixed(2)} (now $${p.currentPrice.toFixed(2)}, P&L ${p.pnl >= 0 ? "+" : ""}$${p.pnl.toFixed(2)})`,
      );
    });
  } else {
    lines.push("Open positions: none");
  }

  if (ctx.portfolio.recentTrades.length > 0) {
    lines.push("Recent trades:");
    ctx.portfolio.recentTrades.forEach((t) => {
      lines.push(`  ${t.side.toUpperCase()} ${t.shares} ${t.symbol} @ $${t.price.toFixed(2)} (${t.time})`);
    });
  }

  return lines.join("\n");
}

export type CoachHistoryTurn = Pick<CoachMessage, "role" | "content">;

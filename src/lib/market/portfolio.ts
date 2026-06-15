import type { Portfolio, Position, Trade } from "../types";
import { safeJsonParse } from "../api-client";

const STARTING_BALANCE = 100;
const STORAGE_KEY = "tradequest-portfolio";

export function createPortfolio(): Portfolio {
  return {
    cash: STARTING_BALANCE,
    positions: [],
    trades: [],
    startingBalance: STARTING_BALANCE,
    createdAt: Date.now(),
  };
}

export function loadPortfolio(): Portfolio {
  if (typeof window === "undefined") return createPortfolio();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw?.trim()) {
      const parsed = safeJsonParse<Portfolio>(raw);
      if (parsed) return parsed;
    }
  } catch {
    /* ignore */
  }
  return createPortfolio();
}

export function savePortfolio(portfolio: Portfolio): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
}

export function resetPortfolio(): Portfolio {
  const portfolio = createPortfolio();
  savePortfolio(portfolio);
  return portfolio;
}

export function getPosition(portfolio: Portfolio, symbol: string): Position | undefined {
  return portfolio.positions.find((p) => p.symbol === symbol);
}

export function executeTrade(
  portfolio: Portfolio,
  symbol: string,
  side: "buy" | "sell",
  shares: number,
  price: number,
): { portfolio: Portfolio; error?: string } {
  if (shares <= 0 || !Number.isInteger(shares)) {
    return { portfolio, error: "Shares must be a positive whole number." };
  }

  const cost = shares * price;

  if (side === "buy") {
    if (cost > portfolio.cash) {
      return { portfolio, error: `Insufficient funds. You need $${cost.toFixed(2)} but have $${portfolio.cash.toFixed(2)}.` };
    }

    const existing = getPosition(portfolio, symbol);
    let positions: Position[];

    if (existing) {
      const totalShares = existing.shares + shares;
      const totalCost = existing.avgCost * existing.shares + cost;
      positions = portfolio.positions.map((p) =>
        p.symbol === symbol
          ? { symbol, shares: totalShares, avgCost: totalCost / totalShares }
          : p,
      );
    } else {
      positions = [...portfolio.positions, { symbol, shares, avgCost: price }];
    }

    const trade: Trade = {
      id: crypto.randomUUID(),
      symbol,
      side: "buy",
      shares,
      price,
      timestamp: Date.now(),
    };

    return {
      portfolio: {
        ...portfolio,
        cash: portfolio.cash - cost,
        positions,
        trades: [...portfolio.trades, trade],
      },
    };
  }

  const existing = getPosition(portfolio, symbol);
  if (!existing || existing.shares < shares) {
    return { portfolio, error: `You don't have enough shares of ${symbol} to sell.` };
  }

  const remaining = existing.shares - shares;
  const positions = remaining === 0
    ? portfolio.positions.filter((p) => p.symbol !== symbol)
    : portfolio.positions.map((p) =>
        p.symbol === symbol ? { ...p, shares: remaining } : p,
      );

  const trade: Trade = {
    id: crypto.randomUUID(),
    symbol,
    side: "sell",
    shares,
    price,
    timestamp: Date.now(),
  };

  return {
    portfolio: {
      ...portfolio,
      cash: portfolio.cash + cost,
      positions,
      trades: [...portfolio.trades, trade],
    },
  };
}

export function getPortfolioValue(portfolio: Portfolio, prices: Record<string, number>): number {
  const holdingsValue = portfolio.positions.reduce(
    (sum, p) => sum + p.shares * (prices[p.symbol] ?? 0),
    0,
  );
  return portfolio.cash + holdingsValue;
}

export function getUnrealizedPnL(portfolio: Portfolio, prices: Record<string, number>): number {
  return portfolio.positions.reduce((sum, p) => {
    const current = prices[p.symbol] ?? p.avgCost;
    return sum + (current - p.avgCost) * p.shares;
  }, 0);
}

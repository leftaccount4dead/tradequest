import type { Portfolio, Position, RiskOrder, Trade } from "../types";
import { safeJsonParse } from "../api-client";
import { STARTING_BALANCE } from "../constants";

const STORAGE_KEY = "tradequest-portfolio";

export function createPortfolio(): Portfolio {
  return {
    cash: STARTING_BALANCE,
    positions: [],
    trades: [],
    startingBalance: STARTING_BALANCE,
    createdAt: Date.now(),
    riskOrders: [],
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

export function setRiskOrder(portfolio: Portfolio, order: Omit<RiskOrder, "id">): Portfolio {
  const existing = (portfolio.riskOrders ?? []).filter((item) => item.symbol !== order.symbol);
  return {
    ...portfolio,
    riskOrders: [...existing, { ...order, id: crypto.randomUUID() }],
  };
}

export function removeRiskOrder(portfolio: Portfolio, symbol: string): Portfolio {
  return {
    ...portfolio,
    riskOrders: (portfolio.riskOrders ?? []).filter((order) => order.symbol !== symbol),
  };
}

export function triggerRiskOrders(
  portfolio: Portfolio,
  prices: Record<string, number>,
): Portfolio {
  let next = portfolio;
  for (const order of portfolio.riskOrders ?? []) {
    const price = prices[order.symbol];
    const position = getPosition(next, order.symbol);
    if (price === undefined || !position) continue;

    const triggered = (order.stopLoss !== undefined && price <= order.stopLoss)
      || (order.takeProfit !== undefined && price >= order.takeProfit);
    if (!triggered) continue;

    const shares = Math.min(order.shares, position.shares);
    const result = executeTrade(next, order.symbol, "sell", shares, price);
    next = result.error ? next : removeRiskOrder(result.portfolio, order.symbol);
  }
  return next;
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

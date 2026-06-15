import type { Portfolio } from "./types";

export interface LeaderboardEntry {
  rank: number;
  name: string;
  totalValue: number;
  returnPercent: number;
  isYou: boolean;
}

/** Book-value fallback when client has not reported live mark-to-market yet. */
export function getLeaderboardValue(portfolio: Portfolio): number {
  if (portfolio.lastReportedValue != null && portfolio.lastReportedValue > 0) {
    return portfolio.lastReportedValue;
  }
  const holdings = portfolio.positions.reduce(
    (sum, p) => sum + p.shares * p.avgCost,
    0,
  );
  return portfolio.cash + holdings;
}

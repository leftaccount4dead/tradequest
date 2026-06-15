/** Shared percentage-based price step — prevents runaway compounding. */
export function computeNextPrice(
  currentPrice: number,
  volatility: number,
  trend: number,
  anchorPrice: number,
): number {
  const noise = (Math.random() - 0.5) * volatility * 2;
  const reversion = ((anchorPrice - currentPrice) / currentPrice) * 0.06;
  let pctChange = noise + trend + reversion;

  // Hard cap per tick — realistic for 2-second updates
  const maxTickPct = Math.min(volatility * 1.25, 0.004);
  pctChange = Math.max(-maxTickPct, Math.min(maxTickPct, pctChange));

  let next = currentPrice * (1 + pctChange);

  const upper = anchorPrice * 1.08;
  const lower = anchorPrice * 0.92;
  next = Math.min(upper, Math.max(lower, next));

  return Math.max(0.5, parseFloat(next.toFixed(2)));
}

export function sanitizePrice(price: number, anchorPrice: number): number {
  const upper = anchorPrice * 1.08;
  const lower = anchorPrice * 0.92;
  return Math.min(upper, Math.max(lower, Math.max(0.5, price)));
}

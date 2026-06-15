/** How far price can drift from anchor (previous close) before soft clamping. */
export const PRICE_BAND_PCT = 0.18;

/** Max absolute % move per 2-second tick. */
export const MAX_TICK_PCT = 0.015;

/** Shared percentage-based price step — realistic but lively for education. */
export function computeNextPrice(
  currentPrice: number,
  volatility: number,
  trend: number,
  anchorPrice: number,
): number {
  const noise = (Math.random() - 0.5) * volatility * 4;
  const reversion = ((anchorPrice - currentPrice) / currentPrice) * 0.008;
  let pctChange = noise + trend + reversion;

  // Occasional momentum burst (news-y impulse)
  if (Math.random() < 0.04) {
    pctChange += (Math.random() - 0.5) * volatility * 6;
  }

  const maxTickPct = Math.min(volatility * 3, MAX_TICK_PCT);
  pctChange = Math.max(-maxTickPct, Math.min(maxTickPct, pctChange));

  let next = currentPrice * (1 + pctChange);

  const upper = anchorPrice * (1 + PRICE_BAND_PCT);
  const lower = anchorPrice * (1 - PRICE_BAND_PCT);
  next = Math.min(upper, Math.max(lower, next));

  return Math.max(0.5, parseFloat(next.toFixed(2)));
}

export function sanitizePrice(price: number, anchorPrice: number): number {
  const upper = anchorPrice * (1 + PRICE_BAND_PCT);
  const lower = anchorPrice * (1 - PRICE_BAND_PCT);
  return Math.min(upper, Math.max(lower, Math.max(0.5, price)));
}

/** How far price can drift from anchor (previous close) before soft clamping. */
export const PRICE_BAND_PCT = 0.4;

/** Max absolute % move per 2-second tick. */
export const MAX_TICK_PCT = 0.07;

export interface PriceStepOptions {
  shockBias?: number;
}

/** Shared percentage-based price step — lively swings for education. */
export function computeNextPrice(
  currentPrice: number,
  volatility: number,
  trend: number,
  anchorPrice: number,
  options?: PriceStepOptions,
): number {
  const noise = (Math.random() - 0.5) * volatility * 7;
  const reversion = ((anchorPrice - currentPrice) / currentPrice) * 0.001;
  let pctChange = noise + trend + reversion + (options?.shockBias ?? 0);

  if (Math.random() < 0.1) {
    pctChange += (Math.random() - 0.5) * volatility * 10;
  }

  const maxTickPct = Math.min(volatility * 5, MAX_TICK_PCT);
  pctChange = Math.max(-maxTickPct, Math.min(maxTickPct, pctChange));

  let next = currentPrice * (1 + pctChange);

  // Ensure each tick moves enough to show a visible candle body
  const minAbsMove = Math.max(0.18, currentPrice * 0.0035);
  const delta = next - currentPrice;
  if (Math.abs(delta) < minAbsMove) {
    const direction = delta === 0 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(delta);
    next = currentPrice + direction * minAbsMove;
  }

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

/** Start or extend a sharp selloff / rally sequence. */
export function rollMarketShock(
  currentShockTicks: number,
  currentShockBias: number,
): { shockTicks: number; shockBias: number } {
  if (currentShockTicks > 0) {
    return { shockTicks: currentShockTicks, shockBias: currentShockBias };
  }

  if (Math.random() > 0.07) {
    return { shockTicks: 0, shockBias: 0 };
  }

  const isSelloff = Math.random() < 0.68;
  const duration = Math.floor(Math.random() * 14) + 10;
  const bias = isSelloff
    ? -(0.0025 + Math.random() * 0.005)
    : 0.002 + Math.random() * 0.0045;

  return { shockTicks: duration, shockBias: bias };
}

import type { Candle, ChartTimeframe } from "../types";
import { TIMEFRAME_MINUTES } from "../types";

export const CANDLE_PERIOD_MS = 60_000; // 1-minute base candles

export function getSpread(price: number): number {
  return Math.max(0.01, parseFloat((price * 0.00015).toFixed(2)));
}

export function getBidAsk(price: number): { bid: number; ask: number } {
  const spread = getSpread(price);
  return {
    bid: parseFloat((price - spread / 2).toFixed(2)),
    ask: parseFloat((price + spread / 2).toFixed(2)),
  };
}

export function periodStartSec(nowMs: number): number {
  return Math.floor(nowMs / CANDLE_PERIOD_MS) * (CANDLE_PERIOD_MS / 1000);
}

export function createCandle(timeSec: number, price: number, volume = 0): Candle {
  return {
    time: timeSec,
    open: price,
    high: price,
    low: price,
    close: price,
    volume,
  };
}

export function updateCandle(candle: Candle, price: number, volume: number): Candle {
  return {
    ...candle,
    high: Math.max(candle.high, price),
    low: Math.min(candle.low, price),
    close: price,
    volume: candle.volume + volume,
  };
}

/** All candles including the live forming bar */
export function getAllCandles(stock: { candles: Candle[]; formingCandle: Candle }): Candle[] {
  const last = stock.candles[stock.candles.length - 1];
  if (last && last.time === stock.formingCandle.time) {
    return [...stock.candles.slice(0, -1), stock.formingCandle];
  }
  return [...stock.candles, stock.formingCandle];
}

export function aggregateCandles(candles: Candle[], timeframe: ChartTimeframe): Candle[] {
  const intervalMin = TIMEFRAME_MINUTES[timeframe];
  const intervalSec = intervalMin * 60;

  if (intervalMin === 1) return candles;

  const buckets = new Map<number, Candle>();

  for (const c of candles) {
    const bucket = Math.floor(c.time / intervalSec) * intervalSec;
    const existing = buckets.get(bucket);
    if (!existing) {
      buckets.set(bucket, { ...c, time: bucket });
    } else {
      buckets.set(bucket, {
        time: bucket,
        open: existing.open,
        high: Math.max(existing.high, c.high),
        low: Math.min(existing.low, c.low),
        close: c.close,
        volume: existing.volume + c.volume,
      });
    }
  }

  return Array.from(buckets.values()).sort((a, b) => a.time - b.time);
}

function clampCandle(c: Candle, anchor: number): Candle {
  const lo = anchor * 0.88;
  const hi = anchor * 1.12;
  const clamp = (v: number) => Math.min(hi, Math.max(lo, v));
  return {
    ...c,
    open: clamp(c.open),
    high: clamp(c.high),
    low: clamp(c.low),
    close: clamp(c.close),
  };
}

/** Keep a single bar's range realistic (prevents one-minute mega-candles). */
export function repairCandleOHLC(c: Candle, anchor: number, maxBarPct = 0.035): Candle {
  const clamped = clampCandle(c, anchor);
  const open = clamped.open;
  const close = clamped.close;
  const barHigh = open * (1 + maxBarPct);
  const barLow = open * (1 - maxBarPct);

  let high = Math.min(clamped.high, barHigh);
  let low = Math.max(clamped.low, barLow);
  high = Math.max(high, open, close);
  low = Math.min(low, open, close);

  return {
    ...clamped,
    high: parseFloat(high.toFixed(2)),
    low: parseFloat(low.toFixed(2)),
    open: parseFloat(open.toFixed(2)),
    close: parseFloat(close.toFixed(2)),
  };
}

export function repairCandleSeries(candles: Candle[], anchor: number): Candle[] {
  return candles.map((c) => repairCandleOHLC(c, anchor));
}

/** Clamp outlier OHLC values so bad ticks don't blow up the chart scale. */
export function sanitizeCandlesForDisplay(candles: Candle[], anchorPrice: number): Candle[] {
  return repairCandleSeries(candles, anchorPrice);
}

export function generateOrderBook(
  bid: number,
  ask: number,
  mid: number,
  levels = 8,
): { bids: { price: number; size: number }[]; asks: { price: number; size: number }[] } {
  // At least 1¢ between levels so prices never collide after rounding
  const levelStep = Math.max(0.01, parseFloat(getSpread(mid).toFixed(2)));
  const bids: { price: number; size: number }[] = [];
  const asks: { price: number; size: number }[] = [];

  for (let i = 0; i < levels; i++) {
    const bidPrice = parseFloat((bid - levelStep * i).toFixed(2));
    const askPrice = parseFloat((ask + levelStep * i).toFixed(2));
    // Deterministic sizes (no Math.random) — stable across re-renders
    const size = 60 + i * 40 + Math.floor((mid * 10 + i * 7) % 120);
    bids.push({ price: bidPrice, size });
    asks.push({ price: askPrice, size });
  }

  return { bids, asks };
}

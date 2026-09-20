import type { Candle, Stock } from "../types";
import { buildTickCandle, getBidAsk, nextCandleTime } from "./candles";
import { computeNextPrice, rollMarketShock } from "./price-model";

export const STOCK_DEFS = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology", basePrice: 228.5, volatility: 0.018, trend: 0.0002 },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", sector: "Finance", basePrice: 294.8, volatility: 0.016, trend: 0.0001 },
  { symbol: "XOM", name: "Exxon Mobil Corp.", sector: "Energy", basePrice: 113.2, volatility: 0.022, trend: -0.0001 },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", basePrice: 176.4, volatility: 0.013, trend: 0.0001 },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer", basePrice: 231.7, volatility: 0.021, trend: 0.0002 },
  { symbol: "NVDA", name: "NVIDIA Corp.", sector: "Technology", basePrice: 177.6, volatility: 0.028, trend: 0.0003 },
  { symbol: "KO", name: "The Coca-Cola Company", sector: "Consumer", basePrice: 71.8, volatility: 0.011, trend: 0.0001 },
  { symbol: "F", name: "Ford Motor Co.", sector: "Industrial", basePrice: 11.4, volatility: 0.025, trend: -0.0001 },
];

const HISTORY_COUNT = 480;
/** Offset so chart times stay in a stable unix range without wall-clock jumps. */
const CANDLE_TIME_BASE = Math.floor(Date.now() / 1000) - 200_000;

function generateCandleHistory(
  timeBase: number,
  basePrice: number,
  volatility: number,
  trend: number,
  count = HISTORY_COUNT,
): { candles: Candle[]; candleSeq: number } {
  const candles: Candle[] = [];
  let price = basePrice;
  const anchor = basePrice;
  let shockTicks = 0;
  let shockBias = 0;

  for (let seq = 1; seq <= count; seq++) {
    const shock = rollMarketShock(shockTicks, shockBias);
    shockTicks = shock.shockTicks;
    shockBias = shock.shockBias;
    const activeShock = shockTicks > 0 ? shockBias : 0;

    const open = price;
    price = computeNextPrice(price, volatility, trend, anchor, { shockBias: activeShock });
    const volume = Math.floor(Math.random() * 4000 + 800);
    candles.push(buildTickCandle(nextCandleTime(timeBase, seq), open, price, volume));

    if (shockTicks > 0) {
      shockTicks -= 1;
      if (shockTicks === 0) shockBias = 0;
    }
  }

  return { candles, candleSeq: count };
}

export function createInitialStocks(): Stock[] {
  return STOCK_DEFS.map((def) => {
    const { candles, candleSeq } = generateCandleHistory(
      CANDLE_TIME_BASE,
      def.basePrice,
      def.volatility,
      def.trend,
    );
    const last = candles[candles.length - 1];
    const price = last.close;
    const previousClose = candles[Math.max(0, candles.length - 120)].open;
    const dayHigh = Math.max(...candles.slice(-120).map((c) => c.high));
    const dayLow = Math.min(...candles.slice(-120).map((c) => c.low));
    const volume = candles.reduce((sum, c) => sum + c.volume, 0);
    const { bid, ask } = getBidAsk(price);

    return {
      symbol: def.symbol,
      name: def.name,
      sector: def.sector,
      price,
      bid,
      ask,
      open: last.open,
      previousClose,
      dayHigh,
      dayLow,
      volume,
      volatility: def.volatility,
      trend: def.trend,
      shockTicks: 0,
      shockBias: 0,
      candleTimeBase: CANDLE_TIME_BASE,
      candleSeq,
      candles,
      formingCandle: last,
    };
  });
}

import type { Candle, Stock } from "../types";
import { buildTickCandle, getBidAsk, nextCandleTime } from "./candles";
import { computeNextPrice, rollMarketShock } from "./price-model";

const STOCK_DEFS = [
  { symbol: "TECH", name: "TechNova Inc", sector: "Technology", basePrice: 42.5, volatility: 0.095, trend: 0.0005 },
  { symbol: "BANK", name: "Metro Bank Corp", sector: "Finance", basePrice: 28.8, volatility: 0.08, trend: 0.0003 },
  { symbol: "ENER", name: "SolarGrid Energy", sector: "Energy", basePrice: 15.2, volatility: 0.11, trend: -0.0005 },
  { symbol: "HEAL", name: "HealthPlus Pharma", sector: "Healthcare", basePrice: 67.4, volatility: 0.07, trend: 0.0004 },
  { symbol: "RETL", name: "ShopWave Retail", sector: "Consumer", basePrice: 8.95, volatility: 0.1, trend: 0.0002 },
  { symbol: "CHIP", name: "MicroChip Systems", sector: "Technology", basePrice: 124.6, volatility: 0.085, trend: 0.0006 },
  { symbol: "FOOD", name: "FreshFarm Foods", sector: "Consumer", basePrice: 22.3, volatility: 0.065, trend: 0.00025 },
  { symbol: "AUTO", name: "DriveLine Motors", sector: "Industrial", basePrice: 45.7, volatility: 0.088, trend: -0.0004 },
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

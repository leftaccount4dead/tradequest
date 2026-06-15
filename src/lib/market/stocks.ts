import type { Candle, Stock } from "../types";
import {
  CANDLE_PERIOD_MS,
  getBidAsk,
  periodStartSec,
  repairCandleOHLC,
  repairCandleSeries,
} from "./candles";
import { computeNextPrice } from "./price-model";

const STOCK_DEFS = [
  { symbol: "TECH", name: "TechNova Inc", sector: "Technology", basePrice: 42.5, volatility: 0.025, trend: 0.0002 },
  { symbol: "BANK", name: "Metro Bank Corp", sector: "Finance", basePrice: 28.8, volatility: 0.018, trend: 0.0001 },
  { symbol: "ENER", name: "SolarGrid Energy", sector: "Energy", basePrice: 15.2, volatility: 0.032, trend: -0.0001 },
  { symbol: "HEAL", name: "HealthPlus Pharma", sector: "Healthcare", basePrice: 67.4, volatility: 0.015, trend: 0.00015 },
  { symbol: "RETL", name: "ShopWave Retail", sector: "Consumer", basePrice: 8.95, volatility: 0.028, trend: 0.00005 },
  { symbol: "CHIP", name: "MicroChip Systems", sector: "Technology", basePrice: 124.6, volatility: 0.022, trend: 0.0003 },
  { symbol: "FOOD", name: "FreshFarm Foods", sector: "Consumer", basePrice: 22.3, volatility: 0.012, trend: 0.00008 },
  { symbol: "AUTO", name: "DriveLine Motors", sector: "Industrial", basePrice: 45.7, volatility: 0.021, trend: -0.00005 },
];

function generateCandleHistory(
  basePrice: number,
  volatility: number,
  trend: number,
  count = 240,
): Candle[] {
  const candles: Candle[] = [];
  let price = basePrice;
  const anchor = basePrice;
  const now = Date.now();
  const startSec = periodStartSec(now) - count * (CANDLE_PERIOD_MS / 1000);

  for (let i = 0; i < count; i++) {
    const timeSec = startSec + i * (CANDLE_PERIOD_MS / 1000);
    const open = price;
    let high = open;
    let low = open;
    let close = open;
    let volume = 0;

    const ticksInCandle = 6;
    for (let t = 0; t < ticksInCandle; t++) {
      price = computeNextPrice(price, volatility, trend, anchor);
      close = price;
      high = Math.max(high, close);
      low = Math.min(low, close);
      volume += Math.floor(Math.random() * 12000 + 3000);
    }

    candles.push(
      repairCandleOHLC(
        {
          time: timeSec,
          open: parseFloat(open.toFixed(2)),
          high: parseFloat(high.toFixed(2)),
          low: parseFloat(low.toFixed(2)),
          close,
          volume,
        },
        anchor,
      ),
    );
  }

  return candles;
}

export function createInitialStocks(): Stock[] {
  return STOCK_DEFS.map((def) => {
    const candles = repairCandleSeries(
      generateCandleHistory(def.basePrice, def.volatility, def.trend),
      def.basePrice,
    );
    const last = candles[candles.length - 1];
    const price = last.close;
    const previousClose = candles[Math.max(0, candles.length - 60)].open;
    const dayHigh = Math.max(...candles.slice(-60).map((c) => c.high));
    const dayLow = Math.min(...candles.slice(-60).map((c) => c.low));
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
      candles: candles.slice(0, -1),
      formingCandle: last,
    };
  });
}

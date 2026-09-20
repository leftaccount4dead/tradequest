import type { Stock } from "../types";
import {
  buildTickCandle,
  getBidAsk,
  nextCandleTime,
} from "./candles";
import {
  computeNextPrice,
  rollMarketShock,
  sanitizePrice,
} from "./price-model";

const MAX_CANDLES = 600;

export function tickStock(stock: Stock): Stock {
  let trend = stock.trend;
  if (Math.random() < 0.05) {
    trend += (Math.random() - 0.5) * 0.002;
    trend = Math.max(-0.006, Math.min(0.006, trend));
  }

  let { shockTicks, shockBias } = rollMarketShock(stock.shockTicks, stock.shockBias);
  const activeShockBias = shockTicks > 0 ? shockBias : 0;

  const prevPrice = stock.price;
  let newPrice = computeNextPrice(
    prevPrice,
    stock.volatility,
    trend,
    stock.previousClose,
    { shockBias: activeShockBias },
  );
  newPrice = sanitizePrice(newPrice, stock.previousClose);

  if (shockTicks > 0) {
    shockTicks -= 1;
    if (shockTicks === 0) shockBias = 0;
  }

  const newVolume = Math.floor(Math.random() * 5000 + 1000);
  const candleSeq = stock.candleSeq + 1;
  const timeSec = nextCandleTime(stock.candleTimeBase, candleSeq);

  const newCandle = buildTickCandle(timeSec, prevPrice, newPrice, newVolume);
  const allCandles = [...stock.candles, newCandle].slice(-MAX_CANDLES);

  const { bid, ask } = getBidAsk(newPrice);

  return {
    ...stock,
    trend,
    shockTicks,
    shockBias,
    candleSeq,
    price: newPrice,
    bid,
    ask,
    dayHigh: Math.max(stock.dayHigh, newPrice),
    dayLow: Math.min(stock.dayLow, newPrice),
    volume: stock.volume + newVolume,
    candles: allCandles,
    formingCandle: allCandles[allCandles.length - 1],
  };
}

export function tickAllStocks(stocks: Stock[]): Stock[] {
  return stocks.map(tickStock);
}

export function getChange(stock: Stock): { amount: number; percent: number } {
  const amount = stock.price - stock.previousClose;
  const percent = (amount / stock.previousClose) * 100;
  return { amount, percent };
}

export function getSpread(stock: Stock): number {
  return parseFloat((stock.ask - stock.bid).toFixed(2));
}

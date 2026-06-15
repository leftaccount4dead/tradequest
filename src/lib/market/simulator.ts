import type { Stock } from "../types";
import {
  createCandle,
  getBidAsk,
  periodStartSec,
  repairCandleOHLC,
  repairCandleSeries,
  updateCandle,
} from "./candles";
import { computeNextPrice, sanitizePrice } from "./price-model";

export function tickStock(stock: Stock): Stock {
  let newPrice = computeNextPrice(
    stock.price,
    stock.volatility,
    stock.trend,
    stock.previousClose,
  );
  newPrice = sanitizePrice(newPrice, stock.previousClose);

  const newVolume = Math.floor(Math.random() * 8000 + 2000);
  const now = Date.now();
  const periodSec = periodStartSec(now);
  const { bid, ask } = getBidAsk(newPrice);

  let candles = stock.candles;
  let formingCandle = stock.formingCandle;

  if (formingCandle.time !== periodSec) {
    if (formingCandle.volume > 0 || candles.length === 0) {
      candles = [...candles.slice(-499), formingCandle];
    }
    formingCandle = createCandle(periodSec, newPrice, newVolume);
  } else {
    formingCandle = updateCandle(formingCandle, newPrice, newVolume);
  }

  formingCandle = repairCandleOHLC(formingCandle, stock.previousClose);
  candles = repairCandleSeries(candles, stock.previousClose);

  return {
    ...stock,
    price: newPrice,
    bid,
    ask,
    dayHigh: Math.max(stock.dayHigh, newPrice),
    dayLow: Math.min(stock.dayLow, newPrice),
    volume: stock.volume + newVolume,
    candles,
    formingCandle,
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

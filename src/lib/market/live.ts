import type { Candle, Stock } from "../types";
import { getBidAsk } from "./candles";
import { STOCK_DEFS } from "./stocks";

const NASDAQ_CHART_URL = "https://api.nasdaq.com/api/quote";
const MAX_CANDLES = 600;

interface NasdaqPoint {
  x: number;
  y: number;
}

interface NasdaqPayload {
  data?: {
    lastSalePrice?: string;
    previousClose?: string;
    volume?: string;
    chart?: NasdaqPoint[];
  };
}

function parseMoney(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value.replace(/[$,]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function toCandleSeries(points: NasdaqPoint[]): Candle[] {
  return points.slice(-MAX_CANDLES).flatMap((point, index, series) => {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return [];
    const previous = series[index - 1]?.y ?? point.y;
    return [{
      time: Math.floor(point.x / 1000),
      open: Number(previous.toFixed(2)),
      high: Number(Math.max(previous, point.y).toFixed(2)),
      low: Number(Math.min(previous, point.y).toFixed(2)),
      close: Number(point.y.toFixed(2)),
      volume: 0,
    }];
  });
}

async function fetchQuote(def: typeof STOCK_DEFS[number]): Promise<Stock> {
  const response = await fetch(`${NASDAQ_CHART_URL}/${def.symbol}/chart?assetclass=stocks`, {
    cache: "no-store",
    headers: { Accept: "application/json", "User-Agent": "TradeQuest/1.0" },
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error(`Market provider returned ${response.status}`);

  const payload = await response.json() as NasdaqPayload;
  const data = payload.data;
  const candles = toCandleSeries(data?.chart ?? []);
  const last = candles[candles.length - 1];
  const price = parseMoney(data?.lastSalePrice) ?? last?.close;
  const previousClose = parseMoney(data?.previousClose) ?? last?.open;
  if (!data || !last || price == null || previousClose == null) throw new Error(`No quote returned for ${def.symbol}`);

  const { bid, ask } = getBidAsk(price);
  const dayHigh = Math.max(...candles.map((candle) => candle.high), price);
  const dayLow = Math.min(...candles.map((candle) => candle.low), price);
  const volume = Number(data.volume?.replace(/,/g, "")) || 0;

  return {
    symbol: def.symbol,
    name: def.name,
    sector: def.sector,
    price: Number(price.toFixed(2)),
    bid,
    ask,
    open: candles[0]?.open ?? price,
    previousClose,
    dayHigh,
    dayLow,
    volume,
    volatility: def.volatility,
    trend: def.trend,
    shockTicks: 0,
    shockBias: 0,
    candleSeq: candles.length,
    candleTimeBase: candles[0]?.time ?? Math.floor(Date.now() / 1000),
    candles,
    formingCandle: last,
  };
}

export async function fetchLiveStocks(): Promise<Stock[]> {
  return Promise.all(STOCK_DEFS.map(fetchQuote));
}

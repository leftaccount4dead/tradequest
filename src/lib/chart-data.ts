import type { CandlestickData, HistogramData, LineData } from "lightweight-charts";
import type { ChartTimeframe, Stock } from "./types";
import { aggregateCandles, getAllCandles } from "./market/candles";

export function dedupeCandlestickData(data: CandlestickData[]): CandlestickData[] {
  const map = new Map<number, CandlestickData>();
  for (const bar of data) {
    const t = bar.time as number;
    map.set(t, bar);
  }
  return Array.from(map.values()).sort((a, b) => (a.time as number) - (b.time as number));
}

export function buildChartSeries(
  stock: Stock,
  timeframe: ChartTimeframe,
): { candleData: CandlestickData[]; volumeData: HistogramData[] } {
  const all = getAllCandles(stock);
  const aggregated = aggregateCandles(all, timeframe);

  const candleData = dedupeCandlestickData(
    aggregated.map((c) => ({
      time: c.time as CandlestickData["time"],
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    })),
  );

  const volumeData: HistogramData[] = aggregated.map((c) => ({
    time: c.time as HistogramData["time"],
    value: c.volume,
    color: c.close >= c.open ? "rgba(16, 185, 129, 0.45)" : "rgba(239, 68, 68, 0.45)",
  }));

  // Align volume length with deduped candles
  const candleTimes = new Set(candleData.map((c) => c.time as number));
  const alignedVolume = volumeData.filter((v) => candleTimes.has(v.time as number));

  return { candleData, volumeData: alignedVolume };
}

export function buildIndicatorData(
  stock: Stock,
  timeframe: ChartTimeframe,
  indicator: "sma20" | "ema50" | "vwap",
): LineData[] {
  const candles = aggregateCandles(getAllCandles(stock), timeframe);
  let runningVolume = 0;
  let runningPriceVolume = 0;
  let ema: number | null = null;
  const multiplier = 2 / 51;

  return candles.flatMap((candle, index) => {
    let value: number | null = null;
    if (indicator === "sma20" && index >= 19) {
      value = candles.slice(index - 19, index + 1).reduce((sum, item) => sum + item.close, 0) / 20;
    } else if (indicator === "ema50") {
      ema = ema === null ? candle.close : (candle.close - ema) * multiplier + ema;
      if (index >= 49) value = ema;
    } else {
      const typicalPrice = (candle.high + candle.low + candle.close) / 3;
      runningVolume += candle.volume;
      runningPriceVolume += typicalPrice * candle.volume;
      value = runningVolume > 0 ? runningPriceVolume / runningVolume : typicalPrice;
    }

    return value === null ? [] : [{ time: candle.time as LineData["time"], value }];
  });
}

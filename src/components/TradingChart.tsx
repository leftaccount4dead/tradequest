"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type HistogramData,
  ColorType,
  CrosshairMode,
} from "lightweight-charts";
import type { Stock, ChartTimeframe } from "@/lib/types";
import { getChange, getSpread } from "@/lib/market/simulator";
import { buildChartSeries } from "@/lib/chart-data";
import { cn } from "@/lib/utils";
import { GlassCard } from "./ui/GlassCard";
import { Minus, Plus, RotateCcw } from "lucide-react";

const TIMEFRAMES: ChartTimeframe[] = ["1m", "5m", "15m", "1H", "1D"];

function getChartColors() {
  const isDark = typeof window !== "undefined"
    && window.matchMedia("(prefers-color-scheme: dark)").matches;

  return {
    background: isDark ? "#111111" : "#ffffff",
    textColor: isDark ? "#94a3b8" : "#64748b",
    gridColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
    upColor: "#10b981",
    downColor: "#ef4444",
    volumeUp: isDark ? "rgba(16, 185, 129, 0.4)" : "rgba(16, 185, 129, 0.55)",
    volumeDown: isDark ? "rgba(239, 68, 68, 0.4)" : "rgba(239, 68, 68, 0.55)",
  };
}

export function TradingChart({ stock }: { stock: Stock }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const lastBarTimeRef = useRef<number | null>(null);
  const barCountRef = useRef(0);
  const chartReadyRef = useRef(false);
  const followLiveRef = useRef(true);
  const [timeframe, setTimeframe] = useState<ChartTimeframe>("5m");
  const [hoverOHLC, setHoverOHLC] = useState<{
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
  } | null>(null);

  const { amount, percent } = getChange(stock);
  const isUp = percent >= 0;
  const spread = getSpread(stock);

  const seriesKey = `${stock.symbol}-${timeframe}`;
  const liveKey = [
    stock.price,
    stock.formingCandle.time,
    stock.formingCandle.open,
    stock.formingCandle.high,
    stock.formingCandle.low,
    stock.formingCandle.close,
    stock.formingCandle.volume,
    stock.candles.length,
  ].join("|");

  const chartSeries = useMemo(
    () => buildChartSeries(stock, timeframe),
    [stock, timeframe],
  );

  // Create chart once per symbol/timeframe
  useEffect(() => {
    if (!containerRef.current) return;

    chartReadyRef.current = false;
    lastBarTimeRef.current = null;
    followLiveRef.current = true;
    const colors = getChartColors();

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 420,
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.textColor,
        fontFamily: "var(--font-geist-mono), monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: colors.gridColor },
        horzLines: { color: colors.gridColor },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { width: 1, style: 2, labelBackgroundColor: colors.background },
        horzLine: { width: 1, style: 2, labelBackgroundColor: colors.background },
      },
      rightPriceScale: {
        borderColor: colors.borderColor,
        scaleMargins: { top: 0.08, bottom: 0.22 },
      },
      timeScale: {
        borderColor: colors.borderColor,
        timeVisible: true,
        secondsVisible: timeframe === "1m",
        rightOffset: 8,
        barSpacing: 10,
        minBarSpacing: 3,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
        axisPressedMouseMove: { time: true, price: true },
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: colors.upColor,
      downColor: colors.downColor,
      borderUpColor: colors.upColor,
      borderDownColor: colors.downColor,
      wickUpColor: colors.upColor,
      wickDownColor: colors.downColor,
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });

    const { candleData, volumeData } = buildChartSeries(stock, timeframe);
    if (candleData.length > 0) {
      candleSeries.setData(candleData);
      volumeSeries.setData(volumeData);
      lastBarTimeRef.current = candleData[candleData.length - 1].time as number;
      barCountRef.current = candleData.length;
      chartReadyRef.current = true;
      chart.timeScale().fitContent();
      chart.timeScale().scrollToRealTime();
    }

    const onVisibleRange = (range: { from: number; to: number } | null) => {
      if (!range || barCountRef.current === 0) return;
      followLiveRef.current = range.to >= barCountRef.current - 3;
    };
    chart.timeScale().subscribeVisibleLogicalRangeChange(onVisibleRange);

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData.size) {
        setHoverOHLC(null);
        return;
      }
      const candle = param.seriesData.get(candleSeries) as CandlestickData | undefined;
      const vol = param.seriesData.get(volumeSeries) as HistogramData | undefined;
      if (candle) {
        setHoverOHLC({
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: vol?.value,
        });
      }
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(onVisibleRange);
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      chartReadyRef.current = false;
      lastBarTimeRef.current = null;
    };
  }, [seriesKey]);

  // Live updates: update last bar only (avoids setData errors on every tick)
  useEffect(() => {
    const candleSeries = candleSeriesRef.current;
    const volumeSeries = volumeSeriesRef.current;
    if (!candleSeries || !volumeSeries || !chartReadyRef.current) return;

    const { candleData, volumeData } = chartSeries;
    if (candleData.length === 0) return;

    const lastCandle = candleData[candleData.length - 1];
    const lastVol = volumeData[volumeData.length - 1];
    const lastTime = lastCandle.time as number;

    try {
      if (lastBarTimeRef.current === lastTime) {
        candleSeries.update(lastCandle);
        if (lastVol) volumeSeries.update(lastVol);
      } else {
        candleSeries.setData(candleData);
        volumeSeries.setData(volumeData);
        lastBarTimeRef.current = lastTime;
        barCountRef.current = candleData.length;
      }

      if (followLiveRef.current && chartRef.current) {
        chartRef.current.timeScale().scrollToRealTime();
      }
    } catch {
      candleSeries.setData(candleData);
      volumeSeries.setData(volumeData);
      lastBarTimeRef.current = lastTime;
      barCountRef.current = candleData.length;
    }
  }, [liveKey, chartSeries]);

  const fitChart = () => {
    followLiveRef.current = true;
    chartRef.current?.timeScale().fitContent();
    chartRef.current?.timeScale().scrollToRealTime();
  };
  const zoomIn = () => {
    const ts = chartRef.current?.timeScale();
    if (ts) ts.applyOptions({ barSpacing: ts.options().barSpacing * 1.3 });
  };
  const zoomOut = () => {
    const ts = chartRef.current?.timeScale();
    if (ts) ts.applyOptions({ barSpacing: Math.max(3, ts.options().barSpacing * 0.7) });
  };

  const displayOHLC = hoverOHLC ?? {
    open: stock.formingCandle.open,
    high: stock.dayHigh,
    low: stock.dayLow,
    close: stock.price,
    volume: stock.formingCandle.volume,
  };

  return (
    <GlassCard padding="none" className="overflow-hidden">
      <div className="border-b border-[var(--border-subtle)] px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold tracking-tight">{stock.symbol}</h2>
              <span className="rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                {stock.sector}
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{stock.name}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-3xl font-bold tracking-tight">${stock.price.toFixed(2)}</p>
            <p
              className={cn(
                "font-mono text-sm font-medium mt-1",
                isUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
              )}
            >
              {isUp ? "+" : ""}{amount.toFixed(2)} ({isUp ? "+" : ""}{percent.toFixed(2)}%)
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
          {[
            { label: "Bid", value: `$${stock.bid.toFixed(2)}`, className: "text-red-600 dark:text-red-400" },
            { label: "Ask", value: `$${stock.ask.toFixed(2)}`, className: "text-emerald-600 dark:text-emerald-400" },
            { label: "Spread", value: `$${spread.toFixed(2)}` },
            { label: "Open", value: `$${displayOHLC.open?.toFixed(2)}` },
            { label: "High", value: `$${displayOHLC.high?.toFixed(2)}`, className: "text-emerald-600 dark:text-emerald-400" },
            { label: "Low", value: `$${displayOHLC.low?.toFixed(2)}`, className: "text-red-600 dark:text-red-400" },
            { label: "Close", value: `$${displayOHLC.close?.toFixed(2)}` },
            { label: "Volume", value: displayOHLC.volume?.toLocaleString() ?? stock.volume.toLocaleString() },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2.5 py-2">
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{item.label}</p>
              <p className={cn("font-mono font-semibold text-[var(--text-primary)]", item.className)}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-4 py-2">
        <div className="flex items-center gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                timeframe === tf
                  ? "nav-tab-active"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]",
              )}
            >
              {tf}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-[var(--text-muted)] mr-2 hidden sm:inline">
            Scroll to zoom · Drag to pan
          </span>
          <button onClick={zoomOut} className="icon-btn" title="Zoom out">
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button onClick={zoomIn} className="icon-btn" title="Zoom in">
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button onClick={fitChart} className="icon-btn" title="Reset view">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="h-[420px] w-full min-w-0 bg-[var(--bg-surface)]" />
    </GlassCard>
  );
}

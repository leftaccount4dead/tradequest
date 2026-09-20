export interface Candle {
  /** Unix timestamp in seconds (UTC) */
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookLevel {
  price: number;
  size: number;
}

export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  bid: number;
  ask: number;
  open: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  volatility: number;
  trend: number;
  /** Remaining ticks in a sharp selloff/rally burst */
  shockTicks: number;
  /** Extra % bias per tick during a shock (negative = selloff) */
  shockBias: number;
  /** Sequential candle index — never use wall clock for bar times (prevents chart gaps). */
  candleSeq: number;
  /** Unix time for candle at seq 0; bar time = candleTimeBase + candleSeq */
  candleTimeBase: number;
  /** Every price tick is one candle; full history kept here */
  candles: Candle[];
  /** Mirror of the latest candle */
  formingCandle: Candle;
}

export type ChartTimeframe = "tick" | "1m" | "5m" | "15m" | "1H" | "1D";

export const TIMEFRAME_MINUTES: Record<ChartTimeframe, number> = {
  tick: 0,
  "1m": 1,
  "5m": 5,
  "15m": 15,
  "1H": 60,
  "1D": 1440,
};

export interface Position {
  symbol: string;
  shares: number;
  avgCost: number;
}

export interface Trade {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  shares: number;
  price: number;
  timestamp: number;
}

export interface Portfolio {
  cash: number;
  positions: Position[];
  trades: Trade[];
  startingBalance: number;
  createdAt: number;
  /** Mark-to-market value last saved for classroom leaderboard */
  lastReportedValue?: number;
}

export interface Guide {
  id: string;
  title: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  content: string;
  keyTakeaways: string[];
  /** Book chapter this lesson draws from (for attribution). */
  sourceChapter?: string;
}

export interface CoachMessage {
  id: string;
  role: "user" | "coach";
  content: string;
  timestamp: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface UserGameState {
  portfolio: Portfolio;
  coachMessages: CoachMessage[];
  readGuideIds: string[];
  selectedSymbol: string;
}

export interface MarketResponse {
  stocks: Stock[];
  asOf: number;
  source: "live" | "fallback";
}

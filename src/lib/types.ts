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
  /** Completed 1-minute candles */
  candles: Candle[];
  /** Currently forming 1-minute candle */
  formingCandle: Candle;
}

export type ChartTimeframe = "1m" | "5m" | "15m" | "1H" | "1D";

export const TIMEFRAME_MINUTES: Record<ChartTimeframe, number> = {
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

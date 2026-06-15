"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CoachMessage, Portfolio, Stock, UserGameState } from "@/lib/types";
import { createInitialStocks } from "@/lib/market/stocks";
import { tickAllStocks } from "@/lib/market/simulator";
import {
  createPortfolio,
  executeTrade,
  getPortfolioValue,
  getUnrealizedPnL,
} from "@/lib/market/portfolio";
import { generateCoachResponse } from "@/lib/coach/coach";
import { buildCoachMarketContext } from "@/lib/coach/context";
import { apiGet, apiPut, apiPost } from "@/lib/api-client";

interface AppContextValue {
  stocks: Stock[];
  portfolio: Portfolio;
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  selectedStock: Stock;
  buy: (shares: number) => string | null;
  sell: (shares: number) => string | null;
  resetAccount: () => void;
  totalValue: number;
  unrealizedPnL: number;
  totalPnL: number;
  coachMessages: CoachMessage[];
  sendCoachMessage: (message: string) => Promise<void>;
  coachThinking: boolean;
  readGuideIds: string[];
  markGuideRead: (id: string) => void;
  tradeError: string | null;
  clearTradeError: () => void;
  saving: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

const WELCOME_MESSAGE: CoachMessage = {
  id: "welcome",
  role: "coach",
  content:
    "Welcome to TradeQuest! I'm your trading coach. I won't tell you what to buy or sell — instead, I'll help you learn to analyze markets and manage risk. Ask me questions, and check the Guides tab for structured lessons. You start with $100 — protect it!",
  timestamp: Date.now(),
};

async function fetchState(): Promise<UserGameState | null> {
  const { ok, data } = await apiGet<UserGameState>("/api/state");
  if (!ok || !data) return null;
  return data;
}

async function saveState(state: UserGameState): Promise<void> {
  await apiPut("/api/state", state);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio>(createPortfolio);
  const [selectedSymbol, setSelectedSymbolState] = useState("TECH");
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>([WELCOME_MESSAGE]);
  const [readGuideIds, setReadGuideIds] = useState<string[]>([]);
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [coachThinking, setCoachThinking] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef<UserGameState>({
    portfolio: createPortfolio(),
    coachMessages: [WELCOME_MESSAGE],
    readGuideIds: [],
    selectedSymbol: "TECH",
  });

  const persistState = useCallback((state: UserGameState) => {
    stateRef.current = state;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await saveState(state);
      } finally {
        setSaving(false);
      }
    }, 600);
  }, []);

  useEffect(() => {
    async function init() {
      try {
        setStocks(createInitialStocks());
        const saved = await fetchState();
        if (saved) {
          setPortfolio(saved.portfolio);
          setCoachMessages(saved.coachMessages);
          setReadGuideIds(saved.readGuideIds);
          setSelectedSymbolState(saved.selectedSymbol);
          stateRef.current = saved;
        }
      } catch {
        /* use defaults */
      } finally {
        setReady(true);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const interval = setInterval(() => {
      setStocks((prev) => tickAllStocks(prev));
    }, 2000);
    return () => clearInterval(interval);
  }, [ready]);

  const setSelectedSymbol = useCallback(
    (symbol: string) => {
      setSelectedSymbolState(symbol);
      persistState({ ...stateRef.current, selectedSymbol: symbol });
    },
    [persistState],
  );

  const prices = useMemo(() => {
    const map: Record<string, number> = {};
    stocks.forEach((s) => { map[s.symbol] = s.price; });
    return map;
  }, [stocks]);

  const selectedStock = stocks.find((s) => s.symbol === selectedSymbol) ?? stocks[0];
  const totalValue = getPortfolioValue(portfolio, prices);
  const unrealizedPnL = getUnrealizedPnL(portfolio, prices);
  const totalPnL = totalValue - portfolio.startingBalance;

  const updatePortfolio = useCallback(
    (newPortfolio: Portfolio) => {
      setPortfolio(newPortfolio);
      persistState({ ...stateRef.current, portfolio: newPortfolio });
    },
    [persistState],
  );

  const buy = useCallback(
    (shares: number) => {
      if (!selectedStock) return "Market not ready.";
      const fillPrice = selectedStock.ask;
      const result = executeTrade(portfolio, selectedSymbol, "buy", shares, fillPrice);
      if (result.error) {
        setTradeError(result.error);
        return result.error;
      }
      updatePortfolio(result.portfolio);
      setTradeError(null);
      return null;
    },
    [portfolio, selectedSymbol, selectedStock, updatePortfolio],
  );

  const sell = useCallback(
    (shares: number) => {
      if (!selectedStock) return "Market not ready.";
      const fillPrice = selectedStock.bid;
      const result = executeTrade(portfolio, selectedSymbol, "sell", shares, fillPrice);
      if (result.error) {
        setTradeError(result.error);
        return result.error;
      }
      updatePortfolio(result.portfolio);
      setTradeError(null);
      return null;
    },
    [portfolio, selectedSymbol, selectedStock, updatePortfolio],
  );

  const resetAccount = useCallback(() => {
    const fresh = createPortfolio();
    const messages = [
      {
        id: crypto.randomUUID(),
        role: "coach" as const,
        content: "Account reset! You're back to $100. Take your time, study the guides, and trade smart.",
        timestamp: Date.now(),
      },
    ];
    setPortfolio(fresh);
    setCoachMessages(messages);
    persistState({
      ...stateRef.current,
      portfolio: fresh,
      coachMessages: messages,
    });
  }, [persistState]);

  const sendCoachMessage = useCallback(
    async (message: string) => {
      const userMsg: CoachMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: message,
        timestamp: Date.now(),
      };

      const historyAfterUser = [...coachMessages, userMsg];
      setCoachMessages(historyAfterUser);
      setCoachThinking(true);

      let coachContent: string;

      try {
        const { ok, data } = await apiPost<{
          reply?: string | null;
          error?: string;
          fallback?: boolean;
        }>("/api/coach", {
          message,
          marketContext: buildCoachMarketContext(stocks, portfolio, selectedSymbol),
          history: coachMessages.slice(-8),
        });

        if (ok && data?.reply) {
          coachContent = data.reply;
        } else if (data?.fallback) {
          coachContent =
            data.error
              ? `${data.error}\n\n---\n\n${generateCoachResponse(message, {
                  stocks,
                  portfolio,
                  selectedSymbol,
                  history: coachMessages,
                })}`
              : generateCoachResponse(message, {
                  stocks,
                  portfolio,
                  selectedSymbol,
                  history: coachMessages,
                });
        } else {
          coachContent = data?.error ?? "Something went wrong. Please try again.";
        }
      } catch {
        coachContent = generateCoachResponse(message, {
          stocks,
          portfolio,
          selectedSymbol,
          history: coachMessages,
        });
      } finally {
        setCoachThinking(false);
      }

      const coachMsg: CoachMessage = {
        id: crypto.randomUUID(),
        role: "coach",
        content: coachContent,
        timestamp: Date.now(),
      };

      const newMessages = [...historyAfterUser, coachMsg];
      setCoachMessages(newMessages);
      persistState({ ...stateRef.current, coachMessages: newMessages });
    },
    [stocks, portfolio, selectedSymbol, coachMessages, persistState],
  );

  const markGuideRead = useCallback(
    (id: string) => {
      if (readGuideIds.includes(id)) return;
      const updated = [...readGuideIds, id];
      setReadGuideIds(updated);
      persistState({ ...stateRef.current, readGuideIds: updated });
    },
    [readGuideIds, persistState],
  );

  if (!ready || !selectedStock) {
    return (
      <div className="relative flex min-h-full flex-col items-center justify-center gap-4">
        <div className="app-bg" />
        <div className="loading-spinner" />
        <p className="text-sm text-[var(--text-secondary)]">Loading your portfolio…</p>
      </div>
    );
  }

  const value: AppContextValue = {
    stocks,
    portfolio,
    selectedSymbol,
    setSelectedSymbol,
    selectedStock,
    buy,
    sell,
    resetAccount,
    totalValue,
    unrealizedPnL,
    totalPnL,
    coachMessages,
    sendCoachMessage,
    coachThinking,
    readGuideIds,
    markGuideRead,
    tradeError,
    clearTradeError: () => setTradeError(null),
    saving,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

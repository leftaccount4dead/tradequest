import type { CoachMessage, Portfolio } from "./types";
import { createPortfolio } from "./market/portfolio";

export interface UserGameState {
  portfolio: Portfolio;
  coachMessages: CoachMessage[];
  readGuideIds: string[];
  selectedSymbol: string;
}

const WELCOME_MESSAGE: CoachMessage = {
  id: "welcome",
  role: "coach",
  content:
    "Welcome to TradeQuest! I'm your trading coach. I won't tell you what to buy or sell — instead, I'll help you learn to analyze markets and manage risk. Ask me questions, and check the Guides tab for structured lessons. You start with $100 — protect it!",
  timestamp: Date.now(),
};

export function createDefaultGameState(): UserGameState {
  return {
    portfolio: createPortfolio(),
    coachMessages: [WELCOME_MESSAGE],
    readGuideIds: [],
    selectedSymbol: "TECH",
  };
}

export function parseGameState(
  portfolioJson: string,
  coachJson: string,
  readGuidesJson: string,
  selectedSymbol: string,
): UserGameState {
  try {
    if (!portfolioJson?.trim() || !coachJson?.trim()) {
      return createDefaultGameState();
    }
    return {
      portfolio: JSON.parse(portfolioJson) as Portfolio,
      coachMessages: JSON.parse(coachJson) as CoachMessage[],
      readGuideIds: readGuidesJson?.trim()
        ? (JSON.parse(readGuidesJson) as string[])
        : [],
      selectedSymbol: selectedSymbol || "TECH",
    };
  } catch {
    return createDefaultGameState();
  }
}

export function serializeGameState(state: UserGameState) {
  return {
    portfolioJson: JSON.stringify(state.portfolio),
    coachJson: JSON.stringify(state.coachMessages),
    readGuidesJson: JSON.stringify(state.readGuideIds),
    selectedSymbol: state.selectedSymbol,
  };
}

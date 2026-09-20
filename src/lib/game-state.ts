import type { CoachMessage, Portfolio, UserGameState } from "./types";
import { createPortfolio } from "./market/portfolio";
import { STARTING_BALANCE } from "./constants";

export function getWelcomeMessage(): CoachMessage {
  return {
    id: "welcome",
    role: "coach",
    content: `Welcome to TradeQuest! I'm your trading coach. I won't tell you what to buy or sell — instead, I'll help you learn to analyze markets and manage risk. Ask me questions, and check the Guides tab for structured lessons. You start with $${STARTING_BALANCE} — protect it!`,
    timestamp: Date.now(),
  };
}

const RELEASE_RESET_MESSAGE: CoachMessage = {
  id: "real-market-release-reset-2026-09",
  role: "coach",
  content: `TradeQuest has been updated with stable delayed real-market data. Your trading account was reset to **$${STARTING_BALANCE}** virtual cash for this release. Your login and guide progress were kept, but previous portfolio positions and trades were cleared. No real money is involved.`,
  timestamp: Date.now(),
};

export function migrateGameState(state: UserGameState): {
  state: UserGameState;
  migrated: boolean;
} {
  const hasReleaseReset = state.coachMessages.some((m) => m.id === RELEASE_RESET_MESSAGE.id);
  if (hasReleaseReset) {
    return { state, migrated: false };
  }

  const newPortfolio = createPortfolio();
  const coachMessages = [...state.coachMessages, RELEASE_RESET_MESSAGE];

  return {
    migrated: true,
    state: {
      ...state,
      portfolio: newPortfolio,
      coachMessages,
    },
  };
}

export function createDefaultGameState(): UserGameState {
  return {
    portfolio: createPortfolio(),
    coachMessages: [getWelcomeMessage(), RELEASE_RESET_MESSAGE],
    readGuideIds: [],
    selectedSymbol: "AAPL",
  };
}

export function parseGameState(
  portfolioJson: string,
  coachJson: string,
  readGuidesJson: string,
  selectedSymbol: string,
): { state: UserGameState; migrated: boolean } {
  try {
    if (!portfolioJson?.trim() || !coachJson?.trim()) {
      return { state: createDefaultGameState(), migrated: false };
    }
    const parsed: UserGameState = {
      portfolio: JSON.parse(portfolioJson) as Portfolio,
      coachMessages: JSON.parse(coachJson) as CoachMessage[],
      readGuideIds: readGuidesJson?.trim()
        ? (JSON.parse(readGuidesJson) as string[])
        : [],
      selectedSymbol: selectedSymbol === "TECH" ? "AAPL" : selectedSymbol || "AAPL",
    };
    return migrateGameState(parsed);
  } catch {
    return { state: createDefaultGameState(), migrated: false };
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

import type { CoachMessage, Portfolio, UserGameState } from "./types";
import { createPortfolio } from "./market/portfolio";
import { LEGACY_STARTING_BALANCE, STARTING_BALANCE } from "./constants";

export function getWelcomeMessage(): CoachMessage {
  return {
    id: "welcome",
    role: "coach",
    content: `Welcome to TradeQuest! I'm your trading coach. I won't tell you what to buy or sell — instead, I'll help you learn to analyze markets and manage risk. Ask me questions, and check the Guides tab for structured lessons. You start with $${STARTING_BALANCE} — protect it!`,
    timestamp: Date.now(),
  };
}

const MIGRATION_MESSAGE: CoachMessage = {
  id: "balance-migration-500",
  role: "coach",
  content: `TradeQuest now starts everyone with **$${STARTING_BALANCE}** virtual cash (up from $${LEGACY_STARTING_BALANCE}). Your portfolio was reset to $${STARTING_BALANCE} so you can practice position sizing at the new starting balance. Your guide progress is still saved.`,
  timestamp: Date.now(),
};

/** Reset legacy $100 accounts to a fresh $500 portfolio. */
export function migratePortfolioIfNeeded(portfolio: Portfolio): Portfolio | null {
  if (portfolio.startingBalance !== LEGACY_STARTING_BALANCE) return null;
  return createPortfolio();
}

export function migrateGameState(state: UserGameState): {
  state: UserGameState;
  migrated: boolean;
} {
  const newPortfolio = migratePortfolioIfNeeded(state.portfolio);
  if (!newPortfolio) {
    return { state, migrated: false };
  }

  const hasMigrationNote = state.coachMessages.some((m) => m.id === MIGRATION_MESSAGE.id);
  const coachMessages = hasMigrationNote
    ? state.coachMessages
    : [...state.coachMessages, MIGRATION_MESSAGE];

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
    coachMessages: [getWelcomeMessage()],
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

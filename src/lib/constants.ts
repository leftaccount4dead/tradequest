/** Virtual cash every new account receives. */
export const STARTING_BALANCE = 500;

/** Legacy balance — existing accounts are migrated to STARTING_BALANCE. */
export const LEGACY_STARTING_BALANCE = 100;

export const APP_TAGLINE =
  "The $500 paper-trading classroom — learn day trading without real money.";

export const POSITIONING_BULLETS = [
  "Start with $500 — realistic small-account position sizing",
  "AI coach teaches you to think — never tells you what to buy",
  "12 guided lessons from a pro day-trading curriculum",
  "Simulated charts, order book, and portfolio — zero financial risk",
  "Class leaderboard — see how you rank against other learners",
] as const;

/** Bump when showing a new what's-new popup to users. */
export const LATEST_UPDATE_ID = "2026-09-real-market-update";

export const LATEST_UPDATE = {
  title: "What's new in TradeQuest",
  date: "September 2026",
  highlights: [
    "TradeQuest now follows delayed real-market data from recognizable stock tickers.",
    "Fixed the fast-switching market glitch by replacing browser-side random ticks with stable server snapshots.",
    "Added caching and a fallback snapshot so provider outages cannot make the market untradeable.",
    "Existing accounts were reset to $500 virtual cash. Your login and guide progress were kept.",
    "All trading is still simulated. No real money or real orders are involved.",
  ],
};

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
export const LATEST_UPDATE_ID = "2025-06-live-charts";

export const LATEST_UPDATE = {
  title: "What's new in TradeQuest",
  date: "June 2025",
  highlights: [
    "Everyone now starts with $500 virtual cash (old $100 accounts were reset).",
    "Classroom leaderboard — compete on return % with other learners.",
    "Live charts — a new candlestick on every price tick so the market feels alive.",
    "Bigger swings — sharp selloffs and rallies; a bad run can cost real (virtual) dollars on your positions.",
    "Add to home screen on mobile for a full-screen paper-trading experience.",
  ],
};

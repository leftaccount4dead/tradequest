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

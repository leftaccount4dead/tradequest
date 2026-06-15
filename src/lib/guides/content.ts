/**
 * Trading guides adapted for TradeQuest from concepts in:
 * "The Complete Guide to Day Trading" by Markus Heitkoetter (Rockwell Trading).
 * Original: https://rockwell-files.s3.amazonaws.com/The-Complete-Guide-To-Day-Trading.pdf
 */

import type { Guide } from "../types";

export const GUIDE_ATTRIBUTION = {
  title: "The Complete Guide to Day Trading",
  author: "Markus Heitkoetter",
  organization: "Rockwell Trading",
  year: 2008,
  url: "https://rockwell-files.s3.amazonaws.com/The-Complete-Guide-To-Day-Trading.pdf",
  disclaimer:
    "TradeQuest lessons are original summaries inspired by the book above, rewritten for our $100 paper-trading simulator. Not affiliated with or endorsed by Rockwell Trading.",
};

export const GUIDES: Guide[] = [
  {
    id: "basics",
    title: "What Is Day Trading?",
    category: "Fundamentals",
    difficulty: "beginner",
    sourceChapter: "Part 1 — What Is Day Trading?",
    content: `Day trading means buying and selling within the same session — you open and close positions before the day ends, so you are not carrying overnight risk from news or gaps.

Unlike long-term investing, day traders focus on short-term price movement. The goal is consistent, smaller gains from volatility — not one lucky home run.

Heitkoetter stresses that day trading is a real business: you need a plan, discipline, and education. It is not a get-rich-quick scheme, and it is not guaranteed wealth. With the right tools and knowledge, risk can be reduced — but losses are still part of the job.

**In TradeQuest:**
- You start with **$100** simulated cash — perfect for learning without real money at risk.
- Prices update every few seconds; you can buy at the **ask** and sell at the **bid**.
- Use the **Trade** tab chart, order book, and portfolio to practice the full cycle: plan → enter → manage → exit.

**Core vocabulary:**
- **Entry** — opening a position (buying shares).
- **Exit** — closing a position (selling shares).
- **P&L** — profit or loss on your account.
- **Position size** — how many shares you hold and how much capital is at risk.`,
    keyTakeaways: [
      "Day trading is short-term; close positions and avoid overnight gamble",
      "Success comes from a plan and consistency, not one huge trade",
      "TradeQuest lets you practice entries, exits, and P&L with $100 virtual cash",
    ],
  },
  {
    id: "who-should-trade",
    title: "Who Should Day Trade?",
    category: "Mindset",
    difficulty: "beginner",
    sourceChapter: "Who Should Be Day Trading?",
    content: `Day trading is not for everyone. You will face losses — that is normal. If you cannot accept losing trades, you should not trade.

The traders who do best have two things: a **solid strategy** and the **discipline** to follow it. Software and charts help, but they do not replace education or a written plan.

Heitkoetter describes four mindset habits:

**1. Play above the line** — Take ownership. No blaming the market. If a stock is choppy, switch symbols or wait. You choose what to trade.

**2. Stay positive** — Focus on process and long-term skill, not one bad hour.

**3. Be honest** — Overtraded? Ignored your stop? Admit it, learn, move on.

**4. Stay committed** — Trading skill grows over months, not from one free PDF.

**TradeQuest practice:** Before each simulated trade, ask: "What is my entry reason, stop, and target?" If you cannot answer, do not click Buy.`,
    keyTakeaways: [
      "Losses are part of trading — accept that before you start",
      "Discipline and a written plan matter more than fancy indicators",
      "Take ownership of every trade decision in the simulator",
    ],
  },
  {
    id: "smart-goals",
    title: "SMART Goals & Your Trading Plan",
    category: "Fundamentals",
    difficulty: "beginner",
    sourceChapter: "Define Your Goals and Make a Plan",
    content: `Before you trade, define what you are trying to accomplish. Heitkoetter's three steps: **define goals → make a plan → execute the plan**. Most people fail at execution, not at knowing what to do.

Use a **SMART** goal for your learning phase in TradeQuest:

- **Specific** — e.g. "Grow my $100 account to $110" or "Complete 20 practice trades with a written plan."
- **Measurable** — track balance and trade count in your portfolio history.
- **Attractive** — the goal must motivate you personally.
- **Realistic** — with $100, 10% growth is a strong month; 1000% is fantasy.
- **Time-bound** — e.g. "over the next two weeks of practice."

**Order matters:** Define what you want first, then build how you will trade — not the reverse.

**TradeQuest action:** Open the Guides tab and mark lessons complete as you go. Use the AI coach to review your thesis — it sees your live chart and positions but will not tell you what to buy.`,
    keyTakeaways: [
      "Set SMART goals before you chase profits",
      "Goals first, strategy second — not the other way around",
      "Execution and discipline separate learners from gamblers",
    ],
  },
  {
    id: "small-account",
    title: "Trading Your $100 Account",
    category: "Risk Management",
    difficulty: "beginner",
    sourceChapter: "How Much Money Do You Need?",
    content: `In the real world, minimum account sizes vary by market (stocks, futures, forex). TradeQuest gives everyone the same starting point: **$100** — intentionally small so you learn position sizing early.

Heitkoetter's rules still apply:

- **Never trade money you cannot afford to lose** — here it is simulated, but treat it seriously.
- **Only risk a slice of the account per trade** — with $100, think in dollars and percentages.
- **Start small, grow big** — add size only after consistent process, not after one win.

**Affordability check:** Before buying, look at share price × quantity. A $45 stock with 2 shares costs ~$90 plus spread — that leaves almost no room for error.

**Pick affordable symbols:** TECH, RETL, and ENRG often allow multiple shares. A $120+ symbol may block you from meaningful position size.

**Percentage mindset:** A $2 gain on $100 is 2%. That is a solid learning win. Do not need a "$50 bill" on every trade — small, steady results compound skill.`,
    keyTakeaways: [
      "With $100, position size and share price matter on every trade",
      "Risk a small fraction of the account per trade — not the whole balance",
      "Focus on % returns and process, not lottery-sized dollar dreams",
    ],
  },
  {
    id: "pick-market",
    title: "Pick the Right Stock to Watch",
    category: "Strategy",
    difficulty: "beginner",
    sourceChapter: "Step 1: Selecting a Market",
    content: `Heitkoetter teaches choosing a market that fits your capital, liquidity, and goals. In TradeQuest you trade **eight simulated stocks** across sectors — your job is to pick the **right symbol at the right time**.

**Trade liquid, moving markets:** Use the watchlist and order book. Prefer names with visible volume and a clear bid/ask. Avoid symbols that barely move while you are trying to learn trend trading.

**Trade what is moving:** One of the seven deadly mistakes is trading a choppy, sideways market. If price chops in a tight range with no direction, switch to another symbol or wait.

**Match stock to account size:** You need enough shares for learning. A 1% move on 1 share of a $90 stock is less meaningful than on 10 shares of a $8 stock.

**Sector context:** FINX, HLTH, TECH, ENRG, RETL, AUTO, FOOD, MEDX behave differently. Notice which sectors trend more during your session.

**TradeQuest tip:** Click each symbol, flip timeframes (1m / 5m / 15m), and ask: "Is this trending or chopping?" Trade the trending chart.`,
    keyTakeaways: [
      "Choose symbols that are moving with clear direction",
      "Avoid choppy, sideways charts when learning trends",
      "Match share price to your $100 so you can size positions sensibly",
    ],
  },
  {
    id: "timeframe",
    title: "Choose Your Chart Timeframe",
    category: "Technical Analysis",
    difficulty: "beginner",
    sourceChapter: "Step 2: Selecting a Timeframe",
    content: `Day trading uses intraday timeframes — under one day. Smaller bars (1-minute) give more trades but more noise. Larger bars (15-minute, 1-hour) give bigger average moves but fewer signals.

Heitkoetter recommends **15-minute charts** for many beginners: enough movement to capture intraday trends, but filtered enough to reduce random noise from algorithms and scalpers.

**TradeQuest chart controls:** Switch between 1m, 5m, 15m, 1H, and 1D on the Trade tab. Experiment before changing your entry rules.

**Guidelines:**
- **1m / 5m** — fast action; good for watching detail but easy to overtrade.
- **15m** — solid default for learning trend and structure.
- **1H / 1D** — context for the bigger picture before you drill down.

If a strategy feels wrong on 5m, try 15m first before rewriting all your rules — a common book recommendation.`,
    keyTakeaways: [
      "Smaller timeframes = more signals and more noise",
      "15-minute charts are a strong default for learning intraday trends",
      "Change timeframe before you overhaul your entire strategy",
    ],
  },
  {
    id: "technical-analysis",
    title: "Technical Analysis on Your Chart",
    category: "Technical Analysis",
    difficulty: "beginner",
    sourceChapter: "Step 3: Technical Analysis",
    content: `For day trading, Heitkoetter focuses on **technical analysis** — reading price, volume, and structure on the chart — rather than digging through earnings reports on every tick.

**Core ideas:**
- Price reflects available information for that moment in the simulation.
- Price movement is not purely random; patterns and trends often repeat.
- **Trend** — series of higher lows (uptrend) or lower highs (downtrend).
- **Support** — area where buyers often step in.
- **Resistance** — area where sellers often appear.
- **Volume** — confirms whether a move has participation.

**Keep it simple:** Mistake #1 in the book is overloading the chart with indicators until you cannot see price. Start with trend, levels, and volume on TradeQuest's candlestick chart.

**Bid vs ask:** You buy at the ask (slightly higher) and sell at the bid (slightly lower). The spread is a real cost — especially on a $100 account.

**Practice:** Mark mentally where today's high, low, and prior candle closes sit. Watch how price reacts at those levels live.`,
    keyTakeaways: [
      "Read trend, support/resistance, and volume before adding indicators",
      "Buy at ask, sell at bid — spread is a real cost on small accounts",
      "Simple chart reading beats a screen full of conflicting signals",
    ],
  },
  {
    id: "entries",
    title: "Defining Your Entry Rules",
    category: "Strategy",
    difficulty: "intermediate",
    sourceChapter: "Step 4: Defining Entry Points",
    content: `An entry rule answers: **"Under what exact conditions will I buy?"** Without that, you are guessing.

Heitkoetter's approach: entries must be simple enough to execute live while prices move. Complicated multi-indicator rules fail in real time.

**Example entry frameworks (adapt for TradeQuest):**
- **Trend pullback** — stock in uptrend on 15m; price dips toward support; volume does not spike down; you plan a buy with a stop below the dip.
- **Breakout** — price clears a clear range high with volume picking up; you enter knowing false breakouts happen often.
- **Avoid** — buying because the line went green for one minute with no plan.

**Before you click Buy in TradeQuest:**
1. What timeframe am I trading?
2. What is the trend direction?
3. Where is my stop (invalidation)?
4. Where is my target or exit idea?
5. How many shares fit my risk?

Write it in the coach chat if it helps — explaining your thesis builds discipline.`,
    keyTakeaways: [
      "Every entry needs predefined conditions — not gut feel",
      "Keep entry rules simple enough to execute while prices move",
      "Define stop and target before you click Buy",
    ],
  },
  {
    id: "exits",
    title: "Stops, Targets & Taking Profits",
    category: "Risk Management",
    difficulty: "intermediate",
    sourceChapter: "Step 5: Defining Exit Points",
    content: `Entries get attention; **exits** determine whether you stay in the game. Heitkoetter covers stop losses, profit targets, trailing stops, partial profits, and time-based exits.

**Stop loss** — predefined max loss per trade. With $100, a wide stop can wipe a huge % of the account. Keep losses small.

**Profit target** — know where you take money off the table. Greed (Mistake #2) is holding for "just a little more" until a winner turns red.

**Trailing stop** — as price moves in your favor, raise your mental stop to lock in gains while giving the trade room.

**Risk/reward** — aim for reward larger than risk (e.g. risk $1 to make $1.50). That way you can profit even with a 50% win rate.

**Time stop** — if the trade goes nowhere for many bars, exit. Capital and attention are limited.

**In TradeQuest:** Selling is manual — practice deciding exit levels **before** entry. Check unrealized P&L in the portfolio panel but do not let green/red numbers override your plan.`,
    keyTakeaways: [
      "Set stop loss and profit target before entry",
      "Small consistent wins beat one giant hold-till-it-reverses trade",
      "Target at least 1:1.5 risk/reward when planning trades",
    ],
  },
  {
    id: "seven-mistakes",
    title: "The Seven Deadly Trading Mistakes",
    category: "Mindset",
    difficulty: "intermediate",
    sourceChapter: "The Seven Mistakes of Traders",
    content: `Heitkoetter lists seven big mistakes that cost traders real money. Knowing them helps you avoid traps in TradeQuest:

**1. Can't identify trend** — Too many indicators; forgot that buying uptrends and selling downtrends is the core idea. Use trend and levels first.

**2. Not taking profits** — Waiting for the "grand slam." Consistency with smaller wins builds accounts.

**3. Not limiting losses** — Letting losers run destroys small accounts. Use tight, planned stops.

**4. Trading the wrong market** — Stuck on one choppy symbol. Switch watchlist names when there is no trend.

**5. No trading strategy** — Clicking buy without rules is gambling. Write your plan in the Guides and follow it.

**6. Emotions in control** — Fear, greed, panic, indecision. A plan reduces emotional decisions.

**7. Overtrading** — Too many clicks, too little edge. Quality over quantity, especially on $100.

**Simulator advantage:** Review your trade history after each session. Which mistake showed up most?`,
    keyTakeaways: [
      "Keep trend identification simple — do not drown in indicators",
      "Take profits and cut losses deliberately; both are exits",
      "Switch symbols, slow down, and follow a written strategy",
    ],
  },
  {
    id: "ten-principles",
    title: "Ten Power Principles for Your Plan",
    category: "Strategy",
    difficulty: "advanced",
    sourceChapter: "The 10 Power Principles",
    content: `Use these principles from Heitkoetter to judge whether your TradeQuest approach is realistic:

**1. Few simple rules** — Under ~10 clear rules; easy to follow live.

**2. Liquid markets** — Trade active symbols with tight spreads in the simulator.

**3. Realistic expectations** — Losses happen; no system wins 100%.

**4. Healthy risk/reward** — Profit target ≥ 1.5× your planned risk.

**5. Enough opportunities** — Practice regularly; many small sessions beat one random trade a week.

**6. Start small, grow big** — Never double size after losses (martingale). Grow only with skill and account size.

**7. Automate exits mentally** — Know stop and target before entry; execute without debate.

**8. Win rate vs psychology** — Higher win rates build confidence while learning; extreme low win rates are hard to follow.

**9. Many trials** — Judge yourself over dozens of trades, not one lucky hour.

**10. Valid testing period** — Practice across different market moods in the sim, not just one trending afternoon.

**TradeQuest checkpoint:** After 20+ logged trades, review win rate, average win vs average loss, and whether you followed your rules.`,
    keyTakeaways: [
      "Simple rules you can execute beat complex curve-fitted systems",
      "Risk/reward and position sizing protect a small account",
      "Evaluate your process over many trades, not one session",
    ],
  },
  {
    id: "paper-trading",
    title: "Paper Trade First — You're Already Here",
    category: "Fundamentals",
    difficulty: "beginner",
    sourceChapter: "How to Start Trading Without Risking a Penny",
    content: `Heitkoetter compares trading to driving: you learn, practice in a safe environment, then increase speed. **Paper trading** (simulated money) is that parking lot.

TradeQuest **is** your paper account:
- $100 virtual cash — no real deposit.
- Realistic bid/ask, order book, and candlesticks.
- Portfolio and trade history saved to your login.

**Suggested learning path:**
1. Read Guides 1–4 before your first trade.
2. Watch one symbol for 15 minutes without trading.
3. Place **one** small trade with entry, stop, and target written down.
4. Review the outcome in history — process, not just P&L.
5. Ask the AI coach to discuss what you saw (not "what should I buy").

**When to treat it more seriously:** Once you follow a plan on 20+ trades and understand your stats, you are building real skill — whether you later trade live or not.

**Remember:** Paper profits feel real to your habits. Sloppy simulation becomes sloppy live trading.`,
    keyTakeaways: [
      "TradeQuest is paper trading — use it to build skill before real money",
      "Practice with a written plan and review every trade",
      "Good habits in the sim become good habits with real capital",
    ],
  },
];

export const GUIDE_CATEGORIES = [...new Set(GUIDES.map((g) => g.category))];

import type { CoachMessage, Portfolio, Stock } from "../types";
import { getChange } from "../market/simulator";
import { getPortfolioValue, getUnrealizedPnL } from "../market/portfolio";

interface CoachContext {
  stocks: Stock[];
  portfolio: Portfolio;
  selectedSymbol?: string;
  history: CoachMessage[];
}

const REFUSAL_PATTERNS = [
  /what (stock|share) should i (buy|sell|trade)/i,
  /tell me (to )?(buy|sell)/i,
  /which (stock|one) (should|to)/i,
  /give me a (trade|pick|signal)/i,
  /what('s| is) the best (stock|trade)/i,
  /should i (buy|sell) .+/i,
];

function isAskingForDirectAdvice(message: string): boolean {
  return REFUSAL_PATTERNS.some((p) => p.test(message));
}

function analyzeStock(stock: Stock): string[] {
  const { percent } = getChange(stock);
  const hints: string[] = [];

  if (percent > 2) {
    hints.push(`${stock.symbol} is up ${percent.toFixed(1)}% today — that's a strong move. Ask yourself: is this momentum sustainable, or are late buyers getting in at the top?`);
  } else if (percent < -2) {
    hints.push(`${stock.symbol} is down ${percent.toFixed(1)}% today. Before buying the dip, consider: is there a reason for the drop, or is it just normal volatility?`);
  } else {
    hints.push(`${stock.symbol} is relatively flat today (${percent > 0 ? "+" : ""}${percent.toFixed(1)}%). Flat markets can precede big moves — watch for volume changes.`);
  }

  const recentPrices = stock.candles.slice(-20).map((c) => c.close);
  if (stock.formingCandle) recentPrices.push(stock.formingCandle.close);
  const recentHigh = Math.max(...recentPrices);
  const recentLow = Math.min(...recentPrices);
  const range = recentHigh - recentLow;

  if (range > 0) {
    const positionInRange = (stock.price - recentLow) / range;
    if (positionInRange > 0.8) {
      hints.push(`Price is near the top of its recent range ($${recentLow.toFixed(2)} – $${recentHigh.toFixed(2)}). Buying near highs increases risk — what's your stop loss?`);
    } else if (positionInRange < 0.2) {
      hints.push(`Price is near the bottom of its recent range ($${recentLow.toFixed(2)} – $${recentHigh.toFixed(2)}). Lower prices can mean opportunity OR continued weakness. What evidence supports a bounce?`);
    }
  }

  const allCandles = [...stock.candles, stock.formingCandle];
  const recentVolume = allCandles.slice(-5).reduce((s, c) => s + c.volume, 0);
  const olderVolume = allCandles.slice(-15, -5).reduce((s, c) => s + c.volume, 0);
  if (recentVolume > olderVolume * 1.5) {
    hints.push("Volume is picking up — more traders are participating. Higher volume on a move tends to be more meaningful.");
  }

  return hints;
}

function analyzePortfolio(portfolio: Portfolio, prices: Record<string, number>): string[] {
  const hints: string[] = [];
  const totalValue = getPortfolioValue(portfolio, prices);
  const pnl = totalValue - portfolio.startingBalance;
  const unrealized = getUnrealizedPnL(portfolio, prices);

  if (portfolio.trades.length === 0) {
    hints.push("You haven't made any trades yet. Before your first trade, read the Risk Management guide. With $100, protecting your capital is everything.");
    return hints;
  }

  hints.push(`Your account is at $${totalValue.toFixed(2)} (${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)} from start).`);

  if (portfolio.cash < portfolio.startingBalance * 0.1 && portfolio.positions.length > 0) {
    hints.push("Most of your money is in positions. If the market moves against you, you have little cash to respond. Consider whether your position sizes are appropriate.");
  }

  if (portfolio.cash === portfolio.startingBalance && portfolio.positions.length === 0) {
    hints.push("You're sitting on 100% cash. Sometimes the best trade is no trade. But when you're ready, start small — maybe 20-30% of your account on one position.");
  }

  if (unrealized > 0) {
    hints.push(`You have $${unrealized.toFixed(2)} in unrealized gains. Remember: profits aren't real until you sell. Do you have a plan for taking profits?`);
  } else if (unrealized < -2) {
    hints.push(`You're down $${Math.abs(unrealized).toFixed(2)} on open positions. Review each position: does your original reason for buying still hold?`);
  }

  const recentTrades = portfolio.trades.slice(-5);
  const recentLosses = recentTrades.filter((t) => {
    if (t.side === "sell") {
      const buyTrade = portfolio.trades.find(
        (bt) => bt.symbol === t.symbol && bt.side === "buy" && bt.timestamp < t.timestamp,
      );
      return buyTrade && t.price < buyTrade.price;
    }
    return false;
  });

  if (recentLosses.length >= 2) {
    hints.push("You've had a few losing trades recently. This is normal, but consider taking a break to review your strategy rather than revenge trading.");
  }

  return hints;
}

function getEducationalResponse(topic: string): string {
  const responses: Record<string, string> = {
    support: "Support is a price level where buying interest tends to emerge. Think of it as a 'floor' where price bounces. Watch how price reacts when it approaches support — a bounce confirms it, a break below suggests weakness.",
    resistance: "Resistance is where selling pressure tends to appear — a 'ceiling' price struggles to break through. If price keeps rejecting a level, sellers are active there. A clean break above resistance with volume can signal a bullish move.",
    volume: "Volume tells you how many shares are being traded. High volume on a price move suggests conviction. Low volume moves are less reliable. Compare current volume to recent average volume to gauge participation.",
    stop: "A stop loss is your safety net. Before buying, decide: 'If price drops to $X, I'll sell.' This prevents small losses from becoming account-killing losses. With $100, even a $5 loss is 5% of your account.",
    trend: "Trends show the general direction of price. In an uptrend, look for higher lows. In a downtrend, lower highs. 'The trend is your friend' — trading against the trend requires stronger evidence.",
    risk: "Risk management is everything. Never risk more than 1-2% of your account per trade. With $100, that's $1-2. Set stop losses. Size positions appropriately. Survival first, profits second.",
    default: "That's a great question to explore. Instead of giving you a direct answer, let me point you in the right direction: check the Guides section for structured lessons, and try to form your own thesis before trading. What specific aspect are you trying to understand?",
  };

  const lower = topic.toLowerCase();
  for (const [key, response] of Object.entries(responses)) {
    if (key !== "default" && lower.includes(key)) return response;
  }
  return responses.default;
}

export function generateCoachResponse(userMessage: string, context: CoachContext): string {
  if (isAskingForDirectAdvice(userMessage)) {
    return `I can't tell you exactly what to buy or sell — that's not how real traders learn. My job is to help you **think** like a trader.

Here's what I'd suggest instead:
1. Look at the chart — what's the trend? Where's support and resistance?
2. Check the volume — is the move confirmed by participation?
3. Define your risk — where would you set a stop loss?
4. Calculate position size — how much of your $${context.portfolio.cash.toFixed(2)} cash are you willing to risk?

Form your own thesis, then we can discuss whether your reasoning is sound. What do you see in the chart?`;
  }

  const prices: Record<string, number> = {};
  context.stocks.forEach((s) => { prices[s.symbol] = s.price; });

  const parts: string[] = [];

  if (context.selectedSymbol) {
    const stock = context.stocks.find((s) => s.symbol === context.selectedSymbol);
    if (stock) {
      parts.push(`Looking at **${stock.name} (${stock.symbol})** at $${stock.price.toFixed(2)}:`);
      parts.push(...analyzeStock(stock));
    }
  }

  const portfolioHints = analyzePortfolio(context.portfolio, prices);
  if (portfolioHints.length > 0) {
    parts.push("");
    parts.push("**Your portfolio:**");
    parts.push(...portfolioHints);
  }

  const educational = getEducationalResponse(userMessage);
  if (parts.length === 0) {
    return educational;
  }

  parts.push("");
  parts.push(educational);

  return parts.join("\n");
}

export const COACH_SUGGESTIONS = [
  "How do I read this chart?",
  "What is support and resistance?",
  "How should I manage risk with $100?",
  "When should I take profits?",
  "What does volume tell me?",
  "Help me analyze my portfolio",
];

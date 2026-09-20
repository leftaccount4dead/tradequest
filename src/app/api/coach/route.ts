import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { jsonError, readJsonBody } from "@/lib/api-server";
import {
  type CoachMarketContext,
  formatContextForPrompt,
  type CoachHistoryTurn,
} from "@/lib/coach/context";
import {
  callGeminiCoach,
  DEFAULT_GEMINI_MODEL,
  getGeminiConfig,
  isGeminiConfigured,
} from "@/lib/coach/gemini";
import { checkCoachRateLimit } from "@/lib/coach/rate-limit";

interface CoachRequestBody {
  message?: string;
  marketContext?: CoachMarketContext;
  history?: CoachHistoryTurn[];
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const body = await readJsonBody<CoachRequestBody>(request);
  if (!body?.message?.trim()) {
    return jsonError("Message is required.", 400);
  }

  const { apiKey, model } = getGeminiConfig();
  if (!apiKey) {
    return NextResponse.json({
      reply: null,
      error:
        "AI coach is not configured. Add a free GEMINI_API_KEY to your .env file and restart the server. Get one at https://aistudio.google.com/apikey",
      fallback: true,
    });
  }

  const rate = checkCoachRateLimit(session.userId);
  if (!rate.allowed) {
    return NextResponse.json({
      reply: null,
      error:
        "You've hit the hourly coach limit for now. Take a break, review your trades, and try again in a bit — or use the Guides tab while you wait.",
      fallback: true,
    });
  }

  const userMessage = body.message.trim();
  const marketContext = body.marketContext;
  const history = (body.history ?? []).slice(-8);

  const contextBlock = marketContext
    ? formatContextForPrompt(marketContext)
    : "No live market context provided.";

  const { reply, error } = await callGeminiCoach({
    apiKey,
    model,
    contextBlock,
    history,
    userMessage,
  });

  if (reply) {
    return NextResponse.json({ reply });
  }

  return NextResponse.json({
    reply: null,
    error: error ?? "AI request failed.",
    fallback: true,
  });
}

/** Health check — whether Gemini is configured */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }
  return NextResponse.json({
    configured: isGeminiConfigured(),
    provider: "gemini",
    model: getGeminiConfig().model || DEFAULT_GEMINI_MODEL,
  });
}

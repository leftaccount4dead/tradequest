import { COACH_SYSTEM_PROMPT } from "./prompt";
import type { CoachHistoryTurn } from "./context";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite";

interface GeminiPart {
  text: string;
}

interface GeminiContent {
  role?: "user" | "model";
  parts: GeminiPart[];
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
  }>;
  error?: { message?: string; code?: number };
}

export function getGeminiConfig() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
  return { apiKey, model };
}

export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiConfig().apiKey);
}

export async function callGeminiCoach(params: {
  apiKey: string;
  model: string;
  contextBlock: string;
  history: CoachHistoryTurn[];
  userMessage: string;
}): Promise<{ reply?: string; error?: string }> {
  const { apiKey, model, contextBlock, history, userMessage } = params;

  const systemInstruction = `${COACH_SYSTEM_PROMPT}\n\nCurrent live data for this user:\n\n${contextBlock}`;

  const contents: GeminiContent[] = [];

  for (const turn of history) {
    if (turn.role !== "user" && turn.role !== "coach") continue;
    contents.push({
      role: turn.role === "coach" ? "model" : "user",
      parts: [{ text: turn.content }],
    });
  }

  contents.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  const url = `${GEMINI_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: {
          maxOutputTokens: 600,
          temperature: 0.7,
        },
      }),
    });

    const data = (await res.json()) as GeminiResponse;

    if (!res.ok) {
      const errMsg = data.error?.message ?? `Gemini API error (${res.status})`;
      return { error: errMsg };
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!reply) {
      return { error: "Empty AI response." };
    }

    return { reply };
  } catch {
    return { error: "Could not reach the AI service. Check your connection and API key." };
  }
}

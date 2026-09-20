import { NextResponse } from "next/server";
import { createInitialStocks } from "@/lib/market/stocks";
import { fetchLiveStocks } from "@/lib/market/live";
import type { Stock } from "@/lib/types";

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 30_000;
let cached: { stocks: Stock[]; asOf: number; source: "live" | "fallback" } | null = null;

export async function GET() {
  const now = Date.now();
  if (cached && now - cached.asOf < CACHE_TTL_MS) return NextResponse.json(cached);

  try {
    cached = { stocks: await fetchLiveStocks(), asOf: now, source: "live" };
  } catch {
    cached = cached ?? { stocks: createInitialStocks(), asOf: now, source: "fallback" };
    cached = { ...cached, asOf: now };
  }

  return NextResponse.json(cached, { headers: { "Cache-Control": "public, max-age=15, stale-while-revalidate=30" } });
}
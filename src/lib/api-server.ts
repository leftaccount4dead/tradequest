import { NextResponse } from "next/server";
import { safeJsonParse } from "@/lib/api-client";

/** Safely read JSON from a request body — never throws. */
export async function readJsonBody<T>(request: Request): Promise<T | null> {
  try {
    const raw = await request.text();
    return safeJsonParse<T>(raw);
  } catch {
    return null;
  }
}

export async function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

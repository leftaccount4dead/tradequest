/** Simple in-memory per-user rate limit for coach API (protects shared free-tier key). */

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

const DEFAULT_LIMIT = 40;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getLimit(): number {
  const raw = process.env.COACH_RATE_LIMIT_PER_HOUR;
  if (!raw) return DEFAULT_LIMIT;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_LIMIT;
}

export function checkCoachRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const limit = getLimit();
  const now = Date.now();
  const entry = windows.get(userId);

  if (!entry || now >= entry.resetAt) {
    windows.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}

/** Prune stale entries occasionally */
export function pruneRateLimitWindows() {
  const now = Date.now();
  for (const [id, entry] of windows) {
    if (now >= entry.resetAt) windows.delete(id);
  }
}

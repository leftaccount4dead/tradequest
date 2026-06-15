/** Parse a JSON string safely — never throws. */
export function safeJsonParse<T>(text: string): T | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return null;
  }
}

/** Safely parse a fetch response body as JSON (handles empty or non-JSON bodies). */
export async function parseJsonResponse<T>(res: Response): Promise<T | null> {
  try {
    const text = await res.text();
    return safeJsonParse<T>(text);
  } catch {
    return null;
  }
}

const defaultFetchOpts: RequestInit = { credentials: "same-origin" };

export async function apiGet<T>(url: string): Promise<{ ok: boolean; data: T | null }> {
  try {
    const res = await fetch(url, defaultFetchOpts);
    const data = await parseJsonResponse<T>(res);
    return { ok: res.ok, data };
  } catch {
    return { ok: false, data: null };
  }
}

export async function apiPost<T>(url: string, body: unknown): Promise<{ ok: boolean; data: T | null }> {
  try {
    const res = await fetch(url, {
      ...defaultFetchOpts,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await parseJsonResponse<T>(res);
    return { ok: res.ok, data };
  } catch {
    return { ok: false, data: null };
  }
}

export async function apiPut<T>(url: string, body: unknown): Promise<{ ok: boolean; data: T | null }> {
  try {
    const res = await fetch(url, {
      ...defaultFetchOpts,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await parseJsonResponse<T>(res);
    return { ok: res.ok, data };
  } catch {
    return { ok: false, data: null };
  }
}

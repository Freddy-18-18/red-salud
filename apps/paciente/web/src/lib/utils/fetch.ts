/**
 * Typed fetch wrapper for BFF API routes.
 *
 * Expects the API to return `{ data: T }` on success and
 * `{ error: string }` on failure.
 */
export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, init);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as Record<string, string>).error ??
        `Request failed (${res.status})`,
    );
  }

  const json = await res.json();
  return json.data as T;
}

/**
 * POST/PATCH/PUT helper that sends JSON body.
 */
export async function postJson<T>(
  url: string,
  body: unknown,
  method: "POST" | "PATCH" | "PUT" = "POST",
): Promise<T> {
  return fetchJson<T>(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * Typed fetch wrapper for BFF API routes.
 *
 * Expects the API to return `{ data: T }` on success and
 * `{ error: string }` on failure.
 *
 * URL resolution:
 *  - Absolute URLs (http://..., https://...) are passed through.
 *  - Relative URLs from the browser stay relative — the browser resolves them
 *    against window.location.
 *  - Relative URLs from server code (Server Components, Route Handlers) get
 *    promoted to absolute by reading the request's host/proto via
 *    `next/headers`. Server fetch() requires an absolute URL — passing a
 *    relative one throws TypeError("Failed to parse URL", ERR_INVALID_URL).
 */

async function resolveUrl(url: string): Promise<string> {
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window !== "undefined") return url; // browser context

  // Server: read the inbound request headers to build an absolute URL.
  // `next/headers` is dynamic-imported so this file stays usable from edge
  // contexts that load it without ever calling fetchJson on the server.
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const host =
      h.get("x-forwarded-host") ??
      h.get("host") ??
      process.env.NEXT_PUBLIC_SITE_HOST ??
      "localhost:3003";
    const proto =
      h.get("x-forwarded-proto") ??
      (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
    return `${proto}://${host}${url.startsWith("/") ? url : `/${url}`}`;
  } catch {
    // Outside of a request scope (e.g., build-time prerender). Fall back to
    // an env-configured site URL or localhost.
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3003";
    return `${base.replace(/\/$/, "")}${url.startsWith("/") ? url : `/${url}`}`;
  }
}

export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const resolved = await resolveUrl(url);
  const res = await fetch(resolved, init);

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

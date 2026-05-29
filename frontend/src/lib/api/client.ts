// Thin fetch wrapper used by every resource file in lib/api/.
// Always sends cookies (credentials: include) so the JWT cookie set by /login
// rides along on every request. Throws { status, message } on non-2xx so
// react-query's onError gets a structured error.

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// prod (Vercel) talks to the backend directly at NEXT_PUBLIC_API_URL since
// Vercel can't proxy the websocket, so I drop the same-origin rewrite trick.
// empty in dev -> relative /api/v1 rides the Next.js rewrite. frontend is
// served from [mydomain] and the backend from api.[mydomain].com, same registrable
// domain, so the host-only jwt cookie is first-party and SameSite=lax sends it.
const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_ORIGIN}/api/v1${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.message ?? res.statusText ?? "Request failed",
    );
  }

  return body as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

/**
 * Minimal fetch wrapper for the PriorTree API.
 *
 * - Always sends cookies (`credentials: "include"`) so the HttpOnly access /
 *   refresh cookies ride along.
 * - On a 401 it attempts a single silent `/auth/refresh` and replays the
 *   original request once, so an expired access token is transparent to callers.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

/** Absolute URL for a browser navigation (e.g. the Google OAuth redirect). */
export const apiUrl = (path: string): string => `${API_BASE_URL}${path}`;

// Auth endpoints must never trigger the refresh-and-retry loop.
const NO_RETRY_PATHS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
]);

export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

interface ApiFetchOptions extends RequestInit {
  /** Internal guard against infinite refresh loops. */
  _isRetry?: boolean;
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { _isRetry, headers, ...rest } = options;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...headers },
  });

  if (res.status === 401 && !_isRetry && !NO_RETRY_PATHS.has(path)) {
    const refreshed = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (refreshed.ok) {
      return apiFetch<T>(path, { ...options, _isRetry: true });
    }
  }

  const body = await parseBody(res);

  if (!res.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message, body);
  }

  return body as T;
}

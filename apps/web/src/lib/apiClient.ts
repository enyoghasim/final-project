export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let onUnauthorized: (() => void) | undefined;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

function getToken(): string | null {
  return localStorage.getItem("token");
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  isFormData?: boolean;
  query?: Record<string, string | number | undefined>;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, isFormData = false, query } = options;

  const url = new URL(path, API_BASE_URL);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let requestBody: BodyInit | undefined;
  if (body !== undefined) {
    if (isFormData) {
      requestBody = body as FormData;
    } else {
      headers["Content-Type"] = "application/json";
      requestBody = JSON.stringify(body);
    }
  }

  const response = await fetch(url, { method, headers, body: requestBody });

  // Only treat a 401 as "your session expired" when this request was sent
  // with a token in the first place. A 401 on an unauthenticated request
  // (e.g. a login attempt with the wrong password) is a normal business
  // response, not a session expiry, and should show the server's real
  // message instead of logging the user out of a session they never had.
  if (response.status === 401 && token) {
    onUnauthorized?.();
    throw new ApiError("Session expired. Please log in again.", 401);
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: "Request failed." }));
    throw new ApiError(data.error ?? "Request failed.", response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

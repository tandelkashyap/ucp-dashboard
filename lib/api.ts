import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./session";

const API_URL = process.env.API_URL ?? "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Server-only — reads the httpOnly cookie directly via next/headers, which
 * only works in Server Components, Route Handlers, and Server Actions.
 * There's deliberately no client-side equivalent: any data a client
 * component needs should be fetched in a Server Component and passed down
 * as props, keeping the token itself server-side at all times.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, body?.message ?? "Request failed.", body?.errors);
  }

  return body as T;
}

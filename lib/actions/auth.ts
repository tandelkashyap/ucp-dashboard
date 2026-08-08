"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

const API_URL = process.env.API_URL ?? "http://localhost:8000/api";

export type AuthFormState = { error?: string; fieldErrors?: Record<string, string[]> } | undefined;

async function authenticate(path: "login" | "register", payload: Record<string, string>) {
  const response = await fetch(`${API_URL}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      error: (body?.message as string) ?? "Something went wrong.",
      fieldErrors: body?.errors as Record<string, string[]> | undefined,
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, body.token as string, sessionCookieOptions);

  return null;
}

export async function loginAction(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const result = await authenticate("login", {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (result) return result;

  redirect("/dashboard");
}

export async function registerAction(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const result = await authenticate("register", {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (result) return result;

  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    // Best-effort — revoke the Sanctum token server-side. Cookie clears
    // either way, so a network hiccup here doesn't strand the user
    // logged-in-looking on the client.
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    }).catch(() => null);
  }

  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}

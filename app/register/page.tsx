"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction } from "@/lib/actions/auth";
import { Field } from "@/components/auth-field";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          UCP
        </Link>

        <h1 className="mt-8 font-display text-2xl font-semibold tracking-tight text-ink">
          Create an account
        </h1>
        <p className="mt-1 text-sm text-ink-muted">Set up your merchant dashboard.</p>

        <form action={formAction} className="mt-6 space-y-4" noValidate>
          <Field label="Name" name="name" type="text" autoComplete="name" error={state?.fieldErrors?.name} />
          <Field label="Email" name="email" type="email" autoComplete="email" error={state?.fieldErrors?.email} />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            error={state?.fieldErrors?.password}
          />

          {state?.error && (
            <p role="alert" className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-accent px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
          >
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-ink underline-offset-2 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

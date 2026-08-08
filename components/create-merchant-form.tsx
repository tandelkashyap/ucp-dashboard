"use client";

import { useActionState } from "react";
import { createMerchantAction } from "@/lib/actions/merchants";

export function CreateMerchantForm() {
  const [state, formAction, pending] = useActionState(createMerchantAction, undefined);

  return (
    <form action={formAction} className="mt-6">
      <div className="flex gap-2">
        <input
          name="name"
          type="text"
          required
          placeholder="Acme Store"
          aria-label="Merchant name"
          className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create"}
        </button>
      </div>
      {state?.error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}

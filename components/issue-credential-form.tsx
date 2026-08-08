"use client";

import { useActionState, useState } from "react";
import { issueCredentialAction } from "@/lib/actions/credentials";

const SCOPES = ["catalog", "cart", "checkout"] as const;

export function IssueCredentialForm({ merchantId, merchantSlug }: { merchantId: number; merchantSlug: string }) {
  const [state, formAction, pending] = useActionState(issueCredentialAction, undefined);
  const [dismissed, setDismissed] = useState(false);

  if (state?.token && !dismissed) {
    return (
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
        <p className="text-sm font-medium text-ink">Credential created</p>
        <p className="mt-1 text-sm text-ink-muted">Copy this token now — it will not be shown again.</p>
        <code className="mt-3 block break-all rounded-md bg-surface px-3 py-2 font-mono text-xs text-ink">
          {state.token}
        </code>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="mt-3 text-sm font-medium text-ink underline-offset-2 hover:underline"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-lg border border-border bg-surface p-4">
      <input type="hidden" name="merchant_id" value={merchantId} />
      <input type="hidden" name="merchant_slug" value={merchantSlug} />

      <div className="flex gap-2">
        <input
          name="agent_platform"
          type="text"
          required
          placeholder="e.g. gemini, chatgpt"
          aria-label="Agent platform"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Issuing…" : "Issue token"}
        </button>
      </div>

      <fieldset className="mt-3 flex gap-4">
        <legend className="sr-only">Scopes</legend>
        {SCOPES.map((scope) => (
          <label key={scope} className="flex items-center gap-1.5 font-mono text-xs text-ink-muted">
            <input type="checkbox" name="scopes" value={scope} defaultChecked className="accent-accent" />
            {scope}
          </label>
        ))}
      </fieldset>

      {state?.error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}

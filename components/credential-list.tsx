import { revokeCredentialAction } from "@/lib/actions/credentials";

type AgentCredential = {
  id: number;
  agent_platform: string;
  key_id: string;
  scopes: string[];
  status: "active" | "revoked";
  last_used_at: string | null;
};

export function CredentialList({
  credentials,
  merchantId,
  merchantSlug,
}: {
  credentials: AgentCredential[];
  merchantId: number;
  merchantSlug: string;
}) {
  if (credentials.length === 0) {
    return <p className="text-sm text-ink-muted">No credentials issued yet.</p>;
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
      {credentials.map((credential) => (
        <li key={credential.id} className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-medium text-ink">{credential.agent_platform}</p>
            <p className="font-mono text-xs text-ink-muted">{credential.key_id}</p>
            <p className="mt-1 font-mono text-xs text-ink-muted">{credential.scopes.join(", ")}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-xs ${
                credential.status === "active" ? "bg-accent/10 text-accent" : "bg-border text-ink-muted"
              }`}
            >
              {credential.status}
            </span>
            {credential.status === "active" && (
              <form action={revokeCredentialAction}>
                <input type="hidden" name="merchant_id" value={merchantId} />
                <input type="hidden" name="merchant_slug" value={merchantSlug} />
                <input type="hidden" name="credential_id" value={credential.id} />
                <button type="submit" className="text-xs text-ink-muted transition-colors hover:text-danger">
                  Revoke
                </button>
              </form>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

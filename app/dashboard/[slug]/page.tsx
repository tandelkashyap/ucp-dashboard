import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { ConnectStoreForm } from "@/components/connect-store-form";
import { StoreConnectionList } from "@/components/store-connection-list";
import { CapabilityList } from "@/components/capability-list";
import { IssueCredentialForm } from "@/components/issue-credential-form";
import { CredentialList } from "@/components/credential-list";

type Merchant = { id: number; name: string; slug: string; status: "pending" | "active" | "suspended" };

const STATUS_STYLES: Record<Merchant["status"], string> = {
  active: "bg-accent/10 text-accent",
  pending: "bg-warn-bg text-warn",
  suspended: "bg-danger-bg text-danger",
};

export default async function MerchantDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const merchant = await getMerchant(slug);

  const [connections, capabilities, credentials] = await Promise.all([
    apiFetch<
      Array<{
        id: number;
        platform: string;
        external_store_identifier: string;
        status: "connecting" | "connected" | "error" | "disconnected";
        last_error: string | null;
        last_synced_at: string | null;
      }>
    >(`/merchants/${merchant.id}/store-connections`),
    apiFetch<Array<{ id: number; capability: string; enabled: boolean }>>(`/merchants/${merchant.id}/capabilities`),
    apiFetch<
      Array<{
        id: number;
        agent_platform: string;
        key_id: string;
        scopes: string[];
        status: "active" | "revoked";
        last_used_at: string | null;
      }>
    >(`/merchants/${merchant.id}/agent-credentials`),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm text-ink-muted">
          <Link href="/dashboard" className="hover:underline">
            Merchants
          </Link>{" "}
          / {merchant.name}
        </p>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="font-display text-xl font-semibold tracking-tight text-ink">{merchant.name}</h1>
          <span className={`rounded-full px-2 py-0.5 font-mono text-xs ${STATUS_STYLES[merchant.status]}`}>
            {merchant.status}
          </span>
        </div>
        <p className="mt-1 font-mono text-xs text-ink-muted">{merchant.slug}</p>
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold tracking-tight text-ink">Store connection</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Credentials are encrypted at rest — see StoreConnection&apos;s <code className="font-mono">encrypted:array</code> cast.
        </p>
        <div className="mt-4">
          <StoreConnectionList connections={connections} merchantId={merchant.id} merchantSlug={merchant.slug} />
        </div>
        <div className="mt-4 rounded-lg border border-border bg-surface p-4">
          <ConnectStoreForm merchantId={merchant.id} merchantSlug={merchant.slug} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold tracking-tight text-ink">Capabilities</h2>
        <p className="mt-1 text-sm text-ink-muted">Which UCP endpoints agents can reach for this merchant.</p>
        <div className="mt-4">
          <CapabilityList capabilities={capabilities} merchantId={merchant.id} merchantSlug={merchant.slug} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold tracking-tight text-ink">Agent credentials</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Scoped tokens AI agents authenticate with. Shown once, at creation — not retrievable again after that.
        </p>
        <div className="mt-4 space-y-4">
          <IssueCredentialForm merchantId={merchant.id} merchantSlug={merchant.slug} />
          <CredentialList credentials={credentials} merchantId={merchant.id} merchantSlug={merchant.slug} />
        </div>
      </section>
    </div>
  );
}

async function getMerchant(slug: string): Promise<Merchant> {
  try {
    return await apiFetch<Merchant>(`/merchants/${slug}`);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) redirect("/login");
      if (error.status === 404 || error.status === 403) notFound();
    }
    throw error;
  }
}

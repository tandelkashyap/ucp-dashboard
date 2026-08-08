import { disconnectStoreAction } from "@/lib/actions/store-connections";

type StoreConnection = {
  id: number;
  platform: string;
  external_store_identifier: string;
  status: "connecting" | "connected" | "error" | "disconnected";
  last_error: string | null;
  last_synced_at: string | null;
};

const STATUS_STYLES: Record<StoreConnection["status"], string> = {
  connected: "bg-accent/10 text-accent",
  connecting: "bg-warn-bg text-warn",
  error: "bg-danger-bg text-danger",
  disconnected: "bg-border text-ink-muted",
};

export function StoreConnectionList({
  connections,
  merchantId,
  merchantSlug,
}: {
  connections: StoreConnection[];
  merchantId: number;
  merchantSlug: string;
}) {
  if (connections.length === 0) {
    return <p className="text-sm text-ink-muted">No store connected yet.</p>;
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
      {connections.map((connection) => (
        <li key={connection.id} className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-medium capitalize text-ink">{connection.platform}</p>
            <p className="font-mono text-xs text-ink-muted">{connection.external_store_identifier}</p>
            {connection.last_error && <p className="mt-1 text-xs text-danger">{connection.last_error}</p>}
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-2 py-0.5 font-mono text-xs ${STATUS_STYLES[connection.status]}`}>
              {connection.status}
            </span>
            <form action={disconnectStoreAction}>
              <input type="hidden" name="merchant_id" value={merchantId} />
              <input type="hidden" name="merchant_slug" value={merchantSlug} />
              <input type="hidden" name="connection_id" value={connection.id} />
              <button type="submit" className="text-xs text-ink-muted transition-colors hover:text-danger">
                Disconnect
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}

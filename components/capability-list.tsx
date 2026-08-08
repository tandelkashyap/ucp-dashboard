import { toggleCapabilityAction } from "@/lib/actions/capabilities";

type CapabilityConfig = {
  id: number;
  capability: string;
  enabled: boolean;
};

export function CapabilityList({
  capabilities,
  merchantId,
  merchantSlug,
}: {
  capabilities: CapabilityConfig[];
  merchantId: number;
  merchantSlug: string;
}) {
  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
      {capabilities.map((capability) => (
        <li key={capability.id} className="flex items-center justify-between px-4 py-3">
          <span className="font-mono text-sm text-ink">{capability.capability}</span>
          <form action={toggleCapabilityAction}>
            <input type="hidden" name="merchant_id" value={merchantId} />
            <input type="hidden" name="merchant_slug" value={merchantSlug} />
            <input type="hidden" name="capability_config_id" value={capability.id} />
            <input type="hidden" name="enabled" value={String(capability.enabled)} />
            <button
              type="submit"
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                capability.enabled ? "bg-accent text-white" : "bg-border text-ink-muted"
              }`}
            >
              {capability.enabled ? "Enabled" : "Disabled"}
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}

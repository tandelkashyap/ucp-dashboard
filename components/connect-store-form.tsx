"use client";

import { useActionState, useState } from "react";
import { connectStoreAction } from "@/lib/actions/store-connections";
import { Field } from "@/components/auth-field";

type Platform = "shopify" | "woocommerce" | "bigcommerce" | "magento";

const PLATFORM_FIELDS: Record<Platform, { name: string; label: string }[]> = {
  shopify: [
    { name: "shop_domain", label: "Shop domain" },
    { name: "access_token", label: "Admin API access token" },
  ],
  woocommerce: [
    { name: "site_url", label: "Site URL" },
    { name: "consumer_key", label: "Consumer key" },
    { name: "consumer_secret", label: "Consumer secret" },
  ],
  bigcommerce: [
    { name: "store_hash", label: "Store hash" },
    { name: "client_id", label: "Client ID" },
    { name: "access_token", label: "Access token" },
  ],
  magento: [
    { name: "base_url", label: "Base URL" },
    { name: "access_token", label: "Integration access token" },
  ],
};

export function ConnectStoreForm({ merchantId, merchantSlug }: { merchantId: number; merchantSlug: string }) {
  const [platform, setPlatform] = useState<Platform>("shopify");
  const [state, formAction, pending] = useActionState(connectStoreAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="merchant_id" value={merchantId} />
      <input type="hidden" name="merchant_slug" value={merchantSlug} />

      <div>
        <label htmlFor="platform" className="block text-sm font-medium text-ink">
          Platform
        </label>
        <select
          id="platform"
          name="platform"
          value={platform}
          onChange={(event) => setPlatform(event.target.value as Platform)}
          className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent"
        >
          <option value="shopify">Shopify</option>
          <option value="woocommerce">WooCommerce</option>
          <option value="bigcommerce">BigCommerce</option>
          <option value="magento">Magento 2</option>
        </select>
      </div>

      {PLATFORM_FIELDS[platform].map((field) => (
        <Field
          key={field.name}
          label={field.label}
          name={field.name}
          type="text"
          autoComplete="off"
          error={state?.fieldErrors?.[`credentials.${field.name}`]}
        />
      ))}

      {platform === "magento" && (
        <label className="flex items-start gap-2 text-sm text-ink-muted">
          <input type="checkbox" name="verify_ssl" value="true" defaultChecked className="mt-0.5 accent-accent" />
          <span>
            Verify SSL certificate
            <span className="mt-0.5 block text-xs">
              Uncheck only for a local install on a self-signed cert (e.g. Laragon) — never for a real deployment.
            </span>
          </span>
        </label>
      )}

      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
      >
        {pending ? "Connecting…" : "Connect store"}
      </button>
    </form>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";

export type ConnectStoreFormState = { error?: string; fieldErrors?: Record<string, string[]> } | undefined;

/**
 * Mirrors ConnectStoreRequest::credentialRules() on the backend — same
 * three platforms, same field names per platform. Keep these two in sync;
 * see the same note in ConnectStoreRequest itself.
 */
const PLATFORM_CREDENTIAL_FIELDS: Record<string, string[]> = {
  shopify: ["shop_domain", "access_token"],
  woocommerce: ["site_url", "consumer_key", "consumer_secret"],
  bigcommerce: ["store_hash", "client_id", "access_token"],
  magento: ["base_url", "access_token"],
};

export async function connectStoreAction(
  _prevState: ConnectStoreFormState,
  formData: FormData,
): Promise<ConnectStoreFormState> {
  const merchantId = String(formData.get("merchant_id") ?? "");
  const merchantSlug = String(formData.get("merchant_slug") ?? "");
  const platform = String(formData.get("platform") ?? "");

  const fields = PLATFORM_CREDENTIAL_FIELDS[platform];
  if (!fields) {
    return { error: "Unknown platform." };
  }

  const credentials: Record<string, string | boolean> = {};
  for (const field of fields) {
    credentials[field] = String(formData.get(field) ?? "");
  }

  // Checkboxes are absent from FormData entirely when unchecked — there's
  // no unchecked value to read, only presence or absence of the key.
  if (platform === "magento") {
    credentials.verify_ssl = formData.get("verify_ssl") !== null;
  }

  try {
    await apiFetch(`/merchants/${merchantId}/store-connections`, {
      method: "POST",
      body: JSON.stringify({ platform, credentials }),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message, fieldErrors: error.errors };
    }
    throw error;
  }

  revalidatePath(`/dashboard/${merchantSlug}`);
}

export async function disconnectStoreAction(formData: FormData): Promise<void> {
  const merchantId = String(formData.get("merchant_id") ?? "");
  const merchantSlug = String(formData.get("merchant_slug") ?? "");
  const connectionId = String(formData.get("connection_id") ?? "");

  await apiFetch(`/merchants/${merchantId}/store-connections/${connectionId}`, { method: "DELETE" });

  revalidatePath(`/dashboard/${merchantSlug}`);
}

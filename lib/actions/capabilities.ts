"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function toggleCapabilityAction(formData: FormData): Promise<void> {
  const merchantId = String(formData.get("merchant_id") ?? "");
  const merchantSlug = String(formData.get("merchant_slug") ?? "");
  const capabilityConfigId = String(formData.get("capability_config_id") ?? "");
  const currentlyEnabled = formData.get("enabled") === "true";

  await apiFetch(`/merchants/${merchantId}/capabilities/${capabilityConfigId}`, {
    method: "PATCH",
    body: JSON.stringify({ enabled: !currentlyEnabled }),
  });

  revalidatePath(`/dashboard/${merchantSlug}`);
}

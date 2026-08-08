"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";

export type IssueCredentialFormState = { error?: string; token?: string } | undefined;

export async function issueCredentialAction(
  _prevState: IssueCredentialFormState,
  formData: FormData,
): Promise<IssueCredentialFormState> {
  const merchantId = String(formData.get("merchant_id") ?? "");
  const merchantSlug = String(formData.get("merchant_slug") ?? "");
  const agentPlatform = String(formData.get("agent_platform") ?? "");
  const scopes = formData.getAll("scopes").map(String);

  if (scopes.length === 0) {
    return { error: "Select at least one scope." };
  }

  let result: { token: string };
  try {
    result = await apiFetch<{ token: string }>(`/merchants/${merchantId}/agent-credentials`, {
      method: "POST",
      body: JSON.stringify({ agent_platform: agentPlatform, scopes }),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath(`/dashboard/${merchantSlug}`);

  return { token: result.token };
}

export async function revokeCredentialAction(formData: FormData): Promise<void> {
  const merchantId = String(formData.get("merchant_id") ?? "");
  const merchantSlug = String(formData.get("merchant_slug") ?? "");
  const credentialId = String(formData.get("credential_id") ?? "");

  await apiFetch(`/merchants/${merchantId}/agent-credentials/${credentialId}`, { method: "DELETE" });

  revalidatePath(`/dashboard/${merchantSlug}`);
}

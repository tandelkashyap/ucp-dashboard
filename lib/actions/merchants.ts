"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";

export type MerchantFormState = { error?: string } | undefined;

export async function createMerchantAction(
  _prevState: MerchantFormState,
  formData: FormData,
): Promise<MerchantFormState> {
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "Name is required." };
  }

  try {
    await apiFetch("/merchants", { method: "POST", body: JSON.stringify({ name }) });
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/dashboard");
}

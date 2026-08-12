import type { EnquiryFormPayload } from "@/lib/types";

const MOCK_DELAY_MS = 900;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// TODO: replace with a real backend call (REST/GraphQL endpoint or server action)
// that persists the enquiry and triggers the advisor notification workflow.
export async function submitForm(
  payload: EnquiryFormPayload
): Promise<{ success: boolean }> {
  await delay(MOCK_DELAY_MS);
  console.info("[submitForm:stub] payload", payload);
  return { success: true };
}

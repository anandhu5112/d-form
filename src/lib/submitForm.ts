import type { EnquiryFormPayload } from "@/lib/types";

const ENQUIRIES_API_URL =
  process.env.NEXT_PUBLIC_ENQUIRIES_API_URL ||
  "https://aswinonfinance.com/api/enquiries";

interface SubmitFormResponse {
  success?: boolean;
  enquiryId?: number | null;
  leadId?: number | null;
  leadTag?: string;
  sheetSync?: {
    status?: string;
    updatedRange?: string | null;
    reason?: string;
    error?: string;
  };
  error?: string;
}

function createAttemptId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `inbound-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function submitForm(
  payload: EnquiryFormPayload
): Promise<SubmitFormResponse> {
  const response = await fetch(ENQUIRIES_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      attempt_id: createAttemptId(),
    }),
  });
  const body = (await response.json().catch(() => ({}))) as SubmitFormResponse;

  if (!response.ok || !body.success) {
    throw new Error(body.error || "Failed to submit enquiry.");
  }

  return body;
}

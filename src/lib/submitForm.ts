import type { EnquiryFormPayload } from "@/lib/types";

const ENQUIRIES_API_URL =
  process.env.NEXT_PUBLIC_ENQUIRIES_API_URL ||
  "https://aswinonfinance.com/api/enquiries";

/** The server answers within ~8s even when its database stalls. */
const ATTEMPT_TIMEOUT_MS = 15_000;
const RETRY_DELAYS_MS = [1_000, 3_000];

interface EnquiryResponseBody {
  success?: boolean;
  submissionId?: string;
  enquiryId?: number | null;
  replayed?: boolean;
  conflict?: boolean;
  error?: string;
  code?: string;
  retryable?: boolean;
}

export interface SubmitResult {
  submissionId: string;
  enquiryId: number | null;
  replayed: boolean;
  /** An earlier version of these answers had already been saved. */
  conflict: boolean;
}

export class SubmitError extends Error {
  /** true: the enquiry may or may not have been saved; retrying is safe. */
  readonly retryable: boolean;
  readonly code: string | undefined;

  constructor(message: string, retryable: boolean, code?: string) {
    super(message);
    this.name = "SubmitError";
    this.retryable = retryable;
    this.code = code;
  }
}

export function createSubmissionId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // RFC 4122 v4 from getRandomValues for older WebViews without randomUUID.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

interface SubmitOptions {
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  timeoutMs?: number;
  retryDelaysMs?: number[];
  url?: string;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function fetchWithTimeout(fetchImpl: typeof fetch, url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Sends the enquiry, retrying transient failures (network loss, timeouts, 429,
 * 5xx) with the SAME submission id. The server stores one lead per id, so a
 * retry after a response that was lost in transit returns the saved enquiry
 * instead of creating a second one.
 */
export async function submitEnquiry(
  payload: EnquiryFormPayload,
  {
    fetchImpl = fetch,
    sleep = defaultSleep,
    timeoutMs = ATTEMPT_TIMEOUT_MS,
    retryDelaysMs = RETRY_DELAYS_MS,
    url = ENQUIRIES_API_URL,
  }: SubmitOptions = {}
): Promise<SubmitResult> {
  const body = JSON.stringify(payload);

  for (let attempt = 0; ; attempt += 1) {
    let response: Response | null = null;
    try {
      response = await fetchWithTimeout(
        fetchImpl,
        url,
        { method: "POST", headers: { "Content-Type": "application/json" }, body },
        timeoutMs
      );
    } catch {
      response = null; // offline, DNS, aborted by our timeout
    }

    if (response) {
      const data = (await response.json().catch(() => ({}))) as EnquiryResponseBody;
      if (response.ok && data.success) {
        return {
          submissionId: data.submissionId ?? payload.submissionId,
          enquiryId: data.enquiryId ?? null,
          replayed: Boolean(data.replayed),
          conflict: Boolean(data.conflict),
        };
      }
      const transient = response.status === 408 || response.status === 429 || response.status >= 500;
      if (!transient) {
        // The server looked at the answers and said no; retrying won't help.
        throw new SubmitError(
          data.error || "Please check your answers and try again.",
          false,
          data.code
        );
      }
    }

    if (attempt >= retryDelaysMs.length) break;
    await sleep(retryDelaysMs[attempt] + Math.floor(Math.random() * 250));
  }

  throw new SubmitError(
    "We couldn't confirm that your details were sent. Your answers are saved on this device — tap Finish to try again. You won't be registered twice.",
    true,
    "unconfirmed"
  );
}

export type SubmissionStatus = "accepted" | "not_found" | "unknown";

/** Asks the server whether an enquiry with this id was saved. */
export async function getSubmissionStatus(
  submissionId: string,
  { fetchImpl = fetch, timeoutMs = 8_000, url = ENQUIRIES_API_URL }: SubmitOptions = {}
): Promise<SubmissionStatus> {
  try {
    const response = await fetchWithTimeout(
      fetchImpl,
      `${url}?submissionId=${encodeURIComponent(submissionId)}`,
      { method: "GET" },
      timeoutMs
    );
    if (response.status === 404) return "not_found";
    if (!response.ok) return "unknown";
    const data = (await response.json().catch(() => ({}))) as { status?: string };
    return data.status === "accepted" ? "accepted" : "unknown";
  } catch {
    return "unknown";
  }
}

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SubmitError, createSubmissionId, getSubmissionStatus, submitEnquiry } from "@/lib/submitForm";
import type { EnquiryFormPayload } from "@/lib/types";

const payload: EnquiryFormPayload = {
  submissionId: "0b9f3c6e-4f64-4f8e-9d7c-2d9d0c1f5a11",
  identity: { name: "Priya Raman", countryCode: "AE", countryOther: null },
  phone: { countryCode: "IN", dialCode: "+91", number: "9876543210" },
  financials: {
    profession: "salaried",
    incomeBracketId: "inr-12l-24l",
    accountStatus: "NRO",
    panStatus: "have-it",
    addressProofs: ["utility-bill"],
  },
  submittedAt: "2026-09-25T10:00:00.000Z",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function scripted(steps: Array<(init: RequestInit) => Promise<Response> | Response>) {
  const bodies: string[] = [];
  const fetchImpl = (async (_url: string, init: RequestInit) => {
    bodies.push(String(init.body));
    const step = steps[bodies.length - 1];
    if (!step) throw new Error("unexpected extra request");
    return step(init);
  }) as unknown as typeof fetch;
  return { fetchImpl, bodies };
}

const noSleep = async () => {};
const ok = () => json({ success: true, submissionId: payload.submissionId, enquiryId: 42, replayed: false });

describe("submitEnquiry", () => {
  it("retries network failures with the same body and submission id", async () => {
    const { fetchImpl, bodies } = scripted([
      () => Promise.reject(new TypeError("Failed to fetch")),
      () => json({ error: "db", retryable: true }, 503),
      ok,
    ]);
    const result = await submitEnquiry(payload, { fetchImpl, sleep: noSleep });
    assert.equal(result.enquiryId, 42);
    assert.equal(bodies.length, 3);
    assert.equal(new Set(bodies).size, 1, "every attempt sends the identical payload");
    assert.equal(JSON.parse(bodies[0]).submissionId, payload.submissionId);
  });

  it("aborts a stalled attempt and retries (response lost)", async () => {
    const { fetchImpl, bodies } = scripted([
      (init) =>
        new Promise((_, reject) =>
          init.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")))
        ),
      () => json({ success: true, submissionId: payload.submissionId, enquiryId: 42, replayed: true }),
    ]);
    const result = await submitEnquiry(payload, { fetchImpl, sleep: noSleep, timeoutMs: 20 });
    assert.equal(result.replayed, true);
    assert.equal(bodies.length, 2);
  });

  it("does not retry a validation rejection", async () => {
    const { fetchImpl, bodies } = scripted([
      () => json({ error: "Enter a valid WhatsApp number for the selected country.", code: "phone_invalid" }, 400),
    ]);
    await assert.rejects(submitEnquiry(payload, { fetchImpl, sleep: noSleep }), (error: unknown) => {
      assert.ok(error instanceof SubmitError);
      assert.equal(error.retryable, false);
      assert.equal(error.code, "phone_invalid");
      return true;
    });
    assert.equal(bodies.length, 1);
  });

  it("gives up after three transient failures with a retryable error", async () => {
    const { fetchImpl, bodies } = scripted([
      () => json({}, 503),
      () => json({}, 429),
      () => json({}, 502),
    ]);
    await assert.rejects(submitEnquiry(payload, { fetchImpl, sleep: noSleep }), (error: unknown) => {
      assert.ok(error instanceof SubmitError);
      assert.equal(error.retryable, true);
      assert.match(error.message, /won't be registered twice/);
      return true;
    });
    assert.equal(bodies.length, 3);
  });

  it("surfaces a conflicting replay as accepted", async () => {
    const { fetchImpl } = scripted([
      () => json({ success: true, submissionId: payload.submissionId, enquiryId: 42, replayed: true, conflict: true }),
    ]);
    const result = await submitEnquiry(payload, { fetchImpl, sleep: noSleep });
    assert.equal(result.conflict, true);
  });
});

describe("getSubmissionStatus", () => {
  it("maps server answers", async () => {
    const accepted = scripted([() => json({ status: "accepted", enquiryId: 42 })]);
    assert.equal(await getSubmissionStatus(payload.submissionId, { fetchImpl: accepted.fetchImpl }), "accepted");
    const missing = scripted([() => json({ status: "not_found" }, 404)]);
    assert.equal(await getSubmissionStatus(payload.submissionId, { fetchImpl: missing.fetchImpl }), "not_found");
    const down = scripted([() => Promise.reject(new TypeError("offline"))]);
    assert.equal(await getSubmissionStatus(payload.submissionId, { fetchImpl: down.fetchImpl }), "unknown");
  });
});

describe("createSubmissionId", () => {
  it("creates v4 UUIDs the server accepts", () => {
    assert.match(createSubmissionId(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});

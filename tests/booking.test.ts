import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formReducer, initialFormState, type FormAction, type FormState } from "@/components/form/formState";
import { findCountry } from "@/lib/countries";
import { buildBookingUrl } from "@/lib/booking";

const BASE = "https://cal.com/vinayak-nair/30min";
const SUBMISSION_ID = "0b9f3c6e-4f64-4f8e-9d7c-2d9d0c1f5a11";

function run(...actions: FormAction[]): FormState {
  return actions.reduce(formReducer, initialFormState);
}

function submitted(): FormState {
  return run(
    { type: "SET_COUNTRY", value: findCountry("AE")! },
    { type: "SET_NAME", value: "  Priya Raman " },
    { type: "SET_PHONE_COUNTRY", value: "IN" },
    { type: "SET_PHONE_NUMBER", value: "98765 43210" },
    { type: "SUBMITTING", submissionId: SUBMISSION_ID, attemptAt: "2026-09-30T10:00:00.000Z" },
    { type: "SUBMITTED" }
  );
}

describe("buildBookingUrl", () => {
  it("prefills the name and WhatsApp number and tags the booking with the enquiry", () => {
    const url = new URL(buildBookingUrl(submitted(), BASE));
    assert.equal(url.origin + url.pathname, BASE);
    assert.equal(url.searchParams.get("name"), "Priya Raman");
    assert.equal(url.searchParams.get("attendeePhoneNumber"), "+919876543210");
    assert.equal(url.searchParams.get("metadata[submissionId]"), SUBMISSION_ID);
    assert.equal(url.searchParams.get("metadata[source]"), "nri-form");
  });

  it("leaves out what it does not know instead of sending blanks", () => {
    const url = new URL(buildBookingUrl(run({ type: "SET_PHONE_NUMBER", value: "12" }), BASE));
    assert.equal(url.searchParams.has("name"), false);
    assert.equal(url.searchParams.has("attendeePhoneNumber"), false);
    assert.equal(url.searchParams.has("metadata[submissionId]"), false);
    assert.equal(url.searchParams.get("metadata[source]"), "nri-form");
  });
});

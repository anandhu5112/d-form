import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formReducer,
  initialFormState,
  isStep1Valid,
  isStep2Valid,
  type FormAction,
  type FormState,
} from "@/components/form/formState";
import { OTHER_RESIDENCE, findCountry } from "@/lib/countries";
import { detectInternationalNumber } from "@/lib/phone";
import { DRAFT_KEY, DRAFT_TTL_MS, clearDraft, loadDraft, saveDraft } from "@/lib/draft";

function run(...actions: FormAction[]): FormState {
  return actions.reduce(formReducer, initialFormState);
}

function memoryStore() {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
  };
}

const UAE = findCountry("AE")!;
const UK = findCountry("GB")!;
const SUBMISSION_ID = "0b9f3c6e-4f64-4f8e-9d7c-2d9d0c1f5a11";

function completed(): FormState {
  return run(
    { type: "SET_COUNTRY", value: UAE },
    { type: "SET_NAME", value: "Priya Raman" },
    { type: "SET_PHONE_COUNTRY", value: "IN" },
    { type: "SET_PHONE_NUMBER", value: "98765 43210" },
    { type: "SET_PROFESSION", value: "salaried" },
    { type: "SET_INCOME_BRACKET", value: "inr-12l-24l" },
    { type: "SET_ACCOUNT_STATUS", value: "NRO" },
    { type: "SET_PAN_STATUS", value: "have-it" },
    { type: "TOGGLE_ADDRESS_PROOF", value: "utility-bill" },
    { type: "SET_STEP", step: 4 }
  );
}

describe("formReducer", () => {
  it("requires an actual country selection for step 1", () => {
    assert.equal(isStep1Valid(initialFormState), false);
    assert.equal(isStep1Valid(run({ type: "SET_COUNTRY", value: UK })), true);
  });

  it("WhatsApp country follows residence until the user picks one", () => {
    const followed = run({ type: "SET_COUNTRY", value: UK });
    assert.equal(followed.phone.countryCode, "GB");

    const picked = run(
      { type: "SET_COUNTRY", value: UAE },
      { type: "SET_PHONE_COUNTRY", value: "IN" },
      { type: "SET_COUNTRY", value: UK }
    );
    assert.equal(picked.identity.country.code, "GB");
    assert.equal(picked.phone.countryCode, "IN", "a deliberate WhatsApp country is kept");
  });

  it("step 2 rejects invalid numbers and accepts valid ones", () => {
    const base = run({ type: "SET_COUNTRY", value: UAE }, { type: "SET_NAME", value: "QA TEST" });
    assert.equal(isStep2Valid(formReducer(base, { type: "SET_PHONE_NUMBER", value: "1    2" })), false);
    assert.equal(isStep2Valid(formReducer(base, { type: "SET_PHONE_NUMBER", value: "050 123 4567" })), true);
    assert.equal(
      isStep2Valid(formReducer(base, { type: "SET_PHONE", countryCode: "GB", number: "7400123456" })),
      true
    );
  });

  it("step 2 rejects names without letters", () => {
    const state = run(
      { type: "SET_COUNTRY", value: UAE },
      { type: "SET_NAME", value: "12" },
      { type: "SET_PHONE_NUMBER", value: "050 123 4567" }
    );
    assert.equal(isStep2Valid(state), false);
  });

  it('"Other" residence: no pre-filled WhatsApp code, INR bands, code required on step 2', () => {
    const state = run(
      { type: "SET_COUNTRY", value: UAE },
      { type: "SET_COUNTRY", value: OTHER_RESIDENCE },
      { type: "SET_NAME", value: "Elsewhere Resident" },
      { type: "SET_PHONE_NUMBER", value: "079 123 45 67" }
    );
    assert.equal(isStep1Valid(state), true);
    assert.equal(state.identity.country.currency, "INR");
    assert.equal(state.phone.countryCode, "", "the UAE default must not carry over");
    assert.equal(isStep2Valid(state), false);
    assert.equal(isStep2Valid(formReducer(state, { type: "SET_PHONE_COUNTRY", value: "CH" })), true);
  });

  it('"Other" residence: a pasted international number picks the code', () => {
    const state = run({ type: "SET_COUNTRY", value: OTHER_RESIDENCE });
    const detected = detectInternationalNumber("+41 79 123 45 67", state.phone.countryCode)!;
    const next = formReducer(state, { type: "SET_PHONE", countryCode: detected.countryCode, number: detected.nationalNumber });
    assert.equal(next.phone.countryCode, "CH");
  });

  it("keeps the submission id across failed attempts", () => {
    let state = formReducer(completed(), { type: "SUBMITTING", submissionId: SUBMISSION_ID, attemptAt: "t1" });
    state = formReducer(state, { type: "SUBMIT_ERROR", error: "offline" });
    state = formReducer(state, { type: "SUBMITTING", submissionId: state.submissionId!, attemptAt: "t2" });
    assert.equal(state.submissionId, SUBMISSION_ID);
    assert.equal(state.firstAttemptAt, "t1");
    assert.equal(state.submitting, true);
    assert.equal(state.submitError, null);
  });

  it("'none' and documents stay mutually exclusive", () => {
    const state = run(
      { type: "TOGGLE_ADDRESS_PROOF", value: "utility-bill" },
      { type: "TOGGLE_ADDRESS_PROOF", value: "none" }
    );
    assert.deepEqual(state.financials.addressProofs, ["none"]);
    assert.deepEqual(
      formReducer(state, { type: "TOGGLE_ADDRESS_PROOF", value: "residence-permit" }).financials.addressProofs,
      ["residence-permit"]
    );
  });
});

describe("draft persistence (QA finding 8)", () => {
  it("round-trips every answer and the submission id", () => {
    const store = memoryStore();
    const state = { ...completed(), submissionId: SUBMISSION_ID, firstAttemptAt: "2026-09-25T10:00:00.000Z" };
    saveDraft(state, { store, now: 1_000 });

    const loaded = loadDraft({ store, now: 2_000 })!;
    assert.equal(loaded.pending, false);
    assert.equal(loaded.state.restored, true);
    assert.equal(loaded.state.step, 4);
    assert.equal(loaded.state.identity.country.code, "AE");
    assert.equal(loaded.state.identity.name, "Priya Raman");
    assert.equal(loaded.state.phone.countryCode, "IN");
    assert.equal(loaded.state.phone.countryTouched, true);
    assert.equal(loaded.state.phone.number, "98765 43210");
    assert.deepEqual(loaded.state.financials, state.financials);
    assert.equal(loaded.state.submissionId, SUBMISSION_ID);
  });

  it('restores an "Other" residence without inventing a WhatsApp code', () => {
    const store = memoryStore();
    saveDraft(run({ type: "SET_COUNTRY", value: OTHER_RESIDENCE }, { type: "SET_NAME", value: "Elsewhere" }), { store });
    const loaded = loadDraft({ store })!;
    assert.equal(loaded.state.identity.country.code, "OTHER");
    assert.equal(loaded.state.identity.countrySelected, true);
    assert.equal(loaded.state.phone.countryCode, "");
  });

  it("expires after the TTL and removes itself", () => {
    const store = memoryStore();
    saveDraft(completed(), { store, now: 0 });
    assert.equal(loadDraft({ store, now: DRAFT_TTL_MS + 1 }), null);
    assert.equal(store.map.has(DRAFT_KEY), false);
  });

  it("does not store anything before the user has answered", () => {
    const store = memoryStore();
    saveDraft(initialFormState, { store });
    assert.equal(store.map.size, 0);
  });

  it("is cleared once the enquiry is confirmed", () => {
    const store = memoryStore();
    saveDraft(completed(), { store });
    saveDraft({ ...completed(), submitted: true }, { store });
    assert.equal(store.map.has(DRAFT_KEY), false);
    saveDraft(completed(), { store });
    clearDraft(store);
    assert.equal(store.map.has(DRAFT_KEY), false);
  });

  it("remembers that a submission was in flight", () => {
    const store = memoryStore();
    saveDraft({ ...completed(), submissionId: SUBMISSION_ID }, { store, pending: true });
    assert.equal(loadDraft({ store })!.pending, true);
  });

  it("never lands on a step whose earlier answers are invalid", () => {
    const store = memoryStore();
    const state = { ...completed(), phone: { ...completed().phone, number: "1    2" } };
    saveDraft(state, { store });
    assert.equal(loadDraft({ store })!.state.step, 2);
  });

  it("discards tampered or corrupt data", () => {
    const store = memoryStore();
    store.setItem(DRAFT_KEY, "{not json");
    assert.equal(loadDraft({ store }), null);

    store.setItem(
      DRAFT_KEY,
      JSON.stringify({
        v: 1,
        expiresAt: Date.now() + 1000,
        step: 9,
        countryCode: "XX",
        name: "Sam",
        phoneCountryCode: "AE",
        phoneNumber: "050 123 4567",
        financials: { profession: "astronaut", addressProofs: ["none", "utility-bill", "passport"] },
        submissionId: "not-a-uuid",
      })
    );
    const loaded = loadDraft({ store })!;
    assert.equal(loaded.state.identity.countrySelected, false);
    assert.equal(loaded.state.step, 1);
    assert.equal(loaded.state.financials.profession, null);
    assert.deepEqual(loaded.state.financials.addressProofs, ["none"]);
    assert.equal(loaded.state.submissionId, null);
  });
});

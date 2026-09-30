import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formReducer, initialFormState, isStep2Valid, type FormAction, type FormState } from "@/components/form/formState";
import { OTHER_RESIDENCE, findCountry } from "@/lib/countries";
import { hasProgress } from "@/lib/draft";
import { readPrefilledPhone, withoutPrefillParam } from "@/lib/prefill";

function run(...actions: FormAction[]): FormState {
  return actions.reduce(formReducer, initialFormState);
}

describe("readPrefilledPhone", () => {
  it("splits the number from the link into country code and national digits", () => {
    assert.deepEqual(readPrefilledPhone("?wa=447554468088"), { countryCode: "GB", number: "7554468088" });
    assert.deepEqual(readPrefilledPhone("?wa=971505697397"), { countryCode: "AE", number: "505697397" });
    assert.deepEqual(readPrefilledPhone("?wa=919947263908"), { countryCode: "IN", number: "9947263908" });
    assert.equal(readPrefilledPhone("?wa=14374281111")?.countryCode, "CA");
  });

  it("tolerates a leading +, spaces and dashes", () => {
    // An unencoded "+" becomes a space in a query string.
    assert.deepEqual(readPrefilledPhone("?wa=+44 7554-468088"), { countryCode: "GB", number: "7554468088" });
    assert.deepEqual(readPrefilledPhone("?wa=%2B447554468088"), { countryCode: "GB", number: "7554468088" });
  });

  it("ignores missing, short or invalid numbers", () => {
    assert.equal(readPrefilledPhone(""), null);
    assert.equal(readPrefilledPhone("?wa="), null);
    assert.equal(readPrefilledPhone("?wa=12345"), null);
    assert.equal(readPrefilledPhone("?wa=999999999999"), null);
    assert.equal(readPrefilledPhone("?utm_source=whatsapp"), null);
  });

  it("drops only the number from the URL", () => {
    assert.equal(
      withoutPrefillParam("https://nri.aswinonfinance.com/?wa=447554468088&utm_source=whatsapp"),
      "https://nri.aswinonfinance.com/?utm_source=whatsapp"
    );
  });
});

describe("PREFILL_PHONE", () => {
  const prefill: FormAction = { type: "PREFILL_PHONE", countryCode: "GB", number: "7554468088" };

  it("fills a valid WhatsApp number and marks it as prefilled", () => {
    const state = run(prefill, { type: "SET_NAME", value: "Mohamed" });
    assert.equal(state.phonePrefilled, true);
    assert.equal(isStep2Valid(state), true);
  });

  it("keeps the number's code when the residence country is chosen later", () => {
    assert.equal(run(prefill, { type: "SET_COUNTRY", value: findCountry("AE")! }).phone.countryCode, "GB");
    assert.equal(run(prefill, { type: "SET_COUNTRY", value: OTHER_RESIDENCE }).phone.countryCode, "GB");
  });

  it("stops being prefilled as soon as the person edits the number or code", () => {
    assert.equal(run(prefill, { type: "SET_PHONE_NUMBER", value: "7554468089" }).phonePrefilled, false);
    assert.equal(run(prefill, { type: "SET_PHONE_COUNTRY", value: "IN" }).phonePrefilled, false);
  });

  it("does not create a draft on its own", () => {
    assert.equal(hasProgress(run(prefill)), false);
    assert.equal(hasProgress(run(prefill, { type: "SET_NAME", value: "Mohamed" })), true);
  });
});

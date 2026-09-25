import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { COUNTRIES, findCountry, QUICK_SELECT_COUNTRIES } from "@/lib/countries";
import { checkPhone, detectInternationalNumber, dialCodeFor, sanitizePhoneInput } from "@/lib/phone";

describe("countries", () => {
  it("offers every country, including ones the old list lacked (QA finding 3)", () => {
    assert.ok(COUNTRIES.length > 200);
    assert.equal(findCountry("CH")?.name, "Switzerland");
    assert.equal(findCountry("CH")?.dialCode, "+41");
    assert.equal(findCountry("XX"), undefined);
  });

  it("keeps quick-select chips and their short names", () => {
    assert.deepEqual(
      QUICK_SELECT_COUNTRIES.map((c) => c.shortName),
      ["UAE", "Germany", "UK", "USA", "Canada", "Netherlands"]
    );
  });

  it("maps currencies consistently with the backend band labels", () => {
    assert.equal(findCountry("AE")?.currency, "AED");
    assert.equal(findCountry("IT")?.currency, "EUR");
    assert.equal(findCountry("CH")?.currency, "INR"); // no dedicated view: Indian-standard bands
  });
});

describe("checkPhone", () => {
  const valid: Array<[string, string, string]> = [
    ["AE", "050 123 4567", "+971501234567"],
    ["AE", "50 123 4567", "+971501234567"],
    ["GB", "07400 123456", "+447400123456"],
    ["GB", "44 7400 123456", "+447400123456"],
    ["IN", "98765 43210", "+919876543210"],
    ["US", "(212) 555-0123", "+12125550123"],
    ["IT", "06 1234 5678", "+390612345678"],
  ];
  for (const [country, raw, e164] of valid) {
    it(`accepts ${raw} for ${country}`, () => {
      const result = checkPhone(raw, country);
      assert.equal(result.status, "valid");
      assert.equal(result.status === "valid" && result.e164, e164);
    });
  }

  it('rejects "1    2" (QA finding 4)', () => {
    assert.deepEqual(checkPhone("1    2", "AE"), { status: "invalid", reason: "number" });
  });

  it("rejects letters", () => {
    assert.deepEqual(checkPhone("abcdef", "AE"), { status: "invalid", reason: "characters" });
  });

  it("flags a pasted number from another country as a mismatch", () => {
    const result = checkPhone("+44 7400 123456", "AE");
    assert.equal(result.status, "mismatch");
  });

  it("reports a missing WhatsApp country separately", () => {
    assert.deepEqual(checkPhone("079 123 45 67", ""), { status: "invalid", reason: "country" });
  });

  it("treats blank as empty", () => {
    assert.deepEqual(checkPhone("   ", "AE"), { status: "empty" });
  });
});

describe("detectInternationalNumber", () => {
  it("moves a pasted +44 number to the UK code (QA finding 4)", () => {
    assert.deepEqual(detectInternationalNumber("+44 7400 123456", "AE"), {
      countryCode: "GB",
      nationalNumber: "7400123456",
    });
  });

  it("understands the 00 international prefix", () => {
    assert.deepEqual(detectInternationalNumber("0091 98765 43210", "AE"), {
      countryCode: "IN",
      nationalNumber: "9876543210",
    });
  });

  it("keeps the chosen country when it shares the calling code", () => {
    assert.equal(detectInternationalNumber("+1 212 555 0123", "CA")?.countryCode, "CA");
  });

  it("waits until the number is complete", () => {
    assert.equal(detectInternationalNumber("+44 7400", "AE"), null);
  });

  it("ignores national input", () => {
    assert.equal(detectInternationalNumber("050 123 4567", "AE"), null);
  });
});

describe("sanitizePhoneInput / dialCodeFor", () => {
  it("drops letters and stray plus signs but keeps readable punctuation", () => {
    assert.equal(sanitizePhoneInput("+44 (0)7400-123 456 ext"), "+44 (0)7400-123 456 ");
    assert.equal(sanitizePhoneInput("50+123"), "50123");
  });

  it("derives dial codes", () => {
    assert.equal(dialCodeFor("AE"), "+971");
    assert.equal(dialCodeFor("ZZ"), "");
  });
});

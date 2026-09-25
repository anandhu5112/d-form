/**
 * WhatsApp number handling in the browser. Mirrors functions/_lib/phone.js in
 * the parent repo (the server re-validates everything); both use
 * libphonenumber's `max` metadata so a number is checked against the real
 * numbering plan, not just its length.
 */
import {
  getCountryCallingCode,
  isSupportedCountry,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/max";

export type PhoneCheck =
  | { status: "empty" }
  | { status: "invalid"; reason: "characters" | "number" }
  | { status: "mismatch"; detectedCountry: string | null }
  | { status: "valid"; e164: string; nationalNumber: string };

const ALLOWED = /^[+\d\s().\- ]*$/;

function asCountry(code: string): CountryCode | undefined {
  return isSupportedCountry(code) ? (code as CountryCode) : undefined;
}

function compact(raw: string) {
  const stripped = raw.replace(/[\s().\- ]/g, "");
  return stripped.startsWith("00") ? `+${stripped.slice(2)}` : stripped;
}

/** Keeps what people type or paste readable while dropping letters and emoji. */
export function sanitizePhoneInput(raw: string) {
  const kept = raw.replace(/[^+\d\s().\-]/g, "");
  // A "+" only means something at the very start.
  return kept.replace(/(?!^)\+/g, "");
}

/**
 * If `raw` is written internationally ("+44 …" or "0044 …") and names a known
 * country, returns that country and the national digits, so the calling-code
 * selector can follow the paste instead of keeping a stale prefix.
 */
export function detectInternationalNumber(
  raw: string,
  currentCountry: string
): { countryCode: string; nationalNumber: string } | null {
  const candidate = compact(raw);
  if (!candidate.startsWith("+")) return null;
  const parsed = parsePhoneNumberFromString(candidate);
  if (!parsed || !parsed.isValid()) return null;
  // Keep the user's pick when it shares the calling code (+1 US/CA, +44 GB/GG…).
  const current = asCountry(currentCountry);
  const sameCode = current && getCountryCallingCode(current) === parsed.countryCallingCode;
  const countryCode = sameCode ? currentCountry : parsed.country;
  if (!countryCode) return null;
  return { countryCode, nationalNumber: parsed.nationalNumber };
}

export function checkPhone(raw: string, countryCode: string): PhoneCheck {
  const trimmed = raw.trim();
  if (!trimmed) return { status: "empty" };
  if (!ALLOWED.test(trimmed)) return { status: "invalid", reason: "characters" };

  const country = asCountry(countryCode);
  if (!country) return { status: "invalid", reason: "number" };

  const candidate = compact(trimmed);
  if (candidate.indexOf("+", 1) !== -1) return { status: "invalid", reason: "characters" };

  const parsed = candidate.startsWith("+")
    ? parsePhoneNumberFromString(candidate)
    : parsePhoneNumberFromString(candidate, country);
  if (!parsed || !parsed.isValid()) return { status: "invalid", reason: "number" };

  if (parsed.countryCallingCode !== getCountryCallingCode(country)) {
    return { status: "mismatch", detectedCountry: parsed.country ?? null };
  }

  return { status: "valid", e164: parsed.number, nationalNumber: parsed.nationalNumber };
}

export function dialCodeFor(countryCode: string) {
  const country = asCountry(countryCode);
  return country ? `+${getCountryCallingCode(country)}` : "";
}

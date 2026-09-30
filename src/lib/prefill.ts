import { detectInternationalNumber } from "@/lib/phone";

/**
 * Links sent on WhatsApp carry the number the person is chatting from, e.g.
 * nri.aswinonfinance.com/?wa=447554468088, so they don't have to type it.
 */
export const PREFILL_PHONE_PARAM = "wa";

/** The WhatsApp number in the link, split for the form, or null if absent or not a real number. */
export function readPrefilledPhone(search: string): { countryCode: string; number: string } | null {
  const raw = new URLSearchParams(search).get(PREFILL_PHONE_PARAM);
  if (!raw) return null;
  // Digits only: a "+" in a query string arrives as a space, and people paste spaces or dashes.
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return null;
  const detected = detectInternationalNumber(`+${digits}`, "");
  return detected ? { countryCode: detected.countryCode, number: detected.nationalNumber } : null;
}

/** The same URL without the number, so it isn't kept in history or passed on when the page is shared. */
export function withoutPrefillParam(href: string) {
  const url = new URL(href);
  url.searchParams.delete(PREFILL_PHONE_PARAM);
  return url.toString();
}

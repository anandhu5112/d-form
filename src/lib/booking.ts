import type { FormState } from "@/components/form/formState";
import { checkPhone } from "@/lib/phone";

/** The 15-minute intro call. Override per environment with NEXT_PUBLIC_CAL_BOOKING_URL. */
export const CAL_BOOKING_URL =
  process.env.NEXT_PUBLIC_CAL_BOOKING_URL || "https://cal.com/vinayak-nair/30min";

/**
 * Cal.com booking link with what the enquiry already told us, so the booker
 * only has to pick a slot and type an email.
 *
 * - `name` and `attendeePhoneNumber` prefill Cal's booking fields (the phone
 *   only shows if the event type asks for it; Cal ignores it otherwise).
 * - `metadata[...]` is stored on the booking and sent in the webhook, which ties
 *   the booking to this exact enquiry instead of guessing by name.
 */
export function buildBookingUrl(state: FormState, base: string = CAL_BOOKING_URL) {
  const url = new URL(base);
  const name = state.identity.name.trim();
  if (name) url.searchParams.set("name", name);

  const phone = checkPhone(state.phone.number, state.phone.countryCode);
  if (phone.status === "valid") url.searchParams.set("attendeePhoneNumber", phone.e164);

  if (state.submissionId) url.searchParams.set("metadata[submissionId]", state.submissionId);
  url.searchParams.set("metadata[source]", "nri-form");
  return url.toString();
}

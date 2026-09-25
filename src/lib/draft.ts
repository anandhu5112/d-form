/**
 * Unfinished-enquiry draft, kept in this browser only.
 *
 * Privacy: the draft holds the same answers the user is typing (name, WhatsApp
 * number, choices) and nothing else. It is written only once the user has
 * answered something, expires after DRAFT_TTL_MS, is deleted as soon as the
 * server confirms the enquiry, and can be discarded with "Start over". It never
 * leaves the device except as the enquiry itself.
 */
import {
  furthestReachableStep,
  initialFormState,
  type FormState,
} from "@/components/form/formState";
import { OTHER_RESIDENCE, findCountry, isOtherResidence } from "@/lib/countries";
import type { AccountStatus, AddressProof, PanStatus, Profession } from "@/lib/types";

export const DRAFT_KEY = "desh-enquiry-draft-v1";
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

const PROFESSIONS: Profession[] = ["salaried", "business-owner", "self-employed", "other"];
const ACCOUNT_STATUSES: AccountStatus[] = ["NRE", "NRO", "Both", "None"];
const PAN_STATUSES: PanStatus[] = ["have-it", "applied", "need-one"];
const ADDRESS_PROOFS: AddressProof[] = [
  "utility-bill",
  "tenancy-contract",
  "residence-permit",
  "driving-license",
  "none",
];
const INCOME_BRACKET = /^inr-[a-z0-9-]+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface DraftV1 {
  v: 1;
  savedAt: number;
  expiresAt: number;
  step: number;
  countryCode: string | null;
  name: string;
  phoneCountryCode: string;
  phoneCountryTouched: boolean;
  phoneNumber: string;
  financials: FormState["financials"];
  submissionId: string | null;
  firstAttemptAt: string | null;
  /** A submission was in flight when the draft was last written. */
  pending: boolean;
}

export interface LoadedDraft {
  state: FormState;
  pending: boolean;
}

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function storage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null; // Safari private mode, blocked storage
  }
}

export function hasProgress(state: FormState) {
  const f = state.financials;
  return (
    state.identity.countrySelected ||
    state.identity.name.trim() !== "" ||
    state.phone.number.trim() !== "" ||
    f.profession !== null ||
    f.incomeBracketId !== null ||
    f.accountStatus !== null ||
    f.panStatus !== null ||
    f.addressProofs.length > 0
  );
}

export function saveDraft(
  state: FormState,
  { pending = false, now = Date.now(), store = storage() }: { pending?: boolean; now?: number; store?: StorageLike | null } = {}
) {
  if (!store) return;
  if (state.submitted || !hasProgress(state)) {
    clearDraft(store);
    return;
  }
  const draft: DraftV1 = {
    v: 1,
    savedAt: now,
    expiresAt: now + DRAFT_TTL_MS,
    step: state.step,
    countryCode: state.identity.countrySelected ? state.identity.country.code : null,
    name: state.identity.name,
    phoneCountryCode: state.phone.countryCode,
    phoneCountryTouched: state.phone.countryTouched,
    phoneNumber: state.phone.number,
    financials: state.financials,
    submissionId: state.submissionId,
    firstAttemptAt: state.firstAttemptAt,
    pending,
  };
  try {
    store.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Quota or disabled storage: the form still works, just without recovery.
  }
}

export function clearDraft(store: StorageLike | null = storage()) {
  try {
    store?.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

/** Returns a sanitised FormState, or null if there is no usable draft. */
export function loadDraft(
  { now = Date.now(), store = storage() }: { now?: number; store?: StorageLike | null } = {}
): LoadedDraft | null {
  if (!store) return null;
  let raw: unknown;
  try {
    const text = store.getItem(DRAFT_KEY);
    if (!text) return null;
    raw = JSON.parse(text);
  } catch {
    clearDraft(store);
    return null;
  }

  const d = raw as Partial<DraftV1>;
  if (!d || d.v !== 1 || typeof d.expiresAt !== "number" || d.expiresAt <= now) {
    clearDraft(store);
    return null;
  }

  const country =
    d.countryCode === OTHER_RESIDENCE.code
      ? OTHER_RESIDENCE
      : findCountry(typeof d.countryCode === "string" ? d.countryCode : null);
  const phoneCountry = findCountry(typeof d.phoneCountryCode === "string" ? d.phoneCountryCode : null);
  const f = (d.financials ?? {}) as Partial<FormState["financials"]>;
  const proofs = Array.isArray(f.addressProofs)
    ? f.addressProofs.filter((p): p is AddressProof => oneOf(p, ADDRESS_PROOFS) !== null)
    : [];

  const state: FormState = {
    ...initialFormState,
    identity: {
      country: country ?? initialFormState.identity.country,
      countrySelected: Boolean(country),
      name: typeof d.name === "string" ? d.name.slice(0, 200) : "",
    },
    phone: {
      countryCode:
        phoneCountry?.code ??
        (isOtherResidence(country) ? "" : country?.code ?? initialFormState.phone.countryCode),
      countryTouched: Boolean(d.phoneCountryTouched && phoneCountry),
      number: typeof d.phoneNumber === "string" ? d.phoneNumber.slice(0, 40) : "",
    },
    financials: {
      profession: oneOf(f.profession, PROFESSIONS),
      incomeBracketId:
        typeof f.incomeBracketId === "string" && INCOME_BRACKET.test(f.incomeBracketId)
          ? f.incomeBracketId
          : null,
      accountStatus: oneOf(f.accountStatus, ACCOUNT_STATUSES),
      panStatus: oneOf(f.panStatus, PAN_STATUSES),
      addressProofs: proofs.includes("none") ? ["none"] : [...new Set(proofs)],
    },
    submissionId: typeof d.submissionId === "string" && UUID.test(d.submissionId) ? d.submissionId : null,
    firstAttemptAt: typeof d.firstAttemptAt === "string" ? d.firstAttemptAt : null,
    restored: true,
  };

  if (!hasProgress(state)) {
    clearDraft(store);
    return null;
  }

  // Never land on a step whose earlier answers are missing or now invalid.
  const savedStep = typeof d.step === "number" ? Math.trunc(d.step) : 1;
  state.step = Math.max(1, Math.min(savedStep, furthestReachableStep(state)));

  return { state, pending: Boolean(d.pending && state.submissionId) };
}

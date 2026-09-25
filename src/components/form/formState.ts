"use client";

import { useReducer } from "react";
import { DEFAULT_COUNTRY, findCountry, type Country } from "@/lib/countries";
import { checkPhone } from "@/lib/phone";
import type {
  AccountStatus,
  AddressProof,
  PanStatus,
  Profession,
} from "@/lib/types";

export const TOTAL_STEPS = 4;
export const MAX_NAME_LENGTH = 100;

export interface FormState {
  step: number;
  identity: {
    /** Only meaningful once countrySelected is true. */
    country: Country;
    countrySelected: boolean;
    name: string;
  };
  phone: {
    /** WhatsApp number's country. Follows the residence country until the user picks one. */
    countryCode: string;
    countryTouched: boolean;
    number: string;
  };
  financials: {
    profession: Profession | null;
    incomeBracketId: string | null;
    accountStatus: AccountStatus | null;
    panStatus: PanStatus | null;
    addressProofs: AddressProof[];
  };
  /** Generated on the first Finish and reused for every retry of this enquiry. */
  submissionId: string | null;
  firstAttemptAt: string | null;
  submitting: boolean;
  submitted: boolean;
  submitError: string | null;
  /** Shown on the success screen (e.g. an earlier version was already saved). */
  submitNotice: string | null;
  /** Answers were restored from this device's draft. */
  restored: boolean;
}

export const initialFormState: FormState = {
  step: 1,
  identity: {
    country: DEFAULT_COUNTRY,
    countrySelected: false,
    name: "",
  },
  phone: {
    countryCode: DEFAULT_COUNTRY.code,
    countryTouched: false,
    number: "",
  },
  financials: {
    profession: null,
    incomeBracketId: null,
    accountStatus: null,
    panStatus: null,
    addressProofs: [],
  },
  submissionId: null,
  firstAttemptAt: null,
  submitting: false,
  submitted: false,
  submitError: null,
  submitNotice: null,
  restored: false,
};

export type FormAction =
  | { type: "SET_STEP"; step: number }
  | { type: "SET_COUNTRY"; value: Country }
  | { type: "SET_NAME"; value: string }
  | { type: "SET_PHONE_COUNTRY"; value: string }
  | { type: "SET_PHONE_NUMBER"; value: string }
  | { type: "SET_PHONE"; countryCode: string; number: string }
  | { type: "SET_PROFESSION"; value: Profession }
  | { type: "SET_INCOME_BRACKET"; value: string }
  | { type: "SET_ACCOUNT_STATUS"; value: AccountStatus }
  | { type: "SET_PAN_STATUS"; value: PanStatus }
  | { type: "TOGGLE_ADDRESS_PROOF"; value: AddressProof }
  | { type: "SUBMITTING"; submissionId: string; attemptAt: string }
  | { type: "SUBMITTED"; notice?: string | null }
  | { type: "SUBMIT_ERROR"; error: string }
  | { type: "HYDRATE"; state: FormState }
  | { type: "DISMISS_RESTORED" }
  | { type: "RESET" };

export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };
    case "SET_COUNTRY":
      return {
        ...state,
        identity: {
          ...state.identity,
          country: action.value,
          countrySelected: true,
        },
        // WhatsApp defaults to the residence country, but a deliberate choice
        // (e.g. UAE resident on an Indian number) is never overwritten.
        phone: state.phone.countryTouched
          ? state.phone
          : { ...state.phone, countryCode: action.value.code },
      };
    case "SET_NAME":
      return { ...state, identity: { ...state.identity, name: action.value } };
    case "SET_PHONE_COUNTRY":
      return {
        ...state,
        phone: { ...state.phone, countryCode: action.value, countryTouched: true },
      };
    case "SET_PHONE_NUMBER":
      return { ...state, phone: { ...state.phone, number: action.value } };
    case "SET_PHONE":
      return {
        ...state,
        phone: { countryCode: action.countryCode, countryTouched: true, number: action.number },
      };
    case "SET_PROFESSION":
      return {
        ...state,
        financials: { ...state.financials, profession: action.value },
      };
    case "SET_INCOME_BRACKET":
      return {
        ...state,
        financials: { ...state.financials, incomeBracketId: action.value },
      };
    case "SET_ACCOUNT_STATUS":
      return {
        ...state,
        financials: { ...state.financials, accountStatus: action.value },
      };
    case "SET_PAN_STATUS":
      return {
        ...state,
        financials: { ...state.financials, panStatus: action.value },
      };
    case "TOGGLE_ADDRESS_PROOF": {
      const { addressProofs } = state.financials;
      let next: AddressProof[];
      if (action.value === "none") {
        next = addressProofs.includes("none") ? [] : ["none"];
      } else if (addressProofs.includes(action.value)) {
        next = addressProofs.filter((v) => v !== action.value);
      } else {
        next = [...addressProofs.filter((v) => v !== "none"), action.value];
      }
      return { ...state, financials: { ...state.financials, addressProofs: next } };
    }
    case "SUBMITTING":
      return {
        ...state,
        submissionId: action.submissionId,
        firstAttemptAt: state.firstAttemptAt ?? action.attemptAt,
        submitting: true,
        submitError: null,
      };
    case "SUBMITTED":
      return {
        ...state,
        submitting: false,
        submitted: true,
        submitError: null,
        submitNotice: action.notice ?? null,
      };
    case "SUBMIT_ERROR":
      return { ...state, submitting: false, submitError: action.error };
    case "HYDRATE":
      return action.state;
    case "DISMISS_RESTORED":
      return { ...state, restored: false };
    case "RESET":
      return initialFormState;
    default:
      return state;
  }
}

export function useFormState() {
  return useReducer(formReducer, initialFormState);
}

export function isNameValid(name: string) {
  const trimmed = name.trim();
  return trimmed.length > 1 && trimmed.length <= MAX_NAME_LENGTH && /\p{L}/u.test(trimmed);
}

export function isStep1Valid(state: FormState) {
  return state.identity.countrySelected && Boolean(findCountry(state.identity.country.code));
}

export function isStep2Valid(state: FormState) {
  return (
    isNameValid(state.identity.name) &&
    checkPhone(state.phone.number, state.phone.countryCode).status === "valid"
  );
}

export function isStep3Valid(state: FormState) {
  return (
    state.financials.profession !== null && state.financials.incomeBracketId !== null
  );
}

export function isStep4Valid(state: FormState) {
  return (
    state.financials.accountStatus !== null &&
    state.financials.panStatus !== null &&
    state.financials.addressProofs.length > 0
  );
}

/** The furthest step the answers so far allow (used when restoring a draft). */
export function furthestReachableStep(state: FormState) {
  if (!isStep1Valid(state)) return 1;
  if (!isStep2Valid(state)) return 2;
  if (!isStep3Valid(state)) return 3;
  return 4;
}

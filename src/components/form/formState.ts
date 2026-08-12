"use client";

import { useReducer } from "react";
import { DEFAULT_COUNTRY, type Country } from "@/lib/countries";
import type {
  AccountStatus,
  AddressProof,
  PanStatus,
  Profession,
} from "@/lib/types";

export const TOTAL_STEPS = 4;

export interface FormState {
  step: number;
  identity: {
    country: Country;
    countrySelected: boolean;
    countryOther: string;
    name: string;
  };
  phone: {
    number: string;
  };
  financials: {
    profession: Profession | null;
    incomeBracketId: string | null;
    accountStatus: AccountStatus | null;
    panStatus: PanStatus | null;
    addressProofs: AddressProof[];
  };
  submitting: boolean;
  submitted: boolean;
}

export const initialFormState: FormState = {
  step: 1,
  identity: {
    country: DEFAULT_COUNTRY,
    countrySelected: false,
    countryOther: "",
    name: "",
  },
  phone: {
    number: "",
  },
  financials: {
    profession: null,
    incomeBracketId: null,
    accountStatus: null,
    panStatus: null,
    addressProofs: [],
  },
  submitting: false,
  submitted: false,
};

export type FormAction =
  | { type: "SET_STEP"; step: number }
  | { type: "SET_COUNTRY"; value: Country }
  | { type: "SET_COUNTRY_OTHER"; value: string }
  | { type: "SET_NAME"; value: string }
  | { type: "SET_PHONE_NUMBER"; value: string }
  | { type: "SET_PROFESSION"; value: Profession }
  | { type: "SET_INCOME_BRACKET"; value: string }
  | { type: "SET_ACCOUNT_STATUS"; value: AccountStatus }
  | { type: "SET_PAN_STATUS"; value: PanStatus }
  | { type: "TOGGLE_ADDRESS_PROOF"; value: AddressProof }
  | { type: "SUBMITTING" }
  | { type: "SUBMITTED" };

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
          countryOther: "",
        },
      };
    case "SET_COUNTRY_OTHER":
      return {
        ...state,
        identity: {
          ...state.identity,
          countryOther: action.value,
          countrySelected: false,
        },
      };
    case "SET_NAME":
      return { ...state, identity: { ...state.identity, name: action.value } };
    case "SET_PHONE_NUMBER":
      return { ...state, phone: { ...state.phone, number: action.value } };
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
      return { ...state, submitting: true };
    case "SUBMITTED":
      return { ...state, submitting: false, submitted: true };
    default:
      return state;
  }
}

export function useFormState() {
  return useReducer(formReducer, initialFormState);
}

export function isStep1Valid(state: FormState) {
  return (
    state.identity.countrySelected || state.identity.countryOther.trim().length > 0
  );
}

export function isStep2Valid(state: FormState) {
  return (
    state.identity.name.trim().length > 1 && state.phone.number.trim().length >= 6
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

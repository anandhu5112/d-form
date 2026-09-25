import { COUNTRY_DATA } from "@/lib/countryData";

export type CurrencyCode =
  | "AED"
  | "USD"
  | "GBP"
  | "CAD"
  | "AUD"
  | "SGD"
  | "SAR"
  | "QAR"
  | "KWD"
  | "OMR"
  | "BHD"
  | "EUR"
  | "NZD"
  | "MYR"
  | "HKD"
  | "JPY"
  | "ZAR"
  | "INR";

export interface Country {
  code: string;
  name: string;
  shortName: string;
  flag: string;
  dialCode: string;
  currency: CurrencyCode;
}

/**
 * Residence country -> currency its income bands are shown in. Must match
 * COUNTRY_CURRENCY in functions/_lib/income-bands.js (parent repo), which labels
 * the same bands in the dashboard and Sheet. Everything else uses the
 * Indian-standard INR bands on both sides.
 */
const COUNTRY_CURRENCY: Record<string, CurrencyCode> = {
  IN: "INR",
  US: "USD",
  GB: "GBP",
  AE: "AED",
  SG: "SGD",
  AU: "AUD",
  CA: "CAD",
  HK: "HKD",
  MY: "MYR",
  SA: "SAR",
  QA: "QAR",
  KW: "KWD",
  BH: "BHD",
  OM: "OMR",
  NZ: "NZD",
  JP: "JPY",
  ZA: "ZAR",
  // Euro area
  AT: "EUR", BE: "EUR", HR: "EUR", CY: "EUR", EE: "EUR", FI: "EUR", FR: "EUR",
  DE: "EUR", GR: "EUR", IE: "EUR", IT: "EUR", LV: "EUR", LT: "EUR", LU: "EUR",
  MT: "EUR", NL: "EUR", PT: "EUR", SK: "EUR", SI: "EUR", ES: "EUR",
};

const SHORT_NAMES: Record<string, string> = {
  AE: "UAE",
  US: "USA",
  GB: "UK",
};

/** Regional-indicator emoji for an ISO code ("AE" -> 🇦🇪). */
function flagFor(code: string) {
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export const COUNTRIES: Country[] = COUNTRY_DATA.map(([code, name, dialCode]) => ({
  code,
  name,
  shortName: SHORT_NAMES[code] ?? name,
  flag: flagFor(code),
  dialCode,
  currency: COUNTRY_CURRENCY[code] ?? "INR",
}));

const BY_CODE = new Map(COUNTRIES.map((country) => [country.code, country]));

export function findCountry(code: string | null | undefined): Country | undefined {
  return code ? BY_CODE.get(code) : undefined;
}

/**
 * Residence "Other": the person lives outside the quick picks and does not
 * name the country. Income bands are shown in INR and the WhatsApp code must
 * be chosen by hand (the backend requires it for this residence).
 */
export const OTHER_RESIDENCE: Country = {
  code: "OTHER",
  name: "Other",
  shortName: "Other",
  flag: "🌐",
  dialCode: "",
  currency: "INR",
};

export function isOtherResidence(country: Country | null | undefined) {
  return country?.code === OTHER_RESIDENCE.code;
}

// Placeholder until the user picks; never submitted (step 1 requires a pick).
export const DEFAULT_COUNTRY = BY_CODE.get("AE")!;

// Quick-select chips shown on the "Where do you currently live?" screen.
export const QUICK_SELECT_COUNTRY_CODES = ["AE", "DE", "GB", "US", "CA", "NL"];
export const QUICK_SELECT_COUNTRIES = QUICK_SELECT_COUNTRY_CODES.map(
  (code) => BY_CODE.get(code)!
);

export function findCountryByDialCode(dialCode: string): Country | undefined {
  return COUNTRIES.find((c) => c.dialCode === dialCode);
}

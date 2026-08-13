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

export const COUNTRIES: Country[] = [
  { code: "AE", name: "United Arab Emirates", shortName: "UAE", flag: "🇦🇪", dialCode: "+971", currency: "AED" },
  { code: "US", name: "United States", shortName: "USA", flag: "🇺🇸", dialCode: "+1", currency: "USD" },
  { code: "GB", name: "United Kingdom", shortName: "UK", flag: "🇬🇧", dialCode: "+44", currency: "GBP" },
  { code: "CA", name: "Canada", shortName: "Canada", flag: "🇨🇦", dialCode: "+1", currency: "CAD" },
  { code: "AU", name: "Australia", shortName: "Australia", flag: "🇦🇺", dialCode: "+61", currency: "AUD" },
  { code: "SG", name: "Singapore", shortName: "Singapore", flag: "🇸🇬", dialCode: "+65", currency: "SGD" },
  { code: "SA", name: "Saudi Arabia", shortName: "Saudi Arabia", flag: "🇸🇦", dialCode: "+966", currency: "SAR" },
  { code: "QA", name: "Qatar", shortName: "Qatar", flag: "🇶🇦", dialCode: "+974", currency: "QAR" },
  { code: "KW", name: "Kuwait", shortName: "Kuwait", flag: "🇰🇼", dialCode: "+965", currency: "KWD" },
  { code: "OM", name: "Oman", shortName: "Oman", flag: "🇴🇲", dialCode: "+968", currency: "OMR" },
  { code: "BH", name: "Bahrain", shortName: "Bahrain", flag: "🇧🇭", dialCode: "+973", currency: "BHD" },
  { code: "DE", name: "Germany", shortName: "Germany", flag: "🇩🇪", dialCode: "+49", currency: "EUR" },
  { code: "FR", name: "France", shortName: "France", flag: "🇫🇷", dialCode: "+33", currency: "EUR" },
  { code: "NL", name: "Netherlands", shortName: "Netherlands", flag: "🇳🇱", dialCode: "+31", currency: "EUR" },
  { code: "NZ", name: "New Zealand", shortName: "New Zealand", flag: "🇳🇿", dialCode: "+64", currency: "NZD" },
  { code: "MY", name: "Malaysia", shortName: "Malaysia", flag: "🇲🇾", dialCode: "+60", currency: "MYR" },
  { code: "HK", name: "Hong Kong", shortName: "Hong Kong", flag: "🇭🇰", dialCode: "+852", currency: "HKD" },
  { code: "JP", name: "Japan", shortName: "Japan", flag: "🇯🇵", dialCode: "+81", currency: "JPY" },
  { code: "ZA", name: "South Africa", shortName: "South Africa", flag: "🇿🇦", dialCode: "+27", currency: "ZAR" },
  { code: "IN", name: "India", shortName: "India", flag: "🇮🇳", dialCode: "+91", currency: "INR" },
];

export const DEFAULT_COUNTRY = COUNTRIES[0];

// Quick-select chips shown on the "Where do you currently live?" screen.
export const QUICK_SELECT_COUNTRY_CODES = ["AE", "DE", "GB", "US", "CA", "NL"];
export const QUICK_SELECT_COUNTRIES = QUICK_SELECT_COUNTRY_CODES.map(
  (code) => COUNTRIES.find((c) => c.code === code)!
);

export function findCountryByDialCode(dialCode: string): Country | undefined {
  return COUNTRIES.find((c) => c.dialCode === dialCode);
}

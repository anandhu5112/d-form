export type AccountStatus = "NRE" | "NRO" | "Both" | "None";

export type PanStatus = "have-it" | "applied" | "need-one";

export type AddressProof =
  | "utility-bill"
  | "tenancy-contract"
  | "residence-permit"
  | "driving-license"
  | "none";

export type Profession =
  | "salaried"
  | "business-owner"
  | "self-employed"
  | "other";

export interface EnquiryFormPayload {
  /** Stable for the life of one enquiry, including every retry. */
  submissionId: string;
  identity: {
    name: string;
    /** Resolved ISO 3166-1 alpha-2 residence country. */
    countryCode: string;
    /** Kept for payload compatibility; free-text countries are no longer sent. */
    countryOther: null;
  };
  phone: {
    /** Country of the WhatsApp number; may differ from the residence country. */
    countryCode: string;
    dialCode: string;
    /** National significant number, digits only. */
    number: string;
  };
  financials: {
    profession: Profession | null;
    incomeBracketId: string | null;
    accountStatus: AccountStatus | null;
    panStatus: PanStatus | null;
    addressProofs: AddressProof[];
  };
  submittedAt: string;
}

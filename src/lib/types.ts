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
  identity: {
    name: string;
    countryCode: string;
    countryOther: string | null;
  };
  phone: {
    dialCode: string;
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

"use client";

import type { Dispatch } from "react";
import Chip from "@/components/form/Chip";
import type { FormAction, FormState } from "@/components/form/formState";
import type { AccountStatus, AddressProof, PanStatus } from "@/lib/types";

interface Step4DocsProps {
  state: FormState;
  dispatch: Dispatch<FormAction>;
}

const ACCOUNT_STATUS_OPTIONS: { value: AccountStatus; label: string }[] = [
  { value: "NRE", label: "I've NRE Account" },
  { value: "NRO", label: "I've NRO Account" },
  { value: "Both", label: "I have Both" },
  { value: "None", label: "I don't have any" },
];

const PAN_OPTIONS: { value: PanStatus; label: string }[] = [
  { value: "have-it", label: "I have pan card" },
  { value: "applied", label: "I've applied for it" },
  { value: "need-one", label: "I don't have one" },
];

const ADDRESS_PROOF_OPTIONS: { value: AddressProof; label: string }[] = [
  { value: "utility-bill", label: "Utility bill" },
  { value: "tenancy-contract", label: "Tenancy Contract" },
  { value: "residence-permit", label: "Residence Permit" },
  { value: "driving-license", label: "Driving License" },
  { value: "none", label: "I don't have any" },
];

export default function Step4Docs({ state, dispatch }: Step4DocsProps) {
  const { financials } = state;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        <p className="font-geist text-lg font-medium text-black">
          Do you have an NRE or NRO account?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {ACCOUNT_STATUS_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              variant="compact"
              selected={financials.accountStatus === option.value}
              onSelect={() =>
                dispatch({ type: "SET_ACCOUNT_STATUS", value: option.value })
              }
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <p className="font-geist text-lg font-medium text-black">
          Do you have PAN card?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {PAN_OPTIONS.map((option, i) => (
            <Chip
              key={option.value}
              label={option.label}
              variant="compact"
              className={i === PAN_OPTIONS.length - 1 ? "col-span-2" : undefined}
              selected={financials.panStatus === option.value}
              onSelect={() =>
                dispatch({ type: "SET_PAN_STATUS", value: option.value })
              }
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <p className="font-geist text-lg font-medium leading-[27px] text-black">
            Do you have any of these as overseas address?
          </p>
          <p className="mt-1 font-geist text-sm text-black">
            You can select multiple documents here
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {ADDRESS_PROOF_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              variant="compact"
              selected={financials.addressProofs.includes(option.value)}
              onSelect={() =>
                dispatch({ type: "TOGGLE_ADDRESS_PROOF", value: option.value })
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

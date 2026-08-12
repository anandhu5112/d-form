"use client";

import type { Dispatch } from "react";
import { Input } from "@/components/ui/input";
import Chip from "@/components/form/Chip";
import type { FormAction, FormState } from "@/components/form/formState";
import type { Profession } from "@/lib/types";

interface Step2AboutProps {
  state: FormState;
  dispatch: Dispatch<FormAction>;
}

const PROFESSION_OPTIONS: { value: Profession; label: string }[] = [
  { value: "salaried", label: "Salaried" },
  { value: "self-employed", label: "Self employed" },
  { value: "business-owner", label: "Business owner" },
  { value: "other", label: "Other" },
];

export default function Step2About({ state, dispatch }: Step2AboutProps) {
  const { identity, phone, financials } = state;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        <p className="font-geist text-lg font-medium text-black">Whats your name</p>
        <Input
          placeholder="Enter here"
          value={identity.name}
          onChange={(e) => dispatch({ type: "SET_NAME", value: e.target.value })}
          className="h-12 rounded-[10px] border-white bg-[#f9f9f9] font-geist text-sm placeholder:text-[#a4a4a4]"
        />
      </div>

      <div className="flex flex-col gap-5">
        <p className="font-geist text-lg font-medium text-black">
          What is your contact number
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <span className="flex h-12 shrink-0 items-center rounded-[10px] border-[0.5px] border-white bg-[#f9f9f9] px-3 font-geist text-sm text-[#393939]">
              {identity.country.dialCode}
            </span>
            <Input
              inputMode="numeric"
              placeholder="Phone number"
              value={phone.number}
              onChange={(e) =>
                dispatch({
                  type: "SET_PHONE_NUMBER",
                  value: e.target.value.replace(/[^\d\s]/g, ""),
                })
              }
              className="h-12 flex-1 rounded-[10px] border-white bg-[#f9f9f9] font-geist text-sm placeholder:text-[#a4a4a4]"
            />
          </div>
          <p className="font-geist text-[10px] text-black">
            Please provide your whatsapp number
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <p className="font-geist text-lg font-medium text-black">
          What is your profession?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {PROFESSION_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              variant="compact"
              selected={financials.profession === option.value}
              onSelect={() =>
                dispatch({ type: "SET_PROFESSION", value: option.value })
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

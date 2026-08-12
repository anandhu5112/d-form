"use client";

import type { Dispatch } from "react";
import FormInput from "@/components/form/FormInput";
import type { FormAction, FormState } from "@/components/form/formState";

interface Step2NameContactProps {
  state: FormState;
  dispatch: Dispatch<FormAction>;
}

export default function Step2NameContact({ state, dispatch }: Step2NameContactProps) {
  const { identity, phone } = state;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        <p className="font-geist text-lg font-medium text-black">Whats your name</p>
        <FormInput
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
            <FormInput
              inputMode="numeric"
              placeholder="Phone number"
              value={phone.number}
              onChange={(e) =>
                dispatch({
                  type: "SET_PHONE_NUMBER",
                  value: e.target.value.replace(/[^\d\s]/g, ""),
                })
              }
              className="h-12 rounded-[10px] border-white bg-[#f9f9f9] font-geist text-sm placeholder:text-[#a4a4a4]"
              wrapperClassName="flex-1"
            />
          </div>
          <p className="font-geist text-[10px] text-black">
            Please provide your whatsapp number
          </p>
        </div>
      </div>
    </div>
  );
}

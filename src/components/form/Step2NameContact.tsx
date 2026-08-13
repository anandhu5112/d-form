"use client";

import { useId, type Dispatch } from "react";
import FormInput from "@/components/form/FormInput";
import type { FormAction, FormState } from "@/components/form/formState";

interface Step2NameContactProps {
  state: FormState;
  dispatch: Dispatch<FormAction>;
}

export default function Step2NameContact({ state, dispatch }: Step2NameContactProps) {
  const { identity, phone } = state;
  const nameId = useId();
  const phoneId = useId();
  const phoneHintId = useId();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        <label
          htmlFor={nameId}
          className="font-geist text-lg font-medium text-black"
        >
          What&apos;s your name
        </label>
        <FormInput
          id={nameId}
          name="name"
          autoComplete="name"
          autoCapitalize="words"
          enterKeyHint="next"
          placeholder="Enter here"
          value={identity.name}
          onChange={(e) => dispatch({ type: "SET_NAME", value: e.target.value })}
          className="h-12 rounded-[10px] border-white bg-[#f9f9f9] font-geist text-sm placeholder:text-[#6b6b6b]"
        />
      </div>

      <div className="flex flex-col gap-5">
        <label
          htmlFor={phoneId}
          className="font-geist text-lg font-medium text-black"
        >
          What is your contact number
        </label>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <span
              aria-hidden="true"
              className="flex h-12 shrink-0 items-center rounded-[10px] border-[0.5px] border-white bg-[#f9f9f9] px-3 font-geist text-sm text-[#393939]"
            >
              {identity.country.dialCode}
            </span>
            <FormInput
              id={phoneId}
              name="tel"
              // type=tel gives Android the dial pad and unlocks phone autofill;
              // the visible dial code is aria-hidden, so fold it into the label.
              type="tel"
              autoComplete="tel-national"
              enterKeyHint="done"
              inputMode="numeric"
              aria-label={`Contact number, country code ${identity.country.dialCode}`}
              aria-describedby={phoneHintId}
              placeholder="Phone number"
              value={phone.number}
              onChange={(e) =>
                dispatch({
                  type: "SET_PHONE_NUMBER",
                  value: e.target.value.replace(/[^\d\s]/g, ""),
                })
              }
              className="h-12 rounded-[10px] border-white bg-[#f9f9f9] font-geist text-sm placeholder:text-[#6b6b6b]"
              wrapperClassName="flex-1"
            />
          </div>
          <p id={phoneHintId} className="font-geist text-xs text-[#5f5f5f]">
            Please provide your WhatsApp number
          </p>
        </div>
      </div>
    </div>
  );
}

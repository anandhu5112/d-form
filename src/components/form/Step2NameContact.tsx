"use client";

import { useId, useState, type Dispatch } from "react";
import { ChevronDownIcon } from "lucide-react";
import CountrySearchList from "@/components/form/CountrySearchList";
import FormInput from "@/components/form/FormInput";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  MAX_NAME_LENGTH,
  isNameValid,
  type FormAction,
  type FormState,
} from "@/components/form/formState";
import { findCountry, isOtherResidence } from "@/lib/countries";
import { checkPhone, detectInternationalNumber, sanitizePhoneInput } from "@/lib/phone";

interface Step2NameContactProps {
  state: FormState;
  dispatch: Dispatch<FormAction>;
  /** The user tried to continue; show what is wrong. */
  showErrors: boolean;
}

export default function Step2NameContact({ state, dispatch, showErrors }: Step2NameContactProps) {
  const { identity, phone } = state;
  const nameId = useId();
  const nameErrorId = useId();
  const phoneId = useId();
  const phoneHintId = useId();
  const phoneErrorId = useId();
  const [codeOpen, setCodeOpen] = useState(false);
  const [nameBlurred, setNameBlurred] = useState(false);
  const [phoneBlurred, setPhoneBlurred] = useState(false);

  // Undefined until chosen when the residence is "Other".
  const phoneCountry = findCountry(phone.countryCode);
  const phoneCheck = checkPhone(phone.number, phone.countryCode);
  const codeMissing = !phoneCountry;

  const nameError =
    (showErrors || (nameBlurred && identity.name !== "")) && !isNameValid(identity.name)
      ? "Please enter your name."
      : null;

  let phoneError: string | null = null;
  if (showErrors || (phoneBlurred && phone.number.trim() !== "")) {
    if (codeMissing) {
      phoneError = "Choose your WhatsApp country code from the list first.";
    } else if (phoneCheck.status === "empty") {
      phoneError = "Please enter your WhatsApp number.";
    } else if (phoneCheck.status === "invalid" && phoneCheck.reason === "characters") {
      phoneError = "Use digits only (spaces are fine).";
    } else if (phoneCheck.status === "invalid") {
      phoneError = `That isn't a valid ${phoneCountry?.name ?? ""} number. Check the digits, or change the country code if your WhatsApp number is from another country.`;
    } else if (phoneCheck.status === "mismatch") {
      const detected = findCountry(phoneCheck.detectedCountry);
      phoneError = detected
        ? `This looks like a ${detected.name} number. Change the country code to ${detected.dialCode}, or remove the international prefix.`
        : "The number's country code doesn't match the selected one.";
    }
  }

  const handlePhoneChange = (raw: string) => {
    const value = sanitizePhoneInput(raw);
    // "+44 7400 123456" pasted or typed in full: move the code into the
    // selector and keep only the national digits, instead of doubling it.
    const detected = detectInternationalNumber(value, phone.countryCode);
    if (detected) {
      dispatch({ type: "SET_PHONE", countryCode: detected.countryCode, number: detected.nationalNumber });
      return;
    }
    dispatch({ type: "SET_PHONE_NUMBER", value });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        <label
          htmlFor={nameId}
          className="font-geist text-lg font-medium text-black"
        >
          What&apos;s your name
        </label>
        <div className="flex flex-col gap-2">
          <FormInput
            id={nameId}
            name="name"
            autoComplete="name"
            autoCapitalize="words"
            enterKeyHint="next"
            placeholder="Enter here"
            maxLength={MAX_NAME_LENGTH}
            value={identity.name}
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? nameErrorId : undefined}
            onBlur={() => setNameBlurred(true)}
            onChange={(e) => dispatch({ type: "SET_NAME", value: e.target.value })}
            className="h-12 rounded-[10px] border-white bg-[#f9f9f9] font-geist text-sm placeholder:text-[#6b6b6b]"
          />
          {nameError && (
            <p id={nameErrorId} className="font-geist text-xs text-[#b3261e]">
              {nameError}
            </p>
          )}
        </div>
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
            <Popover open={codeOpen} onOpenChange={setCodeOpen}>
              <PopoverTrigger
                className={`flex h-12 shrink-0 items-center gap-1.5 rounded-[10px] border-[0.5px] bg-[#f9f9f9] px-3 font-geist text-sm text-[#393939] hover-darken ${
                  codeMissing && phoneError ? "border-[#b3261e] ring-1 ring-[#b3261e]" : "border-white"
                }`}
                aria-label={
                  phoneCountry
                    ? `WhatsApp country code: ${phoneCountry.name} ${phoneCountry.dialCode}. Change`
                    : "Choose your WhatsApp country code"
                }
              >
                {phoneCountry ? (
                  <>
                    <span aria-hidden="true" className="text-base">
                      {phoneCountry.flag}
                    </span>
                    <span>{phoneCountry.dialCode}</span>
                  </>
                ) : (
                  <span className="text-[#6b6b6b]">Code</span>
                )}
                <ChevronDownIcon className="size-3.5 opacity-60" aria-hidden="true" />
              </PopoverTrigger>
              <PopoverContent align="start" sideOffset={8} className="w-[min(20rem,calc(100vw-2rem))] p-0">
                {/* Remounted per opening so an abandoned search never carries over. */}
                <CountrySearchList
                  key={codeOpen ? "open" : "closed"}
                  showDialCode
                  placeholder="Search country or code"
                  onSelect={(country) => {
                    dispatch({ type: "SET_PHONE_COUNTRY", value: country.code });
                    setCodeOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
            <FormInput
              id={phoneId}
              name="tel"
              // type=tel gives Android the dial pad and unlocks phone autofill.
              type="tel"
              autoComplete="tel"
              enterKeyHint="done"
              inputMode="tel"
              maxLength={40}
              aria-label={`WhatsApp number, country code ${phoneCountry?.dialCode ?? "not chosen yet"}`}
              aria-describedby={phoneError ? `${phoneErrorId} ${phoneHintId}` : phoneHintId}
              aria-invalid={phoneError ? true : undefined}
              placeholder="WhatsApp number"
              value={phone.number}
              onBlur={() => setPhoneBlurred(true)}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="h-12 rounded-[10px] border-white bg-[#f9f9f9] font-geist text-sm placeholder:text-[#6b6b6b]"
              wrapperClassName="flex-1 min-w-0"
            />
          </div>
          {phoneError && (
            <p id={phoneErrorId} className="font-geist text-xs text-[#b3261e]">
              {phoneError}
            </p>
          )}
          <p id={phoneHintId} className="font-geist text-xs text-[#5f5f5f]">
            {isOtherResidence(identity.country)
              ? "Please provide your WhatsApp number. Tap Code to choose its country code."
              : "Please provide your WhatsApp number. Change the code if it's from a different country than where you live."}
          </p>
        </div>
      </div>
    </div>
  );
}

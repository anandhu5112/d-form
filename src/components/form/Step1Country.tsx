"use client";

import { useId, type Dispatch } from "react";
import Chip from "@/components/form/Chip";
import {
  OTHER_RESIDENCE,
  QUICK_SELECT_COUNTRIES,
  isOtherResidence,
} from "@/lib/countries";
import type { FormAction, FormState } from "@/components/form/formState";

interface Step1CountryProps {
  state: FormState;
  dispatch: Dispatch<FormAction>;
}

export default function Step1Country({ state, dispatch }: Step1CountryProps) {
  const { identity } = state;
  const countryLabelId = useId();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        <p id={countryLabelId} className="font-geist text-lg font-medium text-black">
          Select your residing country
        </p>

        <div
          role="radiogroup"
          aria-labelledby={countryLabelId}
          className="flex flex-wrap gap-3"
        >
          {QUICK_SELECT_COUNTRIES.map((country) => (
            <Chip
              key={country.code}
              icon={country.flag}
              label={country.shortName}
              selectionMode="single"
              selected={identity.countrySelected && identity.country.code === country.code}
              onSelect={() => dispatch({ type: "SET_COUNTRY", value: country })}
            />
          ))}
          {/* Anywhere else: income is then shown in INR and the WhatsApp code
              is picked on the next step. */}
          <Chip
            icon={OTHER_RESIDENCE.flag}
            label={OTHER_RESIDENCE.shortName}
            selectionMode="single"
            selected={identity.countrySelected && isOtherResidence(identity.country)}
            onSelect={() => dispatch({ type: "SET_COUNTRY", value: OTHER_RESIDENCE })}
          />
        </div>
      </div>
    </div>
  );
}

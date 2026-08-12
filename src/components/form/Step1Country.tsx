"use client";

import type { Dispatch } from "react";
import { Input } from "@/components/ui/input";
import Chip from "@/components/form/Chip";
import { QUICK_SELECT_COUNTRIES } from "@/lib/countries";
import type { FormAction, FormState } from "@/components/form/formState";

interface Step1CountryProps {
  state: FormState;
  dispatch: Dispatch<FormAction>;
}

export default function Step1Country({ state, dispatch }: Step1CountryProps) {
  const { identity } = state;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        <p className="font-geist text-lg font-medium text-black">
          Select your residing country
        </p>

        <div className="flex flex-wrap gap-3">
          {QUICK_SELECT_COUNTRIES.map((country) => (
            <Chip
              key={country.code}
              icon={country.flag}
              label={country.shortName}
              selected={identity.countrySelected && identity.country.code === country.code}
              onSelect={() => dispatch({ type: "SET_COUNTRY", value: country })}
            />
          ))}
        </div>

        <Input
          placeholder="Other country"
          value={identity.countryOther}
          onChange={(e) =>
            dispatch({ type: "SET_COUNTRY_OTHER", value: e.target.value })
          }
          className="h-12 rounded-[10px] border-white bg-[#f9f9f9] font-geist text-sm placeholder:text-[#a4a4a4]"
        />
      </div>
    </div>
  );
}

"use client";

import { useId, useState, type Dispatch } from "react";
import Chip from "@/components/form/Chip";
import CountrySearchList from "@/components/form/CountrySearchList";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  QUICK_SELECT_COUNTRIES,
  QUICK_SELECT_COUNTRY_CODES,
} from "@/lib/countries";
import type { FormAction, FormState } from "@/components/form/formState";

interface Step1CountryProps {
  state: FormState;
  dispatch: Dispatch<FormAction>;
}

export default function Step1Country({ state, dispatch }: Step1CountryProps) {
  const { identity } = state;
  const [open, setOpen] = useState(false);
  const countryLabelId = useId();

  const isOtherSelected =
    identity.countrySelected &&
    !QUICK_SELECT_COUNTRY_CODES.includes(identity.country.code);

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

          {/* Every other country: opens the searchable list. A country only
              counts once it is picked from the list; the chip then shows it. */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <Chip
                  icon={isOtherSelected ? identity.country.flag : "🌐"}
                  label={isOtherSelected ? identity.country.name : "Other"}
                  selectionMode="single"
                  selected={isOtherSelected}
                  aria-label={
                    isOtherSelected
                      ? `Residing country: ${identity.country.name}. Change country`
                      : "Other country: search the full list"
                  }
                  className="max-w-full min-w-0"
                />
              }
            />
            <PopoverContent
              align="start"
              sideOffset={8}
              className="w-[min(20rem,calc(100vw-2rem))] p-0"
            >
              {/* Remounted per opening so an abandoned search never carries over. */}
              <CountrySearchList
                key={open ? "open" : "closed"}
                onSelect={(country) => {
                  dispatch({ type: "SET_COUNTRY", value: country });
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}

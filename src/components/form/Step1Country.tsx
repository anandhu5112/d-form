"use client";

import { useId, useState, type Dispatch } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDownIcon, SearchIcon } from "lucide-react";
import Chip from "@/components/form/Chip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CountrySearchList from "@/components/form/CountrySearchList";
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
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            className="w-full text-left"
            aria-label={
              isOtherSelected
                ? `Residing country: ${identity.country.name}. Change country`
                : "Search for another country"
            }
          >
            <AnimatePresence mode="wait" initial={false}>
              {isOtherSelected ? (
                <motion.div
                  key="selected"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="flex h-12 items-center justify-between rounded-[10px] bg-black px-4 font-geist text-sm text-white"
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true" className="text-lg">
                      {identity.country.flag}
                    </span>
                    {identity.country.name}
                  </span>
                  <ChevronDownIcon className="size-4 opacity-70" aria-hidden="true" />
                </motion.div>
              ) : (
                <motion.div
                  key="search"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="flex h-12 items-center gap-2 rounded-[10px] border-[0.5px] border-white bg-[#f9f9f9] px-4 font-geist text-sm text-[#6b6b6b]"
                >
                  <SearchIcon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">Other country</span>
                </motion.div>
              )}
            </AnimatePresence>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={8} className="w-(--anchor-width) p-0">
            <CountrySearchList
              onSelect={(country) => {
                dispatch({ type: "SET_COUNTRY", value: country });
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

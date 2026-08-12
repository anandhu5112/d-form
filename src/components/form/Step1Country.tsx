"use client";

import { useState, type Dispatch } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDownIcon, SearchIcon } from "lucide-react";
import Chip from "@/components/form/Chip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  COUNTRIES,
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

  const isOtherSelected =
    identity.countrySelected &&
    !QUICK_SELECT_COUNTRY_CODES.includes(identity.country.code);

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

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger className="w-full text-left">
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
                    <span className="text-lg">{identity.country.flag}</span>
                    {identity.country.name}
                  </span>
                  <ChevronDownIcon className="size-4 opacity-70" />
                </motion.div>
              ) : (
                <motion.div
                  key="search"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="flex h-12 items-center gap-2 rounded-[10px] border-[0.5px] border-white bg-[#f9f9f9] px-4 font-geist text-sm text-[#a4a4a4]"
                >
                  <SearchIcon className="size-4 shrink-0 opacity-60" />
                  <span className="truncate">
                    {identity.countryOther || "Other country"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={8} className="w-(--anchor-width) p-0">
            <Command>
              <CommandInput
                autoFocus
                placeholder="Search countries"
                value={identity.countryOther}
                onValueChange={(value) =>
                  dispatch({ type: "SET_COUNTRY_OTHER", value })
                }
              />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {COUNTRIES.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={country.name}
                      onSelect={() => {
                        dispatch({ type: "SET_COUNTRY", value: country });
                        setOpen(false);
                      }}
                    >
                      <span className="text-base">{country.flag}</span>
                      {country.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

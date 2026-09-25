"use client";

import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { COUNTRIES, type Country } from "@/lib/countries";

interface CountrySearchListProps {
  onSelect: (country: Country) => void;
  /** Show "+971" next to each name (the WhatsApp code picker). */
  showDialCode?: boolean;
  placeholder?: string;
}

/**
 * Searchable list of every supported country. Typing only filters: a country
 * is chosen by picking a row (click, tap or Enter on the highlighted row),
 * never by leaving free text in the box.
 */
export default function CountrySearchList({
  onSelect,
  showDialCode = false,
  placeholder = "Search countries",
}: CountrySearchListProps) {
  const [query, setQuery] = useState("");

  return (
    <Command>
      <CommandInput
        autoFocus
        placeholder={placeholder}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No matching country. Check the spelling.</CommandEmpty>
        <CommandGroup>
          {COUNTRIES.map((country) => (
            <CommandItem
              key={country.code}
              value={`${country.name} ${country.code}`}
              keywords={[country.dialCode, country.dialCode.slice(1), country.shortName]}
              onSelect={() => onSelect(country)}
            >
              <span aria-hidden="true" className="text-base">
                {country.flag}
              </span>
              <span className="flex-1 truncate">{country.name}</span>
              {showDialCode && (
                <span className="shrink-0 text-xs text-[#5f5f5f]">{country.dialCode}</span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

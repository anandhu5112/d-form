"use client";

import type { Dispatch } from "react";
import Chip from "@/components/form/Chip";
import { getIncomeBrackets } from "@/lib/income";
import type { FormAction, FormState } from "@/components/form/formState";
import type { Profession } from "@/lib/types";

interface Step3ProfessionIncomeProps {
  state: FormState;
  dispatch: Dispatch<FormAction>;
}

const PROFESSION_OPTIONS: { value: Profession; label: string }[] = [
  { value: "salaried", label: "Salaried" },
  { value: "self-employed", label: "Self employed" },
  { value: "business-owner", label: "Business owner" },
  { value: "other", label: "Other" },
];

export default function Step3ProfessionIncome({
  state,
  dispatch,
}: Step3ProfessionIncomeProps) {
  const { identity, financials } = state;
  const incomeBrackets = getIncomeBrackets(identity.country.currency);

  return (
    <div className="flex flex-col gap-8">
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

      <div className="flex flex-col gap-6">
        <p className="font-geist text-lg font-medium leading-[27px] text-black">
          What is your annual income?
        </p>
        <div className="flex flex-col gap-3">
          {incomeBrackets.map((bracket) => (
            <Chip
              key={bracket.id}
              label={bracket.label}
              variant="compact"
              selected={financials.incomeBracketId === bracket.id}
              onSelect={() =>
                dispatch({ type: "SET_INCOME_BRACKET", value: bracket.id })
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

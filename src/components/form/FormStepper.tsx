"use client";

import { CheckIcon } from "lucide-react";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTrigger,
} from "@/components/ui/stepper";
import { TOTAL_STEPS } from "@/components/form/formState";

interface FormStepperProps {
  step: number;
  onStepChange: (step: number) => void;
}

const STEPS = Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1);

export default function FormStepper({ step, onStepChange }: FormStepperProps) {
  return (
    <Stepper
      value={step}
      onValueChange={onStepChange}
      indicators={{ completed: <CheckIcon className="size-3.5" /> }}
    >
      <StepperNav>
        {STEPS.map((s) => (
          <StepperItem key={s} step={s} disabled={s > step}>
            <StepperTrigger>
              <StepperIndicator className="size-7 border-[1.5px] border-[#e2e2e2] bg-white font-inter text-xs text-[#a4a4a4] data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=completed]:border-[#008A25] data-[state=completed]:bg-[#008A25] data-[state=completed]:text-white">
                {s}
              </StepperIndicator>
            </StepperTrigger>
            {s < STEPS.length && (
              <StepperSeparator className="bg-[#e2e2e2] group-data-[state=completed]/step:bg-[#008A25]" />
            )}
          </StepperItem>
        ))}
      </StepperNav>
    </Stepper>
  );
}

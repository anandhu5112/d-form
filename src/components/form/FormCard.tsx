"use client";

import { Loader2 } from "lucide-react";
import ProgressBar from "@/components/form/ProgressBar";
import Step1Country from "@/components/form/Step1Country";
import Step2About from "@/components/form/Step2About";
import Step3Final from "@/components/form/Step3Final";
import SuccessState from "@/components/form/SuccessState";
import {
  useFormState,
  isStep1Valid,
  isStep2Valid,
  isStep3Valid,
} from "@/components/form/formState";
import { submitForm } from "@/lib/submitForm";
import type { EnquiryFormPayload } from "@/lib/types";

const TOTAL_STEPS = 3;

const STEP_HEADLINES: Record<number, string> = {
  1: "Where do you currently live?",
  2: "Tell about yourself",
  3: "Final details",
};

interface FormCardProps {
  onClose: () => void;
}

export default function FormCard({ onClose }: FormCardProps) {
  const [state, dispatch] = useFormState();

  const isCurrentStepValid = () => {
    if (state.step === 1) return isStep1Valid(state);
    if (state.step === 2) return isStep2Valid(state);
    if (state.step === 3) return isStep3Valid(state);
    return false;
  };

  const handleBack = () => {
    if (state.step === 1) {
      onClose();
      return;
    }
    dispatch({ type: "SET_STEP", step: state.step - 1 });
  };

  const handlePrimaryAction = async () => {
    if (!isCurrentStepValid()) return;

    if (state.step < TOTAL_STEPS) {
      dispatch({ type: "SET_STEP", step: state.step + 1 });
      return;
    }

    dispatch({ type: "SUBMITTING" });
    const payload: EnquiryFormPayload = {
      identity: {
        name: state.identity.name,
        countryCode: state.identity.countrySelected ? state.identity.country.code : "",
        countryOther: state.identity.countryOther.trim() || null,
      },
      phone: {
        dialCode: state.identity.country.dialCode,
        number: state.phone.number,
      },
      financials: {
        profession: state.financials.profession,
        accountStatus: state.financials.accountStatus,
        panStatus: state.financials.panStatus,
        addressProofs: state.financials.addressProofs,
      },
      submittedAt: new Date().toISOString(),
    };
    await submitForm(payload);
    dispatch({ type: "SUBMITTED" });
  };

  if (state.submitted) {
    return <SuccessState state={state} onDone={onClose} />;
  }

  const primaryLabel = state.step < TOTAL_STEPS ? "Next" : "Finish";

  return (
    <div className="flex h-full w-full flex-col">
      <div className="shrink-0 px-4 pt-4">
        <ProgressBar step={state.step} totalSteps={TOTAL_STEPS} />
        <h1 className="mt-8 text-center font-geist text-[28px] font-medium tracking-[-0.56px] text-black">
          {STEP_HEADLINES[state.step]}
        </h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
        {state.step === 1 && <Step1Country state={state} dispatch={dispatch} />}
        {state.step === 2 && <Step2About state={state} dispatch={dispatch} />}
        {state.step === 3 && <Step3Final state={state} dispatch={dispatch} />}
      </div>

      <div className="shrink-0 px-4 pb-6">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-12 shrink-0 items-center justify-center rounded-xl border border-[#bcbcbc] bg-white px-8 font-inter text-base font-medium tracking-[-0.32px] text-[#393939] hover:bg-zinc-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={!isCurrentStepValid() || state.submitting}
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#008A25] font-inter text-base font-medium tracking-[-0.32px] text-white hover:bg-[#008A25]/90 disabled:opacity-40"
          >
            {state.submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              primaryLabel
            )}
          </button>
        </div>
        <p className="mt-4 text-center font-inter text-[10px] leading-[15px] tracking-[-0.2px] text-[#b1b1b1]">
          Managed by <span className="font-medium text-[#676767]">Desh</span>, the
          investment platform
          <br />
          behind Ashwin on Finance.
        </p>
      </div>
    </div>
  );
}

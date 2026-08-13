"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type Dispatch } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Loader2 } from "lucide-react";
import Step1Country from "@/components/form/Step1Country";
import Step2NameContact from "@/components/form/Step2NameContact";
import Step3ProfessionIncome from "@/components/form/Step3ProfessionIncome";
import Step4Docs from "@/components/form/Step4Docs";
import SuccessState from "@/components/form/SuccessState";
import {
  TOTAL_STEPS,
  isStep1Valid,
  isStep2Valid,
  isStep3Valid,
  isStep4Valid,
  type FormAction,
  type FormState,
} from "@/components/form/formState";
import { submitForm } from "@/lib/submitForm";
import type { EnquiryFormPayload } from "@/lib/types";

const STEP_HEADLINES: Record<number, string> = {
  1: "Where do you currently live?",
  2: "Tell us about yourself",
  3: "Your profession and income",
  4: "Final details",
};

/** What's still missing on each step, phrased for the user rather than the dev. */
const STEP_REQUIREMENTS: Record<number, string> = {
  1: "Please select the country you live in.",
  2: "Please enter your name and a contact number of at least 6 digits.",
  3: "Please select your profession and your annual income.",
  4: "Please answer all three questions, including at least one address document.",
};

interface FormCardProps {
  state: FormState;
  dispatch: Dispatch<FormAction>;
  onClose: () => void;
}

export default function FormCard({ state, dispatch, onClose }: FormCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [requirementStep, setRequirementStep] = useState<number | null>(null);
  const [canScrollMore, setCanScrollMore] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [state.step]);

  // Drives the bottom fade: without it, options below the fold are invisible on
  // a 360x640 Android screen and users can't tell why the button stays inert.
  const syncScrollAffordance = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    setCanScrollMore(remaining > 8);
  }, []);

  useLayoutEffect(() => {
    syncScrollAffordance();
  }, [state.step, syncScrollAffordance]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(syncScrollAffordance);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    window.addEventListener("resize", syncScrollAffordance);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncScrollAffordance);
    };
  }, [state.step, syncScrollAffordance]);

  const isCurrentStepValid = () => {
    if (state.step === 1) return isStep1Valid(state);
    if (state.step === 2) return isStep2Valid(state);
    if (state.step === 3) return isStep3Valid(state);
    if (state.step === 4) return isStep4Valid(state);
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
    // The button stays enabled on purpose: a disabled control can't be focused
    // and never explains itself, which is a dead end on a touch device.
    if (!isCurrentStepValid()) {
      setRequirementStep(state.step);
      const firstField = scrollRef.current?.querySelector<HTMLElement>(
        'input, [role="radio"], [role="checkbox"]'
      );
      firstField?.focus();
      return;
    }
    setRequirementStep(null);

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
        incomeBracketId: state.financials.incomeBracketId,
        accountStatus: state.financials.accountStatus,
        panStatus: state.financials.panStatus,
        addressProofs: state.financials.addressProofs,
      },
      submittedAt: new Date().toISOString(),
    };
    try {
      await submitForm(payload);
      dispatch({ type: "SUBMITTED" });
    } catch (error) {
      dispatch({
        type: "SUBMIT_ERROR",
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    }
  };

  if (state.submitted) {
    return <SuccessState state={state} onDone={onClose} />;
  }

  const primaryLabel = state.step < TOTAL_STEPS ? "Next" : "Finish";
  const stepInvalid = !isCurrentStepValid();
  const message = state.submitError
    ? state.submitError
    : requirementStep === state.step && stepInvalid
      ? STEP_REQUIREMENTS[state.step]
      : null;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="shrink-0 px-4 pt-6">
        <h1 className="font-geist text-[24px] font-medium tracking-[-0.56px] text-black">
          {STEP_HEADLINES[state.step]}
        </h1>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={syncScrollAffordance}
          className="no-scrollbar h-full overflow-y-auto px-4 py-6"
        >
          <div className="flex min-h-full flex-col justify-center">
            {state.step === 1 && <Step1Country state={state} dispatch={dispatch} />}
            {state.step === 2 && <Step2NameContact state={state} dispatch={dispatch} />}
            {state.step === 3 && (
              <Step3ProfessionIncome state={state} dispatch={dispatch} />
            )}
            {state.step === 4 && <Step4Docs state={state} dispatch={dispatch} />}
          </div>
        </div>
        {canScrollMore && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent"
          />
        )}
      </div>

      <div className="shrink-0 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <p
          role="alert"
          aria-live="assertive"
          className={cnMessage(!!message, !!state.submitError)}
        >
          {message}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            type="button"
            onClick={handleBack}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="flex h-12 w-full min-w-0 items-center justify-center rounded-xl border border-[#767676] bg-white px-8 font-inter text-base font-medium tracking-[-0.32px] text-[#393939] hover-darken"
          >
            Back
          </motion.button>
          <motion.button
            type="button"
            onClick={handlePrimaryAction}
            aria-disabled={stepInvalid || state.submitting}
            data-inactive={stepInvalid || state.submitting ? "true" : undefined}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="flex h-12 w-full min-w-0 items-center justify-center overflow-hidden rounded-xl bg-[#00701e] font-inter text-base font-medium tracking-[-0.32px] text-white hover-darken data-[inactive=true]:opacity-45"
          >
            {/* Keyed remount + CSS animation. AnimatePresence `mode="wait"`
                stranded the exiting span (button read "Next" on the final
                step), and a JS-animated replacement could settle at opacity 0
                if rAF is throttled. CSS `both` always lands visible. */}
            <span
              key={state.submitting ? "loading" : primaryLabel}
              className="animate-label-in flex items-center justify-center"
            >
              {state.submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  <span className="sr-only">Submitting your details</span>
                </>
              ) : (
                primaryLabel
              )}
            </span>
          </motion.button>
        </div>
        <p className="mt-4 text-center font-inter text-[11px] leading-[16px] tracking-[-0.2px] text-[#5f5f5f]">
          Managed by <span className="font-medium text-[#393939]">Desh</span>, the
          investment platform behind Ashwin on Finance.
        </p>
      </div>
    </div>
  );
}

/** Keeps the live region mounted so screen readers announce later changes. */
function cnMessage(hasMessage: boolean, isError: boolean) {
  if (!hasMessage) return "sr-only";
  return `mb-3 text-center font-inter text-xs ${isError ? "text-[#b3261e]" : "text-[#8a5a00]"}`;
}

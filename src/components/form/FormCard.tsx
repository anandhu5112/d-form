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
import { saveDraft } from "@/lib/draft";
import { checkPhone, dialCodeFor } from "@/lib/phone";
import { SubmitError, createSubmissionId, submitEnquiry } from "@/lib/submitForm";
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
  2: "Please enter your name and a valid WhatsApp number.",
  3: "Please select your profession and your annual income.",
  4: "Please answer all three questions, including at least one address document.",
};

interface FormCardProps {
  state: FormState;
  dispatch: Dispatch<FormAction>;
  onClose: () => void;
  onStartOver: () => void;
}

/** Builds the request from validated state; the server re-validates all of it. */
function buildPayload(state: FormState, submissionId: string, submittedAt: string): EnquiryFormPayload {
  const phoneCheck = checkPhone(state.phone.number, state.phone.countryCode);
  return {
    submissionId,
    identity: {
      name: state.identity.name.trim(),
      countryCode: state.identity.country.code,
      countryOther: null,
    },
    phone: {
      countryCode: state.phone.countryCode,
      dialCode: dialCodeFor(state.phone.countryCode),
      number: phoneCheck.status === "valid" ? phoneCheck.nationalNumber : state.phone.number,
    },
    financials: {
      profession: state.financials.profession,
      incomeBracketId: state.financials.incomeBracketId,
      accountStatus: state.financials.accountStatus,
      panStatus: state.financials.panStatus,
      addressProofs: state.financials.addressProofs,
    },
    submittedAt,
  };
}

export default function FormCard({ state, dispatch, onClose, onStartOver }: FormCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Set synchronously on the first Finish, before React re-renders, so a
  // second click/tap in the same frame cannot start another request.
  const inFlightRef = useRef(false);
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
    if (state.submitting) return;
    if (state.step === 1) {
      onClose();
      return;
    }
    dispatch({ type: "SET_STEP", step: state.step - 1 });
  };

  const submit = async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    // One id per enquiry, reused for every retry (including after a reload),
    // so the server can recognise repeats and store a single lead.
    const submissionId = state.submissionId ?? createSubmissionId();
    const attemptAt = new Date().toISOString();
    const submittedAt = state.firstAttemptAt ?? attemptAt;
    dispatch({ type: "SUBMITTING", submissionId, attemptAt });
    // Persist the id before the request leaves, in case the tab dies mid-flight.
    saveDraft({ ...state, submissionId, firstAttemptAt: submittedAt }, { pending: true });

    try {
      const result = await submitEnquiry(buildPayload(state, submissionId, submittedAt));
      dispatch({
        type: "SUBMITTED",
        notice: result.conflict
          ? "We had already received your details from an earlier attempt. If anything changed, just tell us on WhatsApp."
          : null,
      });
    } catch (error) {
      const message =
        error instanceof SubmitError
          ? error.message
          : "Something went wrong. Your answers are saved on this device — please try again.";
      dispatch({ type: "SUBMIT_ERROR", error: message });
      saveDraft({ ...state, submissionId, firstAttemptAt: submittedAt }, { pending: false });
    } finally {
      inFlightRef.current = false;
    }
  };

  const handlePrimaryAction = async () => {
    if (state.submitting || inFlightRef.current) return;
    // The button stays enabled on purpose: a disabled control can't be focused
    // and never explains itself, which is a dead end on a touch device.
    if (!isCurrentStepValid()) {
      setRequirementStep(state.step);
      const firstField = scrollRef.current?.querySelector<HTMLElement>(
        'input[aria-invalid="true"], input, [role="radio"], [role="checkbox"]'
      );
      firstField?.focus();
      return;
    }
    setRequirementStep(null);

    if (state.step < TOTAL_STEPS) {
      dispatch({ type: "SET_STEP", step: state.step + 1 });
      return;
    }

    await submit();
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
        {state.restored && (
          <div
            role="status"
            className="mb-4 flex items-center justify-between gap-3 rounded-[10px] bg-[#f3f7f4] px-3 py-2 font-geist text-xs text-[#393939]"
          >
            <span>We restored your answers from earlier on this device.</span>
            <span className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={onStartOver}
                disabled={state.submitting}
                className="font-medium text-[#00701e] underline underline-offset-2 disabled:opacity-45"
              >
                Start over
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "DISMISS_RESTORED" })}
                aria-label="Dismiss"
                className="text-[#5f5f5f]"
              >
                ✕
              </button>
            </span>
          </div>
        )}
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
            {state.step === 2 && (
              <Step2NameContact
                state={state}
                dispatch={dispatch}
                showErrors={requirementStep === 2}
              />
            )}
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
            disabled={state.submitting}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="flex h-12 w-full min-w-0 items-center justify-center rounded-xl border border-[#767676] bg-white px-8 font-inter text-base font-medium tracking-[-0.32px] text-[#393939] hover-darken disabled:opacity-45"
          >
            Back
          </motion.button>
          <motion.button
            type="button"
            onClick={handlePrimaryAction}
            // Genuinely disabled while sending (not just aria-disabled), so
            // repeat taps never reach the handler.
            disabled={state.submitting}
            aria-busy={state.submitting || undefined}
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

"use client";

import { useEffect, useRef, useState } from "react";
import ScreenShell from "@/components/ScreenShell";
import LandingHero from "@/components/LandingHero";
import FormCard from "@/components/form/FormCard";
import FormStepper from "@/components/form/FormStepper";
import { useFormState } from "@/components/form/formState";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft";
import { getSubmissionStatus } from "@/lib/submitForm";

export default function Home() {
  const [state, dispatch] = useFormState();
  // Drafts are read after mount (localStorage is not available during SSR),
  // and nothing is written back until that has happened.
  const [view, setView] = useState({ hydrated: false, showForm: false });
  const { hydrated, showForm } = view;
  const setShowForm = (value: boolean) => setView((current) => ({ ...current, showForm: value }));
  const resumeChecked = useRef(false);

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      dispatch({ type: "HYDRATE", state: draft.state });

      // The page went away while a submission was in flight. Ask the server
      // whether it arrived before offering to send it again.
      if (draft.pending && draft.state.submissionId && !resumeChecked.current) {
        resumeChecked.current = true;
        const { submissionId } = draft.state;
        dispatch({ type: "SUBMITTING", submissionId, attemptAt: new Date().toISOString() });
        getSubmissionStatus(submissionId).then((status) => {
          if (status === "accepted") {
            dispatch({ type: "SUBMITTED" });
            return;
          }
          dispatch({
            type: "SUBMIT_ERROR",
            error:
              status === "not_found"
                ? "Your last attempt didn't reach us. Tap Finish to send your details."
                : "We couldn't check whether your details were sent. Tap Finish to try again — you won't be registered twice.",
          });
        });
      }
    }
    // One-time sync from localStorage, which does not exist during SSR; the
    // extra render is unavoidable without a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setView({ hydrated: true, showForm: Boolean(draft) });
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated) return;
    if (state.submitted) {
      clearDraft();
      return;
    }
    // While a request is in flight FormCard has already written the pending
    // marker; don't overwrite it with a non-pending copy.
    if (state.submitting) return;
    saveDraft(state);
  }, [state, hydrated]);

  const closeForm = () => {
    setShowForm(false);
    // Answers are kept (and "Get started" resumes them) unless the enquiry is done.
    if (state.submitted) dispatch({ type: "RESET" });
  };

  const startOver = () => {
    clearDraft();
    dispatch({ type: "RESET" });
  };

  return (
    <main className="relative min-h-[100dvh] w-full bg-[#F7F7F7]">
      {!showForm ? (
        <LandingHero onGetStarted={() => setShowForm(true)} />
      ) : (
        <ScreenShell
          className="animate-card-in"
          header={
            !state.submitted ? (
              <FormStepper
                step={state.step}
                onStepChange={(step) => {
                  if (!state.submitting) dispatch({ type: "SET_STEP", step });
                }}
              />
            ) : null
          }
        >
          <FormCard
            state={state}
            dispatch={dispatch}
            onClose={closeForm}
            onStartOver={startOver}
          />
        </ScreenShell>
      )}
    </main>
  );
}

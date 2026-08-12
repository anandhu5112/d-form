"use client";

import { useState } from "react";
import ScreenShell from "@/components/ScreenShell";
import LandingHero from "@/components/LandingHero";
import FormCard from "@/components/form/FormCard";
import FormStepper from "@/components/form/FormStepper";
import { useFormState } from "@/components/form/formState";

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [state, dispatch] = useFormState();

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#F7F7F7]">
      {!showForm ? (
        <LandingHero onGetStarted={() => setShowForm(true)} />
      ) : (
        <ScreenShell
          className="animate-card-in"
          header={
            !state.submitted ? (
              <FormStepper
                step={state.step}
                onStepChange={(step) => dispatch({ type: "SET_STEP", step })}
              />
            ) : null
          }
        >
          <FormCard state={state} dispatch={dispatch} onClose={() => setShowForm(false)} />
        </ScreenShell>
      )}
    </main>
  );
}

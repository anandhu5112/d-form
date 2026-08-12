"use client";

import { useState } from "react";
import ScreenShell from "@/components/ScreenShell";
import LandingHero from "@/components/LandingHero";
import FormCard from "@/components/form/FormCard";

export default function Home() {
  const [showForm, setShowForm] = useState(false);

  return (
    <main className="relative min-h-screen w-full bg-[#F7F7F7]">
      {!showForm ? (
        <LandingHero onGetStarted={() => setShowForm(true)} />
      ) : (
        <ScreenShell className="animate-card-in">
          <FormCard onClose={() => setShowForm(false)} />
        </ScreenShell>
      )}
    </main>
  );
}

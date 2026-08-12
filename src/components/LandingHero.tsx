"use client";

import ScreenShell from "@/components/ScreenShell";
import LandingCard from "@/components/LandingCard";

interface LandingHeroProps {
  onGetStarted: () => void;
}

export default function LandingHero({ onGetStarted }: LandingHeroProps) {
  return (
    <ScreenShell>
      <LandingCard onGetStarted={onGetStarted} />
    </ScreenShell>
  );
}

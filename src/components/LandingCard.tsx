"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

interface LandingCardProps {
  onGetStarted: () => void;
}

export default function LandingCard({ onGetStarted }: LandingCardProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-between px-4 pb-6 pt-10 md:px-10 md:pt-12">
      <div className="flex flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-4">
          <div className="relative size-[60px] shrink-0 overflow-hidden rounded-full border-[3px] border-white/50 shadow-[0_9px_9px_0_rgba(39,54,84,0.09),0_2px_5px_0_rgba(39,54,84,0.1)]">
            <Image
              src="/assets/ashwin-avatar.png"
              alt="Ashwin on Finance"
              fill
              className="object-cover"
              sizes="60px"
            />
          </div>
          <div className="flex items-center gap-1">
            <p className="whitespace-nowrap font-inter text-base font-semibold tracking-[-0.32px] text-black">
              aswinonfinance
            </p>
            <Image
              src="/assets/verified-badge.svg"
              alt="Verified"
              width={12}
              height={14}
            />
          </div>
        </div>

        <p className="max-w-[280px] text-center font-geist text-[28px] font-medium tracking-[-0.56px] text-[#13a73a]">
          Let&apos;s build your portfolio together.
        </p>
      </div>

      <div className="relative w-full flex-1 md:h-[260px] md:flex-none">
        <Image
          src="/assets/coins.png"
          alt=""
          fill
          className="object-contain"
          sizes="(min-width: 768px) 320px, 60vw"
        />
      </div>

      <div className="flex w-full flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="font-geist text-lg font-medium text-black">
            Help me know better about you
          </p>
          <p className="font-geist text-xs text-[#13a73a]">
            Takes less than 1 min
          </p>
        </div>
        <Button
          onClick={onGetStarted}
          className="h-12 w-full rounded-xl bg-[#008A25] font-dm-sans text-base font-medium tracking-[-0.64px] text-white hover:bg-[#008A25]/90"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

interface LandingCardProps {
  onGetStarted: () => void;
}

export default function LandingCard({ onGetStarted }: LandingCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex h-full w-full flex-col items-center justify-between px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-10 md:px-10 md:pt-12">
      <div className="flex shrink-0 flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-4">
          <div className="relative size-[60px] shrink-0 overflow-hidden rounded-full border-[3px] border-white/50 shadow-[0_9px_9px_0_rgba(39,54,84,0.09),0_2px_5px_0_rgba(39,54,84,0.1)]">
            <Image
              src="/assets/ashwin-avatar.png"
              alt=""
              fill
              priority
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
              alt="Verified account"
              width={12}
              height={14}
            />
          </div>
        </div>

        <p className="max-w-[280px] text-center font-geist text-[28px] font-medium tracking-[-0.56px] text-[#00701e]">
          Let&apos;s build your portfolio together.
        </p>
      </div>

      <div className="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden">
        {/* Decorative loop. poster paints instantly so the panel is never blank
            on a slow connection; reduced-motion users get the still frame. */}
        {reduceMotion ? (
          <Image
            src="/assets/coins-poster.jpg"
            alt=""
            width={720}
            height={720}
            className="h-[820px] w-[820px] max-h-full max-w-full object-contain"
          />
        ) : (
          <video
            src="/assets/coins.mp4"
            poster="/assets/coins-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            tabIndex={-1}
            className="h-[820px] w-[820px] max-h-full max-w-full object-contain"
          />
        )}
      </div>

      <div className="flex w-full shrink-0 flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="font-geist text-lg font-medium text-black">
            Help me know better about you
          </p>
          <p className="font-geist text-xs text-[#00701e]">Takes less than 1 min</p>
        </div>
        <motion.button
          type="button"
          onClick={onGetStarted}
          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          // Deliberately not buttonVariants: its default variant carries a bare
          // `hover:bg-primary/80`, which Android latches on tap and leaves the
          // primary CTA stuck dark grey.
          className="flex h-12 w-full items-center justify-center rounded-xl bg-[#00701e] font-dm-sans text-base font-medium tracking-[-0.64px] text-white hover-darken"
        >
          Get Started
        </motion.button>
      </div>
    </div>
  );
}

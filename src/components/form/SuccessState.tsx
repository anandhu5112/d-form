"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import type { FormState } from "@/components/form/formState";

interface SuccessStateProps {
  state: FormState;
  onDone: () => void;
}

export default function SuccessState({ onDone }: SuccessStateProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex h-full w-full flex-col items-center justify-between px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-10 md:px-10 md:pt-14">
      <div
        role="status"
        aria-live="polite"
        className="min-h-0 flex-1 overflow-y-auto flex flex-col items-center justify-center gap-12 md:gap-10"
      >
        <div className="animate-success-pop flex size-[150px] shrink-0 items-center justify-center rounded-full bg-[#E9F7ED]">
          <svg viewBox="0 0 24 24" className="size-20 text-[#00701e]" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M7.5 12.5l3 3 6-6.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-success-check"
            />
          </svg>
        </div>

        <div className="flex flex-col items-center gap-6 text-center">
          <p className="font-geist text-[24px] font-medium tracking-[-0.56px] text-[#00701e]">
            Thank you
          </p>
          <p className="font-geist text-lg font-medium leading-normal text-black">
            You are one step closer to
            <br />a wealthy future
          </p>
          <p className="font-geist text-xs text-[#5f5f5f]">
            We will get back to you shortly on WhatsApp.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative size-[60px] shrink-0 overflow-hidden rounded-full border-[3px] border-white/50 shadow-[0_9px_9px_0_rgba(39,54,84,0.09),0_2px_5px_0_rgba(39,54,84,0.1)]">
            <Image
              src="/assets/ashwin-avatar.png"
              alt=""
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
              alt="Verified account"
              width={12}
              height={14}
            />
          </div>
        </div>

        <motion.button
          type="button"
          onClick={onDone}
          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-[#00701e] font-inter text-sm font-medium text-white hover-darken"
        >
          Done
        </motion.button>
      </div>
    </div>
  );
}

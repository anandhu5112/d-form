"use client";

import Image from "next/image";
import type { FormState } from "@/components/form/formState";

interface SuccessStateProps {
  state: FormState;
  onDone: () => void;
}

export default function SuccessState({ onDone }: SuccessStateProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-between px-4 pb-6 pt-10 md:px-10 md:pt-14">
      <div className="min-h-0 flex-1 overflow-y-auto flex flex-col items-center justify-center gap-12 md:gap-10">
        <div className="animate-success-pop flex size-[150px] shrink-0 items-center justify-center rounded-full bg-[#E9F7ED]">
          <svg
            viewBox="0 0 24 24"
            className="size-20 text-[#008A25]"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="1.5"
            />
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
          <p className="font-geist text-[28px] font-medium tracking-[-0.56px] text-[#13a73a]">
            Congrats
          </p>
          <p className="font-geist text-lg font-medium leading-normal text-black">
            You are one step closer to
            <br />a wealthy future
          </p>
          <p className="font-geist text-xs text-[#979797]">
            We will get back to you shortly!
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-6">
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

        <button
          type="button"
          onClick={onDone}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-[#008A25] font-inter text-sm font-medium text-white hover:bg-[#008A25]/90"
        >
          Done
        </button>
      </div>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScreenShellProps {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
}

export default function ScreenShell({ children, header, className }: ScreenShellProps) {
  return (
    <div
      className={cn(
        // h-[100dvh] alone collapses the card to an unusable sliver when the
        // Android keyboard opens or the phone is in landscape. The min-h floor
        // lets the document scroll instead of crushing the content.
        "relative z-10 flex h-[100dvh] min-h-[34rem] w-full flex-col p-4",
        "md:items-center md:justify-center md:p-6"
      )}
    >
      <div className="flex h-full min-h-0 w-full flex-col md:grid md:max-w-[1280px] md:grid-cols-12 md:gap-6">
        <div className="flex h-full min-h-0 w-full flex-col md:col-span-6 md:col-start-4">
          {header ? <div className="z-10 shrink-0 pb-4">{header}</div> : null}
          <div
            className={cn(
              "min-h-0 w-full flex-1 overflow-hidden rounded-3xl border border-black/5 bg-white",
              className
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScreenShellProps {
  children: ReactNode;
  className?: string;
}

export default function ScreenShell({ children, className }: ScreenShellProps) {
  return (
    <div className="relative z-10 h-[100dvh] w-full p-4 md:flex md:items-center md:justify-center md:p-6">
      <div className="h-full w-full md:grid md:max-w-[1280px] md:grid-cols-12 md:gap-6">
        <div className="h-full w-full md:col-span-4 md:col-start-5">
          <div
            className={cn(
              "h-full w-full overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_48px_-16px_rgba(0,0,0,0.12)]",
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

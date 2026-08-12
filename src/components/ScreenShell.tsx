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
    <div className="relative z-10 h-[100dvh] w-full overflow-hidden p-4 md:flex md:items-center md:justify-center md:p-6">
      <div className="h-full w-full md:grid md:max-w-[1280px] md:grid-cols-12 md:gap-6">
        <div className="flex h-full min-h-0 w-full flex-col md:col-span-4 md:col-start-5">
          {header ? <div className="sticky top-0 z-10 shrink-0 pb-4">{header}</div> : null}
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

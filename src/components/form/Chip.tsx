"use client";

import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  icon?: string;
  selected: boolean;
  onSelect: () => void;
  variant?: "country" | "compact";
  className?: string;
}

export default function Chip({
  label,
  icon,
  selected,
  onSelect,
  variant = "country",
  className,
}: ChipProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex items-center justify-center gap-2 rounded-[10px] border-[0.5px] border-white font-dm-sans transition-colors",
        variant === "country" &&
          cn(
            "h-12 whitespace-nowrap px-4 py-2.5 text-lg tracking-[-0.72px]",
            selected ? "bg-black text-white" : "bg-[rgba(235,235,235,0.32)] text-black"
          ),
        variant === "compact" &&
          cn(
            "h-11 w-full px-3 py-3 text-sm",
            selected
              ? "bg-black text-white shadow-[0_8px_16px_rgba(0,0,0,0.25)]"
              : "bg-[#f9f9f9] text-[#a4a4a4]"
          ),
        className
      )}
    >
      {icon && <span className="text-2xl tracking-[-0.96px]">{icon}</span>}
      {label}
    </button>
  );
}

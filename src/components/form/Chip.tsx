"use client";

import { motion } from "motion/react";
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
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      whileTap={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "flex items-center justify-center gap-2 rounded-[10px] border-[0.5px] font-dm-sans transition-colors duration-200",
        variant === "country" &&
          cn(
            "h-12 whitespace-nowrap px-4 py-2.5 text-lg tracking-[-0.72px]",
            selected
              ? "border-transparent bg-black text-white"
              : "border-white bg-[rgba(235,235,235,0.32)] text-black"
          ),
        variant === "compact" &&
          cn(
            "h-11 w-full px-3 py-3 text-sm",
            selected
              ? "border-transparent bg-black text-white shadow-[0_8px_16px_rgba(0,0,0,0.25)]"
              : "border-white bg-[#f9f9f9] text-[#a4a4a4]"
          ),
        className
      )}
    >
      {icon && <span className="text-2xl tracking-[-0.96px]">{icon}</span>}
      {label}
    </motion.button>
  );
}

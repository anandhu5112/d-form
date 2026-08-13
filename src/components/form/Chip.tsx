"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  icon?: string;
  selected: boolean;
  onSelect: () => void;
  variant?: "country" | "compact";
  /**
   * Screen-reader semantics for the group this chip belongs to.
   * "single" → radio (pick one), "multiple" → checkbox (pick any).
   * aria-pressed (the old behaviour) conveys neither.
   */
  selectionMode?: "single" | "multiple";
  className?: string;
}

export default function Chip({
  label,
  icon,
  selected,
  onSelect,
  variant = "country",
  selectionMode = "single",
  className,
}: ChipProps) {
  const reduceMotion = useReducedMotion();
  const unselectedBg = variant === "country" ? "rgba(235,235,235,0.32)" : "#f9f9f9";

  const role = selectionMode === "single" ? "radio" : "checkbox";

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      role={role}
      aria-checked={selected}
      initial={false}
      animate={{
        backgroundColor: selected ? "#000000" : unselectedBg,
        color: selected ? "#ffffff" : "#000000",
        borderColor: selected ? "rgba(0,0,0,0)" : "#ffffff",
        boxShadow:
          selected && variant === "compact"
            ? "0 8px 16px rgba(0,0,0,0.25)"
            : "0 0px 0px rgba(0,0,0,0)",
      }}
      transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
      whileTap={reduceMotion ? undefined : { scale: 0.95, transition: { type: "spring", stiffness: 500, damping: 30 } }}
      className={cn(
        "flex items-center justify-center gap-2 rounded-[10px] border-[0.5px] font-dm-sans",
        // min-h-11 keeps every chip at/above the 44px touch minimum.
        variant === "country" && "h-12 min-h-11 whitespace-nowrap px-4 py-2.5 text-lg tracking-[-0.72px]",
        variant === "compact" && "min-h-11 w-full px-3 py-3 text-sm",
        className
      )}
    >
      {icon && (
        <span aria-hidden="true" className="text-2xl tracking-[-0.96px]">
          {icon}
        </span>
      )}
      {label}
    </motion.button>
  );
}

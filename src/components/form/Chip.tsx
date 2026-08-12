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
  const unselectedBg = variant === "country" ? "rgba(235,235,235,0.32)" : "#f9f9f9";

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
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
      transition={{ duration: 0.2, ease: "easeOut" }}
      whileTap={{ scale: 0.95, transition: { type: "spring", stiffness: 500, damping: 30 } }}
      whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 500, damping: 30 } }}
      className={cn(
        "flex items-center justify-center gap-2 rounded-[10px] border-[0.5px] font-dm-sans",
        variant === "country" && "h-12 whitespace-nowrap px-4 py-2.5 text-lg tracking-[-0.72px]",
        variant === "compact" && "h-11 w-full px-3 py-3 text-sm",
        className
      )}
    >
      {icon && <span className="text-2xl tracking-[-0.96px]">{icon}</span>}
      {label}
    </motion.button>
  );
}

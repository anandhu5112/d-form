"use client";

import { useState, type ComponentProps } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type FormInputProps = ComponentProps<typeof Input> & {
  wrapperClassName?: string;
};

export default function FormInput({
  className,
  wrapperClassName,
  onFocus,
  onBlur,
  ...props
}: FormInputProps) {
  const [focused, setFocused] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ scale: focused && !reduceMotion ? 1.01 : 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn("rounded-[10px]", wrapperClassName)}
    >
      <Input
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className={cn(
          "transition-shadow duration-200",
          // was rgba(0,0,0,0.08) — invisible, and well under the 3:1 that
          // WCAG 1.4.11 asks of a focus indicator.
          focused && "shadow-[0_0_0_2px_#00701e]",
          className
        )}
        {...props}
      />
    </motion.div>
  );
}

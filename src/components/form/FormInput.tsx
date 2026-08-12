"use client";

import { useState, type ComponentProps } from "react";
import { motion } from "motion/react";
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

  return (
    <motion.div
      animate={{ scale: focused ? 1.01 : 1 }}
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
          focused && "shadow-[0_0_0_3px_rgba(0,0,0,0.08)]",
          className
        )}
        {...props}
      />
    </motion.div>
  );
}

"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  /** Visually show the label next to the switch (otherwise it is screen-reader only). */
  showLabel?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked, onCheckedChange, label, showLabel = false, disabled, className }: SwitchProps) {
  return (
    <label className={cn("inline-flex items-center gap-2.5 cursor-pointer select-none", disabled && "opacity-50 cursor-not-allowed", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={showLabel ? undefined : label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          checked ? "bg-primary justify-end" : "bg-surface-3 justify-start"
        )}
      >
        <motion.span layout transition={spring.snappy} className="h-5 w-5 rounded-full bg-white shadow-soft" />
      </button>
      {showLabel && <span className="text-sm text-fg-secondary">{label}</span>}
    </label>
  );
}

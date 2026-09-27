"use client";

import React, { useId } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: React.ReactNode;
  className?: string;
}

export function Checkbox({ checked, onCheckedChange, label, className }: CheckboxProps) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn("inline-flex items-center gap-2 cursor-pointer select-none text-sm text-fg-secondary", className)}>
      <span className="relative inline-flex">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={cn(
            "flex h-[18px] w-[18px] items-center justify-center rounded-md border transition-colors duration-150",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-primary/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-canvas",
            checked ? "border-primary bg-primary" : "border-line-strong bg-surface"
          )}
        >
          <svg viewBox="0 0 16 16" className="h-3 w-3 text-primary-fg" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <motion.path
              d="M3.5 8.5l3 3 6-7"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
              transition={{ duration: 0.18 }}
            />
          </svg>
        </span>
      </span>
      {label}
    </label>
  );
}

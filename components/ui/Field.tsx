"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";
import { Label } from "./Label";

interface FieldProps {
  label: React.ReactNode;
  icon?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  /** Extra content on the right of the label row (e.g. a counter). */
  aside?: React.ReactNode;
  className?: string;
  /** Receives the generated id so the control can be linked to its label. */
  children: (props: { id: string; "aria-invalid"?: boolean; "aria-describedby"?: string }) => React.ReactNode;
}

/** Label + control + hint/error, wired up for accessibility. */
export function Field({ label, icon, hint, error, required, aside, className, children }: FieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>
          {icon && <span className="text-fg-subtle [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>}
          <span>{label}</span>
          {required && (
            <span className="text-fg-subtle" aria-hidden>
              *
            </span>
          )}
        </Label>
        {aside && <div className="mb-1.5 text-xs text-fg-subtle">{aside}</div>}
      </div>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-fg-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

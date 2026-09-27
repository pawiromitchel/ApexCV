import React from "react";
import { cn } from "@/lib/utils";

export const fieldClass =
  "w-full rounded-xl border border-line bg-surface px-3 text-sm text-fg placeholder:text-fg-subtle shadow-soft " +
  "transition-[border-color,box-shadow,background-color] duration-150 " +
  "hover:border-line-strong focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 " +
  "disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/15";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type = "text", ...props }, ref) => (
  <input ref={ref} type={type} className={cn(fieldClass, "h-9", className)} {...props} />
));
Input.displayName = "Input";

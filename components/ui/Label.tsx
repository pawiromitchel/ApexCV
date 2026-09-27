import React from "react";
import { cn } from "@/lib/utils";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-fg-secondary", className)}
    {...props}
  />
));
Label.displayName = "Label";

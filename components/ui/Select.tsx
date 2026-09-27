import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { fieldClass } from "./Input";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

/** Native select (best on mobile and for accessibility) styled to match inputs. */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <div className={cn("relative", className)}>
    <select ref={ref} className={cn(fieldClass, "h-9 appearance-none pr-8 cursor-pointer")} {...props}>
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
  </div>
));
Select.displayName = "Select";

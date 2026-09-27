"use client";

import React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme, ThemePreference } from "./ThemeProvider";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

/**
 * Icon button that flips light/dark with a circular reveal from the click point.
 * The visible icon is driven by the `dark` class (not React state) so it is correct on
 * first paint and never animates on page load.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { toggle } = useTheme();
  const iconBase =
    "absolute h-[18px] w-[18px] transition-[transform,opacity] duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]";
  return (
    <button
      type="button"
      onClick={(e) => toggle({ x: e.clientX, y: e.clientY })}
      aria-label="Toggle light or dark theme"
      title="Toggle theme"
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl text-fg-muted transition-colors",
        "hover:bg-surface-2 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        className
      )}
    >
      <Sun className={cn(iconBase, "rotate-0 scale-100 opacity-100 dark:-rotate-90 dark:scale-50 dark:opacity-0")} />
      <Moon className={cn(iconBase, "rotate-90 scale-50 opacity-0 dark:rotate-0 dark:scale-100 dark:opacity-100")} />
    </button>
  );
}

/** Light / Dark / System picker for menus and settings. */
export function ThemeSelect({ className }: { className?: string }) {
  const { preference, setPreference } = useTheme();
  return (
    <SegmentedControl<ThemePreference>
      ariaLabel="Theme"
      size="sm"
      fullWidth
      className={className}
      value={preference}
      onChange={(v) => setPreference(v)}
      options={[
        { value: "light", label: "Light", icon: <Sun className="h-3.5 w-3.5" /> },
        { value: "dark", label: "Dark", icon: <Moon className="h-3.5 w-3.5" /> },
        { value: "system", label: "Auto", icon: <Monitor className="h-3.5 w-3.5" /> },
      ]}
    />
  );
}

"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { THEME_STORAGE_KEY } from "@/lib/themeScript";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  /** Pass the click origin to animate the switch as a circular reveal from that point. */
  setPreference: (pref: ThemePreference, origin?: { x: number; y: number }) => void;
  toggle: (origin?: { x: number; y: number }) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("dark");

  useEffect(() => {
    let stored: ThemePreference = "system";
    try {
      stored = (localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference) || "system";
    } catch {
      // storage unavailable (private mode); fall back to system
    }
    setPreferenceState(stored);
    setResolved(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  // Follow OS changes while the preference is "system"
  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next = systemTheme();
      applyTheme(next);
      setResolved(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [preference]);

  const setPreference = useCallback(
    (pref: ThemePreference, origin?: { x: number; y: number }) => {
      const next = pref === "system" ? systemTheme() : pref;
      try {
        localStorage.setItem(THEME_STORAGE_KEY, pref);
      } catch {
        // ignore
      }

      const commit = () => {
        applyTheme(next);
        setPreferenceState(pref);
        setResolved(next);
      };

      const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
      if (next === resolved || prefersReducedMotion()) {
        commit();
        return;
      }

      if (!doc.startViewTransition) {
        const root = document.documentElement;
        root.classList.add("theme-transition");
        commit();
        window.setTimeout(() => root.classList.remove("theme-transition"), 300);
        return;
      }

      const x = origin?.x ?? window.innerWidth / 2;
      const y = origin?.y ?? 0;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      const transition = doc.startViewTransition(() => {
        flushSync(commit);
      });
      transition.ready
        .then(() => {
          document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 450, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" }
          );
        })
        .catch(() => {
          // transition skipped; theme is already applied
        });
    },
    [resolved]
  );

  const toggle = useCallback(
    (origin?: { x: number; y: number }) => setPreference(resolved === "dark" ? "light" : "dark", origin),
    [resolved, setPreference]
  );

  return (
    <ThemeContext.Provider value={{ preference, resolved, setPreference, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

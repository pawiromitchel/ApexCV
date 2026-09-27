import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge about our custom shadow scale so `shadow-soft` isn't mistaken for a shadow colour
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      shadow: [{ shadow: ["soft", "lifted", "overlay"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Ensures a URL starts with http:// or https:// for external links.
 */
export function normalizeUrl(url?: string): string {
  if (!url || !url.trim()) return "";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Strips http://, https://, and trailing slashes for display text.
 */
export function cleanUrl(url?: string): string {
  if (!url || !url.trim()) return "";
  return url.trim().replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
}

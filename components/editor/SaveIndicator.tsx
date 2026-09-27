"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { SaveStatus } from "@/lib/hooks/useAutosave";
import { cn } from "@/lib/utils";

export function SaveIndicator({
  status,
  lastSavedAt,
  onRetry,
  compact,
}: {
  status: SaveStatus;
  lastSavedAt: Date | null;
  onRetry: () => void;
  compact?: boolean;
}) {
  const savedTitle = lastSavedAt ? `Saved at ${lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "All changes saved";

  return (
    <div className="flex shrink-0 items-center text-[13px]" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        {status === "error" ? (
          <motion.button
            key="error"
            type="button"
            onClick={onRetry}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-medium text-danger hover:bg-danger/10"
            title="Your latest changes are not saved yet. Click to retry."
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            {!compact && <span className="hidden sm:inline">Not saved · Retry</span>}
          </motion.button>
        ) : status === "saved" ? (
          <motion.span
            key="saved"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="inline-flex items-center gap-1.5 px-2 py-1 text-fg-subtle"
            title={savedTitle}
          >
            <Check className="h-3.5 w-3.5 text-success" />
            {!compact && <span className="hidden sm:inline">Saved</span>}
          </motion.span>
        ) : (
          <motion.span
            key="saving"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={cn("inline-flex items-center gap-1.5 px-2 py-1 text-fg-subtle")}
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {!compact && <span className="hidden sm:inline">Saving…</span>}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

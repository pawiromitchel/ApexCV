"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";

type ToastVariant = "default" | "success" | "error";

export interface ToastOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  /** ms before auto-dismiss; 0 keeps it until dismissed. */
  duration?: number;
  action?: { label: string; onClick: () => void };
  /** Called when the toast leaves without its action being used (e.g. commit a deferred delete). */
  onExpire?: () => void;
}

interface ToastEntry extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  toast: (opts: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const icons: Record<ToastVariant, React.ReactNode> = {
  default: <Info className="h-4 w-4 text-primary" />,
  success: <CheckCircle2 className="h-4 w-4 text-success" />,
  error: <AlertTriangle className="h-4 w-4 text-danger" />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const nextId = useRef(1);
  const actioned = useRef(new Set<number>());
  const entries = useRef(new Map<number, ToastEntry>());

  const dismiss = useCallback((id: number) => {
    const entry = entries.current.get(id);
    if (entry && !actioned.current.has(id)) entry.onExpire?.();
    entries.current.delete(id);
    actioned.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: ToastOptions) => {
    const id = nextId.current++;
    const entry = { duration: opts.action ? 6000 : 3500, variant: "default" as ToastVariant, ...opts, id };
    entries.current.set(id, entry);
    // Keep the stack short: expire the oldest when a fourth arrives
    setToasts((prev) => {
      const next = [...prev, entry];
      if (next.length > 3) {
        const [oldest] = next;
        window.setTimeout(() => dismiss(oldest.id), 0);
      }
      return next;
    });
    return id;
  }, [dismiss]);

  // Run pending expiry callbacks (e.g. deferred deletes) if the page is left
  useEffect(() => {
    const flush = () => entries.current.forEach((_, id) => dismiss(id));
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        aria-live="polite"
        className="no-print pointer-events-none fixed inset-x-0 bottom-0 z-[300] flex flex-col items-center gap-2 p-4 sm:bottom-2"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <ToastItem
              key={t.id}
              entry={t}
              onDismiss={() => dismiss(t.id)}
              onAction={() => {
                actioned.current.add(t.id);
                t.action?.onClick();
                dismiss(t.id);
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ entry, onDismiss, onAction }: { entry: ToastEntry; onDismiss: () => void; onAction: () => void }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!entry.duration || paused) return;
    const t = window.setTimeout(onDismiss, entry.duration);
    return () => window.clearTimeout(t);
  }, [entry.duration, paused, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      transition={spring.smooth}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role={entry.variant === "error" ? "alert" : "status"}
      className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-surface px-4 py-3 shadow-overlay"
    >
      <span className="mt-0.5 shrink-0">{icons[entry.variant ?? "default"]}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-fg">{entry.title}</p>
        {entry.description && <p className="mt-0.5 text-[13px] text-fg-muted">{entry.description}</p>}
      </div>
      {entry.action && (
        <button
          type="button"
          onClick={onAction}
          className={cn(
            "shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-primary transition-colors hover:bg-primary/10",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          )}
        >
          {entry.action.label}
        </button>
      )}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="-mr-1 shrink-0 rounded-lg p-1 text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

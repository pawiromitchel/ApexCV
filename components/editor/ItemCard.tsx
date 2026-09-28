"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ChevronDown, ChevronUp, Eye, EyeOff, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { spring, ease } from "@/lib/motion";
import { IconButton } from "@/components/ui/Button";
import { Collapse } from "@/components/ui/Collapse";

interface ItemCardProps {
  id: string;
  index: number;
  total: number;
  title: string;
  subtitle?: React.ReactNode;
  /** Replaces the index number in the leading badge (e.g. a link icon). */
  leading?: React.ReactNode;
  hidden?: boolean;
  open: boolean;
  onToggle: () => void;
  onMove?: (direction: -1 | 1) => void;
  onToggleHidden?: () => void;
  onDelete?: () => void;
  /** Noun used in accessible labels, e.g. "position". */
  noun: string;
  /** Scroll this card into view (after siblings collapse). */
  focusRequested?: boolean;
  /** Also move keyboard focus to the first field. */
  focusField?: boolean;
  onFocused?: () => void;
  className?: string;
  children: React.ReactNode;
}

/** Collapsible card for one entry in a repeatable section. Wrap lists in <AnimatePresence initial={false}>. */
export function ItemCard({
  id,
  index,
  total,
  title,
  subtitle,
  leading,
  hidden,
  open,
  onToggle,
  onMove,
  onToggleHidden,
  onDelete,
  noun,
  focusRequested,
  focusField = true,
  onFocused,
  className,
  children,
}: ItemCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!focusRequested) return;
    // Wait for the previously open card to collapse, otherwise the target moves mid-scroll
    const scrollTimer = window.setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 260);
    const focusTimer = window.setTimeout(() => {
      if (focusField) {
        ref.current?.querySelector<HTMLElement>("[data-item-body] input, [data-item-body] textarea")?.focus({ preventScroll: true });
      }
      setFlash(true);
      onFocused?.();
    }, 560);
    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(focusTimer);
    };
  }, [focusRequested, focusField, onFocused]);

  // Own effect so clearing the focus request (onFocused) can't cancel the fade-out
  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(false), 1000);
    return () => window.clearTimeout(t);
  }, [flash]);

  const bodyId = `${id}-body`;

  return (
    <motion.div
      ref={ref}
      layout="position"
      data-item-id={id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.2, ease: ease.inOut } }}
      transition={spring.smooth}
      className={cn(
        "group scroll-mt-4 rounded-2xl border bg-surface shadow-soft transition-[border-color,box-shadow] duration-300",
        open ? "border-line-strong" : "border-line hover:border-line-strong",
        flash && "border-primary ring-4 ring-primary/15",
        className
      )}
    >
      <div className="flex items-center gap-1 pr-2">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={bodyId}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-3.5 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50"
        >
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold tabular-nums transition-colors",
              open ? "bg-primary/10 text-primary" : "bg-surface-2 text-fg-muted"
            )}
          >
            {leading ?? index + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span className={cn("flex items-center gap-2 text-sm font-semibold", hidden ? "text-fg-subtle" : "text-fg")}>
              <span className={cn("truncate", hidden && "line-through decoration-fg-subtle/60")}>{title}</span>
              {hidden && (
                <span className="shrink-0 rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-fg-subtle no-underline">
                  Hidden
                </span>
              )}
            </span>
            {subtitle && <span className="mt-0.5 block truncate text-[13px] text-fg-muted">{subtitle}</span>}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity sm:opacity-60 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          {onMove && total > 1 && (
            <>
              <IconButton label={`Move ${noun} up`} disabled={index === 0} onClick={() => onMove(-1)}>
                <ChevronUp className="h-4 w-4" />
              </IconButton>
              <IconButton label={`Move ${noun} down`} disabled={index === total - 1} onClick={() => onMove(1)}>
                <ChevronDown className="h-4 w-4" />
              </IconButton>
            </>
          )}
          {onToggleHidden && (
            <IconButton label={hidden ? `Show ${noun} on CV` : `Hide ${noun} from CV`} onClick={onToggleHidden}>
              {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </IconButton>
          )}
          {onDelete && (
            <IconButton label={`Delete ${noun}`} onClick={onDelete} className="hover:bg-danger/10 hover:text-danger">
              <Trash2 className="h-4 w-4" />
            </IconButton>
          )}
        </div>
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 180 : 0 }}
          transition={spring.snappy}
          className="ml-0.5 flex h-8 w-6 cursor-pointer items-center justify-center text-fg-subtle"
          onClick={onToggle}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </div>

      <div id={bodyId}>
        <Collapse open={open}>
          <div data-item-body className="space-y-4 border-t border-line px-4 pb-4 pt-4">
            {children}
          </div>
        </Collapse>
      </div>
    </motion.div>
  );
}

/** Heading row for a form section: title, optional count/description, and actions. */
export function SectionHeader({
  title,
  description,
  actions,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-fg">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

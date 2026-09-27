"use client";

import React, { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { popover } from "@/lib/motion";

type TriggerProps = {
  ref: React.Ref<HTMLButtonElement>;
  onClick: (e: React.MouseEvent) => void;
  "aria-expanded": boolean;
  "aria-haspopup": "menu" | "dialog";
  "aria-controls": string;
};

interface PopoverProps {
  trigger: (props: TriggerProps, open: boolean) => React.ReactNode;
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  align?: "start" | "end";
  className?: string;
  role?: "menu" | "dialog";
  ariaLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const PopoverCloseContext = createContext<() => void>(() => {});
export const usePopoverClose = () => useContext(PopoverCloseContext);

/**
 * Floating panel anchored to its trigger. Rendered in a portal with fixed positioning so
 * it is never clipped by scroll containers; flips above the trigger when there is no room.
 */
export function Popover({
  trigger,
  children,
  align = "start",
  className,
  role = "dialog",
  ariaLabel,
  open: controlledOpen,
  onOpenChange,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange]
  );

  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left?: number; right?: number; origin: string }>({
    origin: "top left",
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => setMounted(true), []);

  const close = useCallback(
    (restoreFocus = true) => {
      setOpen(false);
      if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
    },
    [setOpen]
  );

  const place = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const panelHeight = panelRef.current?.offsetHeight ?? 240;
    const spaceBelow = window.innerHeight - rect.bottom;
    const flip = spaceBelow < panelHeight + 12 && rect.top > spaceBelow;
    const vertical = flip ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 };
    const horizontal =
      align === "end" ? { right: Math.max(8, window.innerWidth - rect.right) } : { left: Math.max(8, rect.left) };
    setPos({ ...vertical, ...horizontal, origin: `${flip ? "bottom" : "top"} ${align === "end" ? "right" : "left"}` });
  }, [align]);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    // Re-measure once the panel has its real height
    const raf = requestAnimationFrame(place);
    return () => cancelAnimationFrame(raf);
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      close(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    const onViewportChange = () => place();
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
    };
  }, [open, close, place]);

  // Move focus into the panel for keyboard users
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(
        role === "menu" ? '[role="menuitem"]:not([disabled])' : "button, input, a[href], [tabindex]"
      );
      first?.focus({ preventScroll: true });
    }, 20);
    return () => window.clearTimeout(t);
  }, [open, role]);

  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    if (role !== "menu") return;
    const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(index + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(index - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === "Tab") {
      close(false);
    }
  };

  const triggerProps: TriggerProps = {
    ref: triggerRef,
    onClick: (e) => {
      e.stopPropagation();
      setOpen(!open);
    },
    "aria-expanded": open,
    "aria-haspopup": role,
    "aria-controls": panelId,
  };

  return (
    <>
      {trigger(triggerProps, open)}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={panelRef}
                id={panelId}
                role={role}
                aria-label={ariaLabel}
                variants={popover}
                initial="hidden"
                animate="show"
                exit="exit"
                style={{ ...pos, position: "fixed", transformOrigin: pos.origin }}
                onKeyDown={onPanelKeyDown}
                className={cn(
                  "no-print z-[250] min-w-[12rem] overflow-hidden rounded-2xl bg-surface p-1.5 shadow-overlay",
                  className
                )}
              >
                <PopoverCloseContext.Provider value={() => close()}>
                  {typeof children === "function" ? children(() => close()) : children}
                </PopoverCloseContext.Provider>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

/* ---------------------------------- Menu ---------------------------------- */

type MenuProps = Omit<PopoverProps, "role">;

export function Menu(props: MenuProps) {
  return <Popover {...props} role="menu" />;
}

interface MenuItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onSelect"> {
  icon?: React.ReactNode;
  shortcut?: string;
  destructive?: boolean;
  onSelect?: () => void;
  /** Keep the menu open after selecting (e.g. toggles). */
  keepOpen?: boolean;
}

export function MenuItem({ icon, shortcut, destructive, onSelect, keepOpen, className, children, ...props }: MenuItemProps) {
  const close = usePopoverClose();
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      onClick={() => {
        onSelect?.();
        if (!keepOpen) close();
      }}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm outline-none transition-colors",
        "disabled:pointer-events-none disabled:opacity-50",
        destructive
          ? "text-danger hover:bg-danger/10 focus:bg-danger/10"
          : "text-fg-secondary hover:bg-surface-2 hover:text-fg focus:bg-surface-2 focus:text-fg",
        className
      )}
      {...props}
    >
      {icon && <span className="flex h-4 w-4 shrink-0 items-center justify-center opacity-80 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
      {shortcut && <kbd className="font-sans text-xs text-fg-subtle">{shortcut}</kbd>}
    </button>
  );
}

export function MenuSeparator() {
  return <div role="separator" className="-mx-1.5 my-1.5 h-px bg-line" />;
}

export function MenuLabel({ children }: { children: React.ReactNode }) {
  return <div className="px-2.5 pb-1 pt-1.5 text-xs font-medium text-fg-subtle">{children}</div>;
}

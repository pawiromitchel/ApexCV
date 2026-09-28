"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export interface RevealRequest {
  itemId: string;
  /** Changes on every request so clicking the same item twice still reveals it. */
  nonce: number;
}

const RevealContext = createContext<RevealRequest | null>(null);

export const RevealProvider = RevealContext.Provider;

export function useRevealRequest() {
  return useContext(RevealContext);
}

/**
 * Accordion state for a list of section items, shared by every repeatable form.
 * Handles "open the new item and focus it", and opening an item the user clicked in the preview.
 */
export function useItemAccordion<T extends { id: string }>(items: T[]) {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>(() =>
    items.length > 0 ? { [items[0].id]: true } : {}
  );
  // The card that should scroll into view, and whether its first field should also get focus
  const [focusId, setFocusId] = useState<string | null>(null);
  const [focusField, setFocusField] = useState(false);
  const reveal = useRevealRequest();
  const lastNonce = useRef<number | null>(null);

  const openOnly = useCallback((id: string, withField: boolean) => {
    setOpenIds({ [id]: true });
    setFocusId(id);
    setFocusField(withField);
  }, []);

  // Clicking an entry in the preview opens it on its own and focuses it
  useEffect(() => {
    if (!reveal || reveal.nonce === lastNonce.current) return;
    if (!items.some((i) => i.id === reveal.itemId)) return;
    lastNonce.current = reveal.nonce;
    openOnly(reveal.itemId, true);
  }, [reveal, items, openOnly]);

  /** Opening a card collapses the others and scrolls it to the top; closing just closes it. */
  const toggle = useCallback(
    (id: string) => {
      setOpenIds((prev) => {
        if (prev[id]) {
          const next = { ...prev };
          delete next[id];
          return next;
        }
        setFocusId(id);
        setFocusField(false);
        return { [id]: true };
      });
    },
    []
  );
  /** Collapse everything else, open this one, then scroll to it and focus its first field. */
  const openAndFocus = useCallback((id: string) => openOnly(id, true), [openOnly]);
  const clearFocus = useCallback(() => setFocusId(null), []);

  return {
    isOpen: (id: string) => !!openIds[id],
    toggle,
    openAndFocus,
    focusId,
    focusField,
    clearFocus,
  };
}

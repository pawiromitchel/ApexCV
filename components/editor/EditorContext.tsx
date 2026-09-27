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
  const [focusId, setFocusId] = useState<string | null>(null);
  const reveal = useRevealRequest();
  const lastNonce = useRef<number | null>(null);

  useEffect(() => {
    if (!reveal || reveal.nonce === lastNonce.current) return;
    if (!items.some((i) => i.id === reveal.itemId)) return;
    lastNonce.current = reveal.nonce;
    setOpenIds((prev) => ({ ...prev, [reveal.itemId]: true }));
    setFocusId(reveal.itemId);
  }, [reveal, items]);

  const toggle = useCallback((id: string) => setOpenIds((prev) => ({ ...prev, [id]: !prev[id] })), []);
  /** Collapse everything else, open this one, then scroll to it and focus its first field. */
  const openAndFocus = useCallback((id: string) => {
    setOpenIds({ [id]: true });
    setFocusId(id);
  }, []);
  const clearFocus = useCallback(() => setFocusId(null), []);

  return {
    isOpen: (id: string) => !!openIds[id],
    toggle,
    openAndFocus,
    focusId,
    clearFocus,
  };
}

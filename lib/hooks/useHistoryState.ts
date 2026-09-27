"use client";

import { useCallback, useRef, useState } from "react";

const MAX_ENTRIES = 150;
/** Edits closer together than this merge into one undo step (so typing a word undoes as a unit). */
const COALESCE_MS = 700;

interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface SetOptions {
  /** Always record a separate undo step (e.g. deletes), even right after typing. */
  discrete?: boolean;
}

/** State with undo/redo. Snapshots share structure, so memory stays small. */
export function useHistoryState<T>(initial: T) {
  const [history, setHistory] = useState<History<T>>({ past: [], present: initial, future: [] });
  const lastChange = useRef(0);
  const forceBoundary = useRef(false);

  const set = useCallback((updater: T | ((prev: T) => T), options: SetOptions = {}) => {
    const now = Date.now();
    const coalesce = !options.discrete && !forceBoundary.current && now - lastChange.current < COALESCE_MS;
    lastChange.current = now;
    forceBoundary.current = !!options.discrete;

    setHistory((h) => {
      const next = typeof updater === "function" ? (updater as (p: T) => T)(h.present) : updater;
      if (Object.is(next, h.present)) return h;
      const past = coalesce && h.past.length > 0 ? h.past : [...h.past, h.present].slice(-MAX_ENTRIES);
      return { past, present: next, future: [] };
    });
  }, []);

  const undo = useCallback(() => {
    forceBoundary.current = true;
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1];
      return { past: h.past.slice(0, -1), present: previous, future: [h.present, ...h.future] };
    });
  }, []);

  const redo = useCallback(() => {
    forceBoundary.current = true;
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const [next, ...rest] = h.future;
      return { past: [...h.past, h.present], present: next, future: rest };
    });
  }, []);

  return {
    state: history.present,
    set,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}

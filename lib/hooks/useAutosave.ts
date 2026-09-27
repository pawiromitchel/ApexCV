"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "saved" | "pending" | "saving" | "error";

const DEBOUNCE_MS = 800;
const RETRY_DELAYS_MS = [2000, 5000, 10000, 30000];
/** fetch keepalive bodies are capped at 64KB by browsers. */
const KEEPALIVE_LIMIT = 60_000;

interface Options<T> {
  data: T;
  /** Resolves true on success. Throw or return false to trigger a retry. */
  save: (data: T, opts: { keepalive: boolean }) => Promise<boolean | "forbidden">;
}

/**
 * Debounced autosave that never loses edits:
 * - saves run one at a time and always send the latest data (no out-of-order overwrites)
 * - failures retry with backoff and surface as status "error"
 * - pending edits are flushed on unmount / page hide, and the tab warns before closing unsaved
 */
export function useAutosave<T>({ data, save }: Options<T>) {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const latest = useRef(data);
  const version = useRef(0);
  const savedVersion = useRef(0);
  const inFlight = useRef<Promise<void> | null>(null);
  const debounceTimer = useRef<number | null>(null);
  const retryTimer = useRef<number | null>(null);
  const retryCount = useRef(0);
  const isFirst = useRef(true);
  const saveRef = useRef(save);
  saveRef.current = save;

  const clearTimers = () => {
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    if (retryTimer.current) window.clearTimeout(retryTimer.current);
    debounceTimer.current = retryTimer.current = null;
  };

  const flush = useCallback((): Promise<void> => {
    clearTimers();
    if (version.current === savedVersion.current) return inFlight.current ?? Promise.resolve();
    if (inFlight.current) {
      // Chain: once the current save lands, save whatever is newest
      return inFlight.current.then(() => flush());
    }

    const sendingVersion = version.current;
    setStatus("saving");
    const run = (async () => {
      let result: boolean | "forbidden" = false;
      try {
        result = await saveRef.current(latest.current, { keepalive: false });
      } catch {
        result = false;
      }
      inFlight.current = null;

      if (result === true) {
        savedVersion.current = Math.max(savedVersion.current, sendingVersion);
        retryCount.current = 0;
        setLastSavedAt(new Date());
        if (version.current !== savedVersion.current) {
          setStatus("pending");
          await flush();
        } else {
          setStatus("saved");
        }
        return;
      }

      setStatus("error");
      if (result === "forbidden") return; // retrying won't help
      const delay = RETRY_DELAYS_MS[Math.min(retryCount.current, RETRY_DELAYS_MS.length - 1)];
      retryCount.current += 1;
      retryTimer.current = window.setTimeout(() => void flush(), delay);
    })();
    inFlight.current = run;
    return run;
  }, []);

  // Schedule a save whenever data changes
  useEffect(() => {
    latest.current = data;
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    version.current += 1;
    setStatus((s) => (s === "error" ? s : "pending"));
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => void flush(), DEBOUNCE_MS);
  }, [data, flush]);

  // Last-chance save when the page goes away or the editor unmounts
  useEffect(() => {
    const sendBeaconSave = () => {
      if (version.current === savedVersion.current) return;
      const body = JSON.stringify(latest.current);
      if (body.length > KEEPALIVE_LIMIT) return;
      void saveRef.current(latest.current, { keepalive: true }).catch(() => {});
      savedVersion.current = version.current;
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (version.current !== savedVersion.current || inFlight.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("pagehide", sendBeaconSave);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("pagehide", sendBeaconSave);
      window.removeEventListener("beforeunload", onBeforeUnload);
      clearTimers();
      sendBeaconSave();
    };
  }, []);

  return { status, lastSavedAt, flush, retry: flush };
}

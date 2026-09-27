"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/Toast";

/** Registers the service worker and reports updates and connectivity through the shared toasts. */
export function ServiceWorkerRegister() {
  const { toast, dismiss } = useToast();
  const offlineToast = useRef<number | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const promptUpdate = (worker: ServiceWorker) =>
      toast({
        title: "A new version of ApexCV is ready",
        duration: 0,
        action: { label: "Reload", onClick: () => worker.postMessage({ type: "SKIP_WAITING" }) },
      });

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          if (registration.waiting && navigator.serviceWorker.controller) promptUpdate(registration.waiting);
          registration.addEventListener("updatefound", () => {
            const worker = registration.installing;
            worker?.addEventListener("statechange", () => {
              if (worker.state === "installed" && navigator.serviceWorker.controller) promptUpdate(worker);
            });
          });
        })
        .catch((err) => console.warn("[PWA] Service worker registration failed:", err));
    };

    // The load event may already have fired by the time React hydrates
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => {
      window.removeEventListener("load", register);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, [toast]);

  useEffect(() => {
    const onOffline = () => {
      offlineToast.current = toast({
        variant: "error",
        title: "You’re offline",
        description: "Keep editing. Changes save when you reconnect.",
        duration: 0,
      });
    };
    const onOnline = () => {
      if (offlineToast.current) dismiss(offlineToast.current);
      offlineToast.current = null;
      toast({ variant: "success", title: "Back online" });
    };
    if (!navigator.onLine) onOffline();
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [toast, dismiss]);

  return null;
}

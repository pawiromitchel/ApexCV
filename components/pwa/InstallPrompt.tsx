"use client";

import React, { useState, useEffect } from "react";
import { Download, Sparkles } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt({ variant = "button" }: { variant?: "button" | "banner" }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if already in standalone / installed mode
    if (
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true)
    ) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
      }
    } catch (err) {
      console.warn("Install prompt failed:", err);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  };

  // If already installed, don't show prompt
  if (isInstalled || !deferredPrompt) {
    return null;
  }

  if (variant === "banner") {
    return (
      <div className="no-print mx-auto max-w-6xl px-4 pt-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-4 shadow-soft sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-fg">Install ApexCV</p>
              <p className="text-[13px] text-fg-muted">Open it from your home screen or dock, even offline.</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={() => setDeferredPrompt(null)} className="rounded-lg px-3 py-1.5 text-sm text-fg-muted transition-colors hover:text-fg">
              Not now
            </button>
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover active:scale-[0.97]"
            >
              <Download className="h-4 w-4" />
              {isInstalling ? "Installing…" : "Install"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleInstallClick}
      disabled={isInstalling}
      className="no-print flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-fg-secondary transition-colors hover:bg-surface-2 hover:text-fg"
    >
      <Download className="h-4 w-4 opacity-80" />
      <span>{isInstalling ? "Installing…" : "Install as an app"}</span>
    </button>
  );
}

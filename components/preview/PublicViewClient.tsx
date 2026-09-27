"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Mail } from "lucide-react";
import { ResumeData } from "@/lib/types";
import { ApexLogo } from "@/components/ui/ApexLogo";
import { Button, buttonVariants } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { CvPreview } from "@/components/preview/CvPreview";

const REFRESH_MS = 60_000;

export function PublicViewClient({ initialData, identifier }: { initialData: ResumeData; identifier: string }) {
  const [data, setData] = useState<ResumeData>(initialData);

  // Pick up edits quietly: instantly from the owner's editor in the same browser, otherwise on focus / every minute
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel("apexcv_preview_sync");
      channel.onmessage = (event) => {
        if (event.data?.resume && event.data.id === initialData.id) setData(event.data.resume);
      };
    }

    const refresh = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch(`/api/view/${encodeURIComponent(identifier)}`, { cache: "no-store" });
        const json = await res.json();
        if (json.success) setData(json.resume);
      } catch {
        // offline; keep showing what we have
      }
    };
    const interval = window.setInterval(refresh, REFRESH_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      channel?.close();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [identifier, initialData.id]);

  const { fullName, jobTitle, email } = data.personalInfo;

  return (
    <div className="flex h-[100dvh] flex-col bg-canvas print:block print:h-auto">
      <header
        className="no-print z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line bg-surface/80 px-4 backdrop-blur-xl sm:px-6"
      >
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-fg">{fullName || data.title}</p>
          {jobTitle && <p className="truncate text-[13px] text-fg-muted">{jobTitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          {email && (
            <a href={`mailto:${email}`} className={buttonVariants({ variant: "outline", className: "hidden sm:inline-flex" })}>
              <Mail className="h-4 w-4" /> Contact
            </a>
          )}
          <Button variant="primary" onClick={() => window.print()}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download PDF</span>
          </Button>
        </div>
      </header>

      <main className="min-h-0 flex-1 print:block">
        <CvPreview data={data} variant="public" />
      </main>

      <footer className="no-print flex h-10 shrink-0 items-center justify-center border-t border-line bg-surface/60 text-xs text-fg-subtle">
        <Link href="/" className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:text-fg">
          <ApexLogo size={14} className="h-3.5 w-3.5" /> Made with ApexCV
        </Link>
      </footer>
    </div>
  );
}

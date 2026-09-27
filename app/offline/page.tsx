"use client";

import Link from "next/link";
import { RotateCcw, WifiOff } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/Button";

export default function OfflinePage() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-canvas px-6 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/10 text-warning">
        <WifiOff className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-semibold text-fg">You’re offline</h1>
      <p className="mt-2 max-w-sm text-sm text-fg-muted">
        Pages you opened recently still work. Edits made while offline are saved as soon as you reconnect.
      </p>
      <div className="mt-8 flex gap-2">
        <Button variant="primary" onClick={() => window.location.reload()}>
          <RotateCcw className="h-4 w-4" /> Try again
        </Button>
        <Link href="/app" className={buttonVariants({ variant: "outline" })}>
          Your CVs
        </Link>
      </div>
    </main>
  );
}

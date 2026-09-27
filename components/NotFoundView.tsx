"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ApexLogo } from "@/components/ui/ApexLogo";
import { buttonVariants } from "@/components/ui/Button";
import { fadeUp, stagger } from "@/lib/motion";

export function NotFoundView({ title, body, icon }: { title: string; body: string; icon?: React.ReactNode }) {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-canvas px-6 text-center">
      <motion.div variants={stagger(0.08)} initial="hidden" animate="show" className="flex max-w-sm flex-col items-center">
        <motion.div variants={fadeUp} className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-fg-muted [&>svg]:h-6 [&>svg]:w-6">
          {icon ?? <ApexLogo size={32} className="h-8 w-8" />}
        </motion.div>
        <motion.h1 variants={fadeUp} className="text-xl font-semibold text-fg">
          {title}
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-sm text-fg-muted">
          {body}
        </motion.p>
        <motion.div variants={fadeUp} className="mt-8 flex gap-2">
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            ApexCV home
          </Link>
          <Link href="/app" className={buttonVariants({ variant: "primary" })}>
            Make your own CV
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}

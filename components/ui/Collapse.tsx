"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ease } from "@/lib/motion";

/** Animates height to/from auto. */
export function Collapse({ open, children, className }: { open: boolean; children: React.ReactNode; className?: string }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1, transition: { height: { duration: 0.28, ease: ease.out }, opacity: { duration: 0.2, delay: 0.05 } } }}
          exit={{ height: 0, opacity: 0, transition: { height: { duration: 0.22, ease: ease.inOut }, opacity: { duration: 0.12 } } }}
          className="overflow-hidden"
        >
          <div className={className}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

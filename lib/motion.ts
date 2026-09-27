import type { Transition, Variants } from "motion/react";

/** Shared motion presets so every surface moves with the same physics. */
export const spring = {
  snappy: { type: "spring", stiffness: 520, damping: 38, mass: 0.8 } as Transition,
  smooth: { type: "spring", stiffness: 320, damping: 32 } as Transition,
  gentle: { type: "spring", stiffness: 200, damping: 28 } as Transition,
};

export const ease = {
  out: [0.22, 1, 0.36, 1] as [number, number, number, number],
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: ease.out } },
};

export const stagger = (staggerChildren = 0.06, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

export const popover: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: -4 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.16, ease: ease.out } },
  exit: { opacity: 0, scale: 0.97, y: -2, transition: { duration: 0.1, ease: ease.inOut } },
};

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { initialResumeData } from "@/lib/sampleData";
import { ResumeData } from "@/lib/types";
import { TemplateThumbnail } from "@/components/preview/TemplateThumbnail";

const NAME = "Maya Okafor";
const ROLE = "Senior Product Designer";
const ACCENTS = ["#0284c7", "#7c3aed", "#059669", "#e11d48"];

/**
 * A miniature, self-running editor: the name and role type themselves into the form while the
 * real template renders beside it, then the accent colour cycles. Static when motion is reduced.
 */
export function HeroDemo() {
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState(reduce ? NAME.length + ROLE.length : 0);
  const [accent, setAccent] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const total = NAME.length + ROLE.length;
    let step = 0;
    let cycle = 0;
    const timer = window.setInterval(() => {
      step += 1;
      if (step <= total) setTyped(step);
      else if (step === total + 12) {
        cycle += 1;
        setAccent(cycle % ACCENTS.length);
      } else if (step > total + 30) {
        step = 0;
        setTyped(0);
      }
    }, 85);
    return () => window.clearInterval(timer);
  }, [reduce]);

  const name = NAME.slice(0, Math.min(typed, NAME.length));
  const role = ROLE.slice(0, Math.max(0, typed - NAME.length));
  const typingName = typed < NAME.length;

  const data: ResumeData = useMemo(
    () => ({
      ...initialResumeData,
      personalInfo: {
        ...initialResumeData.personalInfo,
        fullName: name || " ",
        jobTitle: role,
        email: "maya@okafor.design",
        website: "okafor.design",
      },
      themeConfig: { ...initialResumeData.themeConfig, accentColor: ACCENTS[accent], templateId: "modern-tech" },
    }),
    [name, role, accent]
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-overlay">
      {/* window chrome */}
      <div className="flex h-9 items-center gap-1.5 border-b border-line bg-surface-2/60 px-3">
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="ml-3 hidden rounded-md bg-surface px-2 py-0.5 text-[11px] text-fg-subtle sm:inline">apexcv · Product Designer CV</span>
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-fg-subtle">
          <Check className="h-3 w-3 text-success" /> Saved
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[0.72fr_1.28fr]">
        {/* mock form */}
        <div className="hidden space-y-3 border-r border-line p-5 sm:block">
          <div className="flex gap-1.5">
            {["Personal", "Experience", "Skills"].map((t, i) => (
              <span key={t} className={`rounded-md px-2 py-1 text-[11px] font-medium ${i === 0 ? "bg-surface-2 text-fg" : "text-fg-subtle"}`}>
                {t}
              </span>
            ))}
          </div>
          <MockField label="Full name" value={name} active={typingName && !reduce} />
          <MockField label="Target role" value={role} active={!typingName && typed < NAME.length + ROLE.length && !reduce} />
          <MockField label="Email" value="maya@okafor.design" />
          <div>
            <p className="mb-1.5 text-[11px] font-medium text-fg-muted">Accent colour</p>
            <div className="flex gap-1.5">
              {ACCENTS.map((c, i) => (
                <span key={c} className="relative h-5 w-5 rounded-full" style={{ backgroundColor: c }}>
                  {i === accent && (
                    <motion.span layoutId="hero-accent" className="absolute -inset-1 rounded-full ring-2 ring-fg/60" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                  )}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-1.5 pt-2">
            <div className="h-2 w-5/6 rounded bg-surface-2" />
            <div className="h-2 w-4/6 rounded bg-surface-2" />
            <div className="h-2 w-3/4 rounded bg-surface-2" />
          </div>
        </div>

        {/* live preview */}
        <div className="bg-preview p-4 sm:p-5">
          <TemplateThumbnail data={data} aspect="crop" className="rounded-sm shadow-lifted" />
        </div>
      </div>
    </div>
  );
}

function MockField({ label, value, active }: { label: string; value: string; active?: boolean }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-medium text-fg-muted">{label}</p>
      <div
        className={`flex h-8 items-center rounded-lg border bg-surface px-2.5 text-[12px] text-fg transition-colors ${
          active ? "border-primary ring-4 ring-primary/15" : "border-line"
        }`}
      >
        <span className="truncate">{value}</span>
        {active && <span className="ml-px inline-block h-3.5 w-px animate-pulse bg-primary" />}
      </div>
    </div>
  );
}

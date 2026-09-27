"use client";

import React from "react";
import { motion } from "motion/react";
import { AlertCircle, AlertTriangle, ChevronRight, Lightbulb, ShieldCheck, Sparkles } from "lucide-react";
import { HealthIssue, HealthSeverity } from "@/lib/resumeHealth";
import { cn } from "@/lib/utils";
import { stagger, fadeUp } from "@/lib/motion";
import { Popover } from "@/components/ui/Popover";

const severityMeta: Record<HealthSeverity, { icon: React.ReactNode; tone: string; label: string }> = {
  error: { icon: <AlertCircle className="h-4 w-4" />, tone: "text-danger", label: "Fix before sending" },
  warning: { icon: <AlertTriangle className="h-4 w-4" />, tone: "text-warning", label: "Worth a look" },
  tip: { icon: <Lightbulb className="h-4 w-4" />, tone: "text-primary", label: "Suggestions" },
};

export function summarizeIssues(issues: HealthIssue[]) {
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const tips = issues.filter((i) => i.severity === "tip").length;
  return { errors, warnings, tips, blocking: errors + warnings };
}

/** Grouped list of CV issues with a "go fix it" action on each row. */
export function IssueList({
  issues,
  onFix,
  include = ["error", "warning", "tip"],
}: {
  issues: HealthIssue[];
  onFix: (issue: HealthIssue) => void;
  include?: HealthSeverity[];
}) {
  const groups = include
    .map((sev) => ({ sev, items: issues.filter((i) => i.severity === sev) }))
    .filter((g) => g.items.length > 0);

  return (
    <motion.div variants={stagger(0.03)} initial="hidden" animate="show" className="space-y-3">
      {groups.map(({ sev, items }) => (
        <div key={sev}>
          <p className="mb-1 px-2 text-xs font-medium text-fg-subtle">
            {severityMeta[sev].label} · {items.length}
          </p>
          <ul className="space-y-0.5">
            {items.map((issue) => (
              <motion.li key={issue.id} variants={fadeUp}>
                <button
                  type="button"
                  onClick={() => onFix(issue)}
                  className="group flex w-full items-start gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none"
                >
                  <span className={cn("mt-0.5 shrink-0", severityMeta[sev].tone)}>{severityMeta[sev].icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-fg">{issue.title}</span>
                    <span className="block text-[13px] text-fg-muted">{issue.message}</span>
                  </span>
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </motion.li>
            ))}
          </ul>
        </div>
      ))}
    </motion.div>
  );
}

/** Header button with a live count that opens the checks list. */
export function ChecksButton({ issues, onFix }: { issues: HealthIssue[]; onFix: (issue: HealthIssue) => void }) {
  const { errors, warnings, blocking } = summarizeIssues(issues);
  const tone = errors ? "bg-danger text-white" : warnings ? "bg-warning text-white" : "";

  return (
    <Popover
      align="end"
      ariaLabel="CV checks"
      className="w-[min(92vw,380px)] p-0"
      trigger={(props) => (
        <button
          {...props}
          type="button"
          className="relative inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label={blocking ? `CV checks: ${blocking} to review` : "CV checks: all clear"}
        >
          <ShieldCheck className={cn("h-[18px] w-[18px]", !blocking && "text-success")} />
          <span className="hidden lg:inline">Checks</span>
          {blocking > 0 && (
            <motion.span
              key={blocking}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              className={cn("min-w-[18px] rounded-full px-1 text-center text-[11px] font-semibold leading-[18px] tabular-nums", tone)}
            >
              {blocking}
            </motion.span>
          )}
        </button>
      )}
    >
      {(close) => (
        <div>
          <div className="border-b border-line px-4 py-3">
            <p className="text-sm font-semibold text-fg">CV checks</p>
            <p className="text-[13px] text-fg-muted">
              {issues.length === 0 ? "Everything looks good." : "Updated as you type. Click an item to jump to it."}
            </p>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {issues.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-8 text-center">
                <motion.div
                  initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-success/10 text-success"
                >
                  <Sparkles className="h-5 w-5" />
                </motion.div>
                <p className="text-sm font-medium text-fg">No issues found</p>
                <p className="text-[13px] text-fg-muted">Your CV is ready to download.</p>
              </div>
            ) : (
              <IssueList
                issues={issues}
                onFix={(issue) => {
                  close();
                  onFix(issue);
                }}
              />
            )}
          </div>
        </div>
      )}
    </Popover>
  );
}

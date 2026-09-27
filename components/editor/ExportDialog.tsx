"use client";

import React, { useState } from "react";
import { Download, Printer } from "lucide-react";
import { HealthIssue } from "@/lib/resumeHealth";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { IssueList, summarizeIssues } from "./ChecksPanel";

export const PRINT_TIPS_KEY = "apexcv-print-tips-seen";

export function ExportDialog({
  open,
  onClose,
  issues,
  onFix,
  onDownload,
  paperLabel,
}: {
  open: boolean;
  onClose: () => void;
  issues: HealthIssue[];
  onFix: (issue: HealthIssue) => void;
  onDownload: () => void;
  paperLabel: string;
}) {
  const [hideTips, setHideTips] = useState(false);
  const { errors, blocking } = summarizeIssues(issues);

  const download = () => {
    if (hideTips) {
      try {
        localStorage.setItem(PRINT_TIPS_KEY, "1");
      } catch {
        // ignore
      }
    }
    onDownload();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={<Download />}
      title={blocking ? "A few things before you download" : "Download your CV as PDF"}
      description={
        blocking
          ? `${blocking} ${blocking === 1 ? "item needs" : "items need"} attention. You can still download now.`
          : "Your browser’s print dialog will open with your CV ready."
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={errors ? "outline" : "primary"} onClick={download}>
            <Download className="h-4 w-4" />
            {errors ? "Download anyway" : "Download PDF"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {blocking > 0 && (
          <div className="-mx-2">
            <IssueList issues={issues} include={["error", "warning"]} onFix={(issue) => { onClose(); onFix(issue); }} />
          </div>
        )}

        <div className="rounded-2xl bg-surface-2 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-fg">
            <Printer className="h-4 w-4 text-fg-muted" /> In the print dialog
          </p>
          <ol className="list-decimal space-y-1 pl-5 text-[13px] text-fg-secondary marker:text-fg-subtle">
            <li>
              Set <strong className="font-semibold text-fg">Destination</strong> to <strong className="font-semibold text-fg">Save as PDF</strong>.
            </li>
            <li>
              Paper size <strong className="font-semibold text-fg">{paperLabel}</strong>, margins <strong className="font-semibold text-fg">None</strong>.
            </li>
            <li>
              Turn off <strong className="font-semibold text-fg">Headers and footers</strong>; turn on <strong className="font-semibold text-fg">Background graphics</strong>.
            </li>
          </ol>
          {blocking === 0 && (
            <Checkbox className="mt-3 text-[13px]" checked={hideTips} onCheckedChange={setHideTips} label="Don’t show this again" />
          )}
        </div>
      </div>
    </Modal>
  );
}

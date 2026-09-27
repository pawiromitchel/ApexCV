"use client";

import React from "react";
import { Textarea } from "@/components/ui/Textarea";
import { Field } from "@/components/ui/Field";
import { cn } from "@/lib/utils";
import { SectionHeader } from "../ItemCard";

const TARGET_WORDS = 110;

export function SummaryForm({ summary, onChange }: { summary: string; onChange: (summary: string) => void }) {
  const words = summary.trim() ? summary.trim().split(/\s+/).length : 0;
  return (
    <div className="space-y-4">
      <SectionHeader title="Summary" description="Two to four sentences: who you are, what you’re great at, and one standout result." />
      <Field
        label="Professional summary"
        aside={<span className={cn("tabular-nums", words > TARGET_WORDS && "text-warning")}>{words} / {TARGET_WORDS} words</span>}
      >
        {(p) => (
          <Textarea
            {...p}
            rows={6}
            value={summary}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Product designer with 6 years in fintech. I turn complex flows into simple ones: my checkout redesign at Adyen lifted conversion 18%…"
            className="min-h-[140px]"
          />
        )}
      </Field>
    </div>
  );
}

"use client";

import React from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { ResumeData, TemplateId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import { TemplateThumbnail } from "./TemplateThumbnail";

interface TemplateOptionProps {
  data: ResumeData;
  templateId: TemplateId;
  name: string;
  description?: string;
  active: boolean;
  onSelect: () => void;
  /** Shared layoutId so the check mark glides between options. */
  checkLayoutId: string;
  aspect?: "crop" | "page";
}

/**
 * Selectable template card. The radio button is an overlay rather than a wrapper, because
 * rendered templates contain real links and links can't be nested inside buttons.
 */
export function TemplateOption({ data, templateId, name, description, active, onSelect, checkLayoutId, aspect = "crop" }: TemplateOptionProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-surface transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-lifted",
        active ? "border-primary ring-2 ring-primary/25" : "border-line hover:border-line-strong"
      )}
    >
      <TemplateThumbnail data={data} templateId={templateId} aspect={aspect} className="border-b border-line" />
      <div className="px-3 py-2">
        <p className="text-[13px] font-semibold text-fg">{name}</p>
        {description && <p className="truncate text-xs text-fg-muted">{description}</p>}
      </div>
      {active && (
        <motion.span
          layoutId={checkLayoutId}
          transition={spring.snappy}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-fg shadow-lifted"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </motion.span>
      )}
      <button
        type="button"
        role="radio"
        aria-checked={active}
        aria-label={description ? `${name}: ${description}` : name}
        onClick={onSelect}
        className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/60"
      />
    </div>
  );
}

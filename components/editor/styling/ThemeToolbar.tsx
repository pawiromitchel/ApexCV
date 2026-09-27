"use client";

import React, { useDeferredValue, useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { FontFamily, FontSizeScale, PageSize, ResumeData, SpacingScale, TemplateId, ThemeConfig } from "@/lib/types";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TemplateOption } from "@/components/preview/TemplateOption";

interface ThemeToolbarProps {
  data: ResumeData;
  onChange: (updated: Partial<ThemeConfig>) => void;
}

export const TEMPLATES: Array<{ id: TemplateId; name: string; desc: string }> = [
  { id: "modern-tech", name: "Modern", desc: "Clean, with skill pills" },
  { id: "executive", name: "Executive", desc: "Formal serif, centred header" },
  { id: "creative", name: "Creative", desc: "Bold colour banner" },
  { id: "sidebar", name: "Sidebar", desc: "Two columns, dense" },
  { id: "ats-classic", name: "Classic ATS", desc: "Plain single column" },
];

const FONTS: Array<{ id: FontFamily; label: string; sample: string; className: string }> = [
  { id: "inter", label: "Inter", sample: "Modern sans", className: "font-sans" },
  { id: "plus-jakarta", label: "Plus Jakarta", sample: "Geometric sans", className: "font-[family-name:var(--font-plus-jakarta)]" },
  { id: "merriweather", label: "Merriweather", sample: "Classic serif", className: "font-serif" },
  { id: "playfair", label: "Playfair", sample: "Editorial serif", className: "font-[family-name:var(--font-playfair)]" },
  { id: "roboto-mono", label: "Roboto Mono", sample: "Monospace", className: "font-mono" },
];

const COLORS = [
  { name: "Blue", hex: "#0284c7" },
  { name: "Indigo", hex: "#4f46e5" },
  { name: "Violet", hex: "#7c3aed" },
  { name: "Rose", hex: "#e11d48" },
  { name: "Amber", hex: "#d97706" },
  { name: "Emerald", hex: "#059669" },
  { name: "Teal", hex: "#0f766e" },
  { name: "Slate", hex: "#334155" },
];

function Group({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-fg">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function ThemeToolbar({ data, onChange }: ThemeToolbarProps) {
  const theme = data.themeConfig;
  // Thumbnails re-render with the CV; defer so typing elsewhere never waits on them
  const deferred = useDeferredValue(data);
  const [hex, setHex] = useState(theme.accentColor || "#0284c7");
  useEffect(() => setHex(theme.accentColor || "#0284c7"), [theme.accentColor]);

  const isPreset = COLORS.some((c) => c.hex.toLowerCase() === theme.accentColor?.toLowerCase());

  return (
    <div className="space-y-8 pb-6">
      <Group title="Template">
        <div role="radiogroup" aria-label="Template" className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {TEMPLATES.map((t) => (
            <TemplateOption
              key={t.id}
              data={deferred}
              templateId={t.id}
              name={t.name}
              description={t.desc}
              active={theme.templateId === t.id}
              onSelect={() => onChange({ templateId: t.id })}
              checkLayoutId="template-check"
            />
          ))}
        </div>
      </Group>

      <Group title="Accent colour">
        <div className="flex flex-wrap items-center gap-2.5">
          {COLORS.map((c) => {
            const active = theme.accentColor?.toLowerCase() === c.hex.toLowerCase();
            return (
              <button
                key={c.hex}
                type="button"
                aria-label={c.name}
                aria-pressed={active}
                title={c.name}
                onClick={() => onChange({ accentColor: c.hex })}
                className="relative flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                style={{ backgroundColor: c.hex }}
              >
                {active && (
                  <motion.span
                    layoutId="accent-ring"
                    transition={spring.snappy}
                    className="absolute -inset-1 rounded-full ring-2 ring-fg/70"
                  />
                )}
                {active && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
              </button>
            );
          })}
          <label
            className={cn(
              "flex h-8 items-center gap-2 rounded-full border pl-1 pr-3 text-[13px] text-fg-secondary transition-colors",
              !isPreset ? "border-primary" : "border-line hover:border-line-strong"
            )}
          >
            <span className="relative h-6 w-6 overflow-hidden rounded-full" style={{ backgroundColor: hex }}>
              <input
                type="color"
                aria-label="Custom colour"
                value={/^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#0284c7"}
                onChange={(e) => onChange({ accentColor: e.target.value })}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </span>
            <input
              aria-label="Hex colour"
              value={hex}
              onChange={(e) => {
                setHex(e.target.value);
                if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onChange({ accentColor: e.target.value });
              }}
              className="w-[4.5rem] bg-transparent font-mono text-xs uppercase text-fg focus:outline-none"
            />
          </label>
        </div>
      </Group>

      <Group title="Font">
        <div role="radiogroup" aria-label="Font" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {FONTS.map((f) => {
            const active = theme.fontFamily === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange({ fontFamily: f.id })}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                  active ? "border-primary bg-primary/5" : "border-line hover:border-line-strong hover:bg-surface-2"
                )}
              >
                <span>
                  <span className={cn("block text-[15px] text-fg", f.className)}>{f.label}</span>
                  <span className="block text-xs text-fg-muted">{f.sample}</span>
                </span>
                {active && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </Group>

      <Group title="Layout">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <LayoutOption label="Paper size">
            <SegmentedControl<PageSize>
              ariaLabel="Paper size"
              fullWidth
              value={theme.pageSize ?? "a4"}
              onChange={(pageSize) => onChange({ pageSize })}
              options={[
                { value: "a4", label: "A4" },
                { value: "letter", label: "US Letter" },
              ]}
            />
          </LayoutOption>
          <LayoutOption label="Text size">
            <SegmentedControl<FontSizeScale>
              ariaLabel="Text size"
              fullWidth
              value={theme.fontSize}
              onChange={(fontSize) => onChange({ fontSize })}
              options={[
                { value: "sm", label: "Small" },
                { value: "base", label: "Medium" },
                { value: "lg", label: "Large" },
              ]}
            />
          </LayoutOption>
          <LayoutOption label="Page margins">
            <SegmentedControl<SpacingScale>
              ariaLabel="Page margins"
              fullWidth
              value={theme.documentMargins}
              onChange={(documentMargins) => onChange({ documentMargins })}
              options={[
                { value: "compact", label: "Narrow" },
                { value: "standard", label: "Normal" },
                { value: "spacious", label: "Wide" },
              ]}
            />
          </LayoutOption>
          <LayoutOption label="Section spacing">
            <SegmentedControl<SpacingScale>
              ariaLabel="Section spacing"
              fullWidth
              value={theme.spacing}
              onChange={(spacing) => onChange({ spacing })}
              options={[
                { value: "compact", label: "Compact" },
                { value: "standard", label: "Normal" },
                { value: "spacious", label: "Airy" },
              ]}
            />
          </LayoutOption>
        </div>
      </Group>
    </div>
  );
}

function LayoutOption({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[13px] font-medium text-fg-secondary">{label}</p>
      {children}
    </div>
  );
}

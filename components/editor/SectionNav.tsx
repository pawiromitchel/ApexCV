"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { EyeOff, ListOrdered, Plus } from "lucide-react";
import { ResumeData } from "@/lib/types";
import { HealthIssue, sectionCompletion } from "@/lib/resumeHealth";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import { IconButton } from "@/components/ui/Button";
import { Menu, MenuItem, MenuLabel, MenuSeparator } from "@/components/ui/Popover";
import { OPTIONAL_SECTIONS, SECTION_META, navigableSections, sectionIcon, sectionLabel } from "./sections";

interface SectionNavProps {
  data: ResumeData;
  active: string;
  issues: HealthIssue[];
  onSelect: (key: string) => void;
  onAddSection: (key: string) => void;
  onAddCustom: () => void;
  onOrganize: () => void;
}

function isActiveKey(key: string, active: string) {
  return key === active || (key === "customSections" && active.startsWith("sec_"));
}

/** Always-visible section list in the CV's own order, with completion and issue dots. */
export function SectionNav({ data, active, issues, onSelect, onAddSection, onAddCustom, onOrganize }: SectionNavProps) {
  const keys = navigableSections(data);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const missing = OPTIONAL_SECTIONS.filter((k) => !data.sectionOrder.includes(k));

  // Fade the edges that have more chips beyond them
  const [edges, setEdges] = useState({ left: false, right: false });
  const measureEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setEdges({ left: el.scrollLeft > 2, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 });
  }, []);
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    measureEdges();
    const ro = new ResizeObserver(measureEdges);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measureEdges, keys.length]);

  // Centre the active chip so its neighbours (especially "next") stay visible.
  // Scroll only the chip row; scrollIntoView would also nudge the page vertically.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const chip = scroller?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!scroller || !chip) return;
    const target = chip.offsetLeft - (scroller.clientWidth - chip.offsetWidth) / 2;
    scroller.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [active]);

  return (
    <nav aria-label="CV sections" className="flex items-center gap-1.5">
      <div
        ref={scrollerRef}
        onScroll={measureEdges}
        className="no-scrollbar relative -my-1 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scroll-smooth py-1"
        style={{
          maskImage: `linear-gradient(to right, ${edges.left ? "transparent, black 28px" : "black, black"}, ${edges.right ? "black calc(100% - 36px), transparent" : "black, black"})`,
          WebkitMaskImage: `linear-gradient(to right, ${edges.left ? "transparent, black 28px" : "black, black"}, ${edges.right ? "black calc(100% - 36px), transparent" : "black, black"})`,
        }}
      >
        {keys.map((key) => {
          const Icon = sectionIcon(key);
          const activeChip = isActiveKey(key, active);
          const hidden = data.hiddenSections?.includes(key);
          const sectionIssues = issues.filter((i) => i.section === key || (key === "customSections" && i.section.startsWith("sec_")));
          const errors = sectionIssues.filter((i) => i.severity === "error").length;
          const warnings = sectionIssues.filter((i) => i.severity === "warning").length;
          const completion = sectionCompletion(data, key);
          const dot = errors
            ? { cls: "bg-danger", label: `${errors} to fix` }
            : warnings
            ? { cls: "bg-warning", label: `${warnings} to review` }
            : completion === "complete"
            ? { cls: "bg-success", label: "Complete" }
            : completion === "partial"
            ? { cls: "bg-primary/70", label: "In progress" }
            : { cls: "bg-transparent ring-1 ring-inset ring-fg-subtle/60", label: "Empty" };

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              aria-current={activeChip ? "step" : undefined}
              title={`${sectionLabel(key, data)} · ${hidden ? "Hidden from CV" : dot.label}`}
              className={cn(
                "relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                activeChip ? "text-fg" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                hidden && "opacity-60"
              )}
            >
              {activeChip && (
                <motion.span
                  layoutId="section-nav-active"
                  transition={spring.snappy}
                  className="absolute inset-0 rounded-lg bg-surface shadow-soft ring-1 ring-line-strong"
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-1.5">
                {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                <span className="whitespace-nowrap">{sectionLabel(key, data)}</span>
                <span className={cn("h-1.5 w-1.5 rounded-full", dot.cls)} aria-hidden />
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex shrink-0 items-center gap-0.5 border-l border-line pl-1.5">
        <Menu
          align="end"
          ariaLabel="Add section"
          trigger={(props) => (
            <IconButton {...props} label="Add section">
              <Plus className="h-4 w-4" />
            </IconButton>
          )}
        >
          {missing.length > 0 && <MenuLabel>Add a section</MenuLabel>}
          {missing.map((key) => {
            const Icon = SECTION_META[key].icon;
            return (
              <MenuItem key={key} icon={<Icon />} onSelect={() => onAddSection(key)}>
                {SECTION_META[key].label}
              </MenuItem>
            );
          })}
          {missing.length > 0 && <MenuSeparator />}
          <MenuItem icon={<Plus />} onSelect={onAddCustom}>
            Custom section…
          </MenuItem>
        </Menu>
        <IconButton label="Reorder or hide sections" onClick={onOrganize}>
          <ListOrdered className="h-4 w-4" />
        </IconButton>
      </div>
    </nav>
  );
}

"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Maximize2, MousePointerClick, ZoomIn, ZoomOut } from "lucide-react";
import { ResumeData, FocusedTarget, PageSize } from "@/lib/types";
import { pageSizeOf } from "@/lib/pageSize";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ModernTechTemplate } from "./templates/ModernTechTemplate";
import { ExecutiveTemplate } from "./templates/ExecutiveTemplate";
import { CreativeTemplate } from "./templates/CreativeTemplate";
import { SidebarTemplate } from "./templates/SidebarTemplate";
import { AtsClassicTemplate } from "./templates/AtsClassicTemplate";

export const TEMPLATE_NAMES: Record<string, string> = {
  "modern-tech": "Modern",
  executive: "Executive",
  creative: "Creative",
  sidebar: "Sidebar",
  "ats-classic": "Classic ATS",
};

export interface EditTarget {
  section: string;
  itemId?: string;
}

interface CvPreviewProps {
  data: ResumeData;
  focusedTarget?: FocusedTarget | null;
  /** Enables click-to-edit on the sheet. */
  onEditTarget?: (target: EditTarget) => void;
  onPageCountChange?: (pages: number) => void;
  onPageSizeChange?: (size: PageSize) => void;
  /** "public" hides editing affordances and page markers. */
  variant?: "editor" | "public";
}

/** Strips hidden sections and entries so templates only render what should print. */
export function visibleResume(data: ResumeData): ResumeData {
  return {
    ...data,
    experience: data.experience?.filter((item) => item.visible !== false) || [],
    education: data.education?.filter((item) => item.visible !== false) || [],
    skills: data.skills?.filter((item) => item.visible !== false) || [],
    languages: data.languages?.filter((item) => item.visible !== false && item.name?.trim()) || [],
    projects: data.projects?.filter((item) => item.visible !== false) || [],
    certifications:
      data.certifications?.filter((item) => item.visible !== false && (item.name?.trim() || item.issuer?.trim())) || [],
    customSections:
      data.customSections
        ?.map((section) => ({ ...section, items: section.items?.filter((item) => item.visible !== false) || [] }))
        .filter((section) => section.visible !== false) || [],
    sectionOrder: data.sectionOrder?.filter((key) => !data.hiddenSections?.includes(key)) || [],
  };
}

export function renderTemplate(data: ResumeData, focusedTarget?: FocusedTarget | null) {
  switch (data.themeConfig.templateId) {
    case "executive":
      return <ExecutiveTemplate data={data} focusedTarget={focusedTarget} />;
    case "creative":
      return <CreativeTemplate data={data} focusedTarget={focusedTarget} />;
    case "sidebar":
      return <SidebarTemplate data={data} focusedTarget={focusedTarget} />;
    case "ats-classic":
      return <AtsClassicTemplate data={data} focusedTarget={focusedTarget} />;
    case "modern-tech":
    default:
      return <ModernTechTemplate data={data} focusedTarget={focusedTarget} />;
  }
}

export function fontFamilyClass(font: ResumeData["themeConfig"]["fontFamily"]) {
  switch (font) {
    case "merriweather":
      return "font-serif";
    case "roboto-mono":
      return "font-mono";
    case "playfair":
      return "font-serif tracking-wide";
    default:
      return "font-sans";
  }
}

const MIN_ZOOM = 35;
const MAX_ZOOM = 150;

export function CvPreview({
  data,
  focusedTarget,
  onEditTarget,
  onPageCountChange,
  onPageSizeChange,
  variant = "editor",
}: CvPreviewProps) {
  const paper = pageSizeOf(data.themeConfig.pageSize);
  const [zoom, setZoom] = useState(80);
  const [autoFit, setAutoFit] = useState(true);
  const [contentHeight, setContentHeight] = useState(paper.heightPx);
  const containerRef = useRef<HTMLDivElement>(null);
  const templateRef = useRef<HTMLDivElement>(null);

  const pages = Math.max(1, Math.ceil((contentHeight - 4) / paper.heightPx));
  const sheetHeight = pages * paper.heightPx;
  const scale = zoom / 100;

  const fitZoom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return 80;
    const padding = el.clientWidth < 640 ? 24 : 64;
    const fit = Math.floor(((el.clientWidth - padding) / paper.widthPx) * 100);
    return Math.max(MIN_ZOOM, Math.min(fit, 100));
  }, [paper.widthPx]);

  // Keep the sheet fitted to the panel while auto-fit is on
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const apply = () => {
      if (autoFit && el.clientWidth > 0) setZoom(fitZoom());
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [autoFit, fitZoom]);

  // Measure rendered content to count pages
  useLayoutEffect(() => {
    const el = templateRef.current;
    if (!el) return;
    const measure = () => setContentHeight(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    onPageCountChange?.(pages);
  }, [pages, onPageCountChange]);

  // Print uses the same paper size as the preview
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--sheet-w", paper.width);
    root.style.setProperty("--sheet-h", paper.height);
    return () => {
      root.style.removeProperty("--sheet-w");
      root.style.removeProperty("--sheet-h");
    };
  }, [paper.width, paper.height]);

  const setManualZoom = (next: number) => {
    setAutoFit(false);
    setZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, next)));
  };

  const handleSheetClick = (e: React.MouseEvent) => {
    if (!onEditTarget) return;
    const target = e.target as HTMLElement;
    if (target.closest("a")) e.preventDefault();
    const sectionEl = target.closest<HTMLElement>("[data-edit-section]");
    const itemEl = target.closest<HTMLElement>("[data-edit-item]");
    const section = sectionEl?.dataset.editSection;
    if (!section) return;
    onEditTarget({ section, itemId: itemEl && sectionEl?.contains(itemEl) ? itemEl.dataset.editItem : undefined });
  };

  const isEditor = variant === "editor";
  const visible = visibleResume(data);

  return (
    <div className="relative flex h-full flex-1 flex-col overflow-hidden bg-preview">
      <style>{`@media print { @page { size: ${paper.css} portrait; margin: 0; } }`}</style>

      {/* Toolbar */}
      <div className="no-print flex h-12 shrink-0 items-center justify-between gap-2 border-b border-line bg-surface/70 px-3 backdrop-blur-md sm:px-4">
        <div className="flex min-w-0 items-center gap-2 text-[13px]">
          {isEditor && (
            <span className="truncate font-medium text-fg-secondary">
              {TEMPLATE_NAMES[data.themeConfig.templateId] ?? "Template"}
            </span>
          )}
          {isEditor && (
            <>
              <span className="text-fg-subtle" aria-hidden>
                ·
              </span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={pages}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className={cn("whitespace-nowrap tabular-nums", pages > 2 ? "font-medium text-warning" : "text-fg-muted")}
                  aria-live="polite"
                >
                  {pages} {pages === 1 ? "page" : "pages"}
                </motion.span>
              </AnimatePresence>
              {onPageSizeChange && (
                <SegmentedControl<PageSize>
                  ariaLabel="Paper size"
                  size="sm"
                  className="ml-1 hidden sm:inline-flex"
                  value={data.themeConfig.pageSize ?? "a4"}
                  onChange={onPageSizeChange}
                  options={[
                    { value: "a4", label: "A4" },
                    { value: "letter", label: "Letter", ariaLabel: "US Letter" },
                  ]}
                />
              )}
              {onEditTarget && (
                <span className="ml-2 hidden items-center gap-1 text-xs text-fg-subtle 2xl:inline-flex">
                  <MousePointerClick className="h-3.5 w-3.5" /> Click the page to edit
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-0.5 rounded-xl bg-surface-2 p-0.5">
          <IconButton label="Zoom out" onClick={() => setManualZoom(zoom - 10)} disabled={zoom <= MIN_ZOOM} className="h-7 w-7">
            <ZoomOut className="h-3.5 w-3.5" />
          </IconButton>
          <span className="w-10 select-none text-center text-xs font-medium tabular-nums text-fg-secondary">{zoom}%</span>
          <IconButton label="Zoom in" onClick={() => setManualZoom(zoom + 10)} disabled={zoom >= MAX_ZOOM} className="h-7 w-7">
            <ZoomIn className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton
            label="Fit to width"
            onClick={() => {
              setAutoFit(true);
              setZoom(fitZoom());
            }}
            className={cn("h-7 w-7", autoFit && "bg-surface text-primary shadow-soft")}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="cv-preview-container flex flex-1 items-start justify-center overflow-auto p-3 sm:p-8">
        <div
          className="shrink-0 transition-[width,height] duration-200 ease-out"
          style={{ width: paper.widthPx * scale, height: sheetHeight * scale }}
        >
          <div
            className="cv-zoom-wrapper origin-top-left transition-transform duration-200 ease-out"
            style={{ transform: `scale(${scale})`, width: paper.widthPx }}
          >
            <div
              id="cv-printable-sheet"
              onClick={handleSheetClick}
              className={cn(
                "cv-sheet overflow-hidden rounded-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_12px_40px_-12px_rgba(0,0,0,0.35)]",
                fontFamilyClass(data.themeConfig.fontFamily),
                onEditTarget && "cv-editable"
              )}
              style={{ width: paper.width, minHeight: sheetHeight }}
            >
              <div ref={templateRef}>{renderTemplate(visible, focusedTarget)}</div>

              {/* Page break markers (screen only) */}
              {isEditor &&
                Array.from({ length: pages - 1 }, (_, i) => (
                  <div
                    key={i}
                    aria-hidden
                    className="no-print pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-sky-500/50"
                    style={{ top: (i + 1) * paper.heightPx }}
                  >
                    <span className="absolute right-2 top-1 rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                      Page {i + 2}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

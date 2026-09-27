"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import { ResumeData, TemplateId } from "@/lib/types";
import { pageSizeOf } from "@/lib/pageSize";
import { cn } from "@/lib/utils";
import { fontFamilyClass, renderTemplate, visibleResume } from "./CvPreview";

interface TemplateThumbnailProps {
  data: ResumeData;
  /** Render with a different template than the CV's own. */
  templateId?: TemplateId;
  className?: string;
  /** Crop to the top of the first page (default) or show the whole first page. */
  aspect?: "crop" | "page";
}

/** A live, scaled-down, non-interactive render of a CV. */
export const TemplateThumbnail = memo(function TemplateThumbnail({
  data,
  templateId,
  className,
  aspect = "crop",
}: TemplateThumbnailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);
  const paper = pageSizeOf(data.themeConfig.pageSize);
  const themed: ResumeData = templateId ? { ...data, themeConfig: { ...data.themeConfig, templateId } } : data;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // inert keeps thumbnail links out of the tab order (React 18 has no inert prop)
    el.setAttribute("inert", "");
    const update = () => el.clientWidth > 0 && setScale(el.clientWidth / paper.widthPx);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [paper.widthPx]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none relative w-full overflow-hidden bg-white select-none", className)}
      style={{ aspectRatio: aspect === "page" ? `${paper.widthPx} / ${paper.heightPx}` : "4 / 3" }}
    >
      <div
        className={cn("absolute left-0 top-0 origin-top-left", fontFamilyClass(themed.themeConfig.fontFamily))}
        style={{ width: paper.widthPx, transform: `scale(${scale})` }}
      >
        {renderTemplate(visibleResume(themed))}
      </div>
    </div>
  );
});

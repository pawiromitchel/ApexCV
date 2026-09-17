"use client";

import React, { useState, useRef } from "react";
import { ResumeData } from "@/lib/types";
import { ModernTechTemplate } from "./templates/ModernTechTemplate";
import { ExecutiveTemplate } from "./templates/ExecutiveTemplate";
import { CreativeTemplate } from "./templates/CreativeTemplate";
import { SidebarTemplate } from "./templates/SidebarTemplate";
import { AtsClassicTemplate } from "./templates/AtsClassicTemplate";
import { ZoomIn, ZoomOut, Maximize2, FileText, Sparkles } from "lucide-react";

interface CvPreviewProps {
  data: ResumeData;
}

export function CvPreview({ data }: CvPreviewProps) {
  const [zoom, setZoom] = useState<number>(85); // 85% default fits nicely on desktop
  const previewRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
  const handleFit = () => setZoom(80);

  // Font family mapping
  const getFontFamilyClass = () => {
    switch (data.themeConfig.fontFamily) {
      case "merriweather":
        return "font-serif";
      case "roboto-mono":
        return "font-mono";
      case "playfair":
        return "font-serif tracking-wide";
      case "plus-jakarta":
      case "inter":
      default:
        return "font-sans";
    }
  };

  const renderTemplate = () => {
    switch (data.themeConfig.templateId) {
      case "executive":
        return <ExecutiveTemplate data={data} />;
      case "creative":
        return <CreativeTemplate data={data} />;
      case "sidebar":
        return <SidebarTemplate data={data} />;
      case "ats-classic":
        return <AtsClassicTemplate data={data} />;
      case "modern-tech":
      default:
        return <ModernTechTemplate data={data} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/60 overflow-hidden relative">
      {/* Top Preview Status Bar & Zoom Controls */}
      <div className="no-print h-12 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 flex items-center justify-between z-10 flex-shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-300">Live Preview</span>
          <span className="text-slate-600">•</span>
          <span className="capitalize">{data.themeConfig.templateId.replace("-", " ")}</span>
          <span className="text-slate-600">•</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            A4 Standard
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 shadow-inner">
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono font-medium text-slate-300 w-10 text-center select-none">
            {zoom}%
          </span>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-3.5 bg-slate-800 mx-0.5" />
          <button
            onClick={handleFit}
            title="Fit to Screen"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sheet Canvas with smooth scroll and scaling */}
      <div
        ref={previewRef}
        className="cv-preview-container flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start"
      >
        <div
          className="cv-zoom-wrapper transition-transform duration-150 ease-out origin-top"
          style={{
            transform: `scale(${zoom / 100})`,
            marginBottom: `${Math.max(0, (zoom / 100 - 1) * 320)}px`,
          }}
        >
          <div
            id="cv-printable-sheet"
            className={`cv-sheet rounded-md overflow-hidden ${getFontFamilyClass()}`}
          >
            {renderTemplate()}
          </div>
        </div>
      </div>
    </div>
  );
}

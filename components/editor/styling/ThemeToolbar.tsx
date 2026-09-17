"use client";

import React from "react";
import { ThemeConfig, TemplateId, FontFamily, FontSizeScale, SpacingScale } from "@/lib/types";
import { Palette, Type, Sliders, Check, UserCheck, ShieldCheck } from "lucide-react";

interface ThemeToolbarProps {
  theme: ThemeConfig;
  onChange: (updated: Partial<ThemeConfig>) => void;
}

const templates: Array<{ id: TemplateId; name: string; tag: string; desc: string }> = [
  { id: "modern-tech", name: "Modern Tech", tag: "POPULAR", desc: "Clean layout with tech pills & crisp dates" },
  { id: "executive", name: "Executive Classic", tag: "FORMAL", desc: "Refined corporate authority & serif profile" },
  { id: "creative", name: "Creative Grid", tag: "BOLD", desc: "Dynamic accent banner & portfolio showcase" },
  { id: "sidebar", name: "Compact Sidebar", tag: "HIGH DENSITY", desc: "Structured 2-column with left skills bar" },
  { id: "ats-classic", name: "Harvard ATS", tag: "100% ATS", desc: "Zero-fail parsable standard single-column" },
];

const fonts: Array<{ id: FontFamily; label: string; previewClass: string }> = [
  { id: "inter", label: "Inter (Modern Sans)", previewClass: "font-sans" },
  { id: "merriweather", label: "Merriweather (Classic Serif)", previewClass: "font-serif" },
  { id: "roboto-mono", label: "Roboto Mono (Code/Tech)", previewClass: "font-mono" },
  { id: "plus-jakarta", label: "Plus Jakarta (Geometric)", previewClass: "font-sans font-semibold" },
  { id: "playfair", label: "Playfair (Editorial)", previewClass: "font-serif tracking-wider" },
];

const colorPresets = [
  { name: "Sky Blue", hex: "#0284c7" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Indigo", hex: "#6366f1" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Teal", hex: "#0f766e" },
  { name: "Amber", hex: "#d97706" },
  { name: "Violet", hex: "#7c3aed" },
  { name: "Slate", hex: "#334155" },
];

export function ThemeToolbar({ theme, onChange }: ThemeToolbarProps) {
  return (
    <div className="space-y-6">
      {/* 1. Template Selector */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
          <Palette className="w-3.5 h-3.5 text-sky-400" />
          <span>Select CV Template ({templates.length} Styles)</span>
        </label>
        <div className="grid grid-cols-1 gap-2">
          {templates.map((tmpl) => {
            const isSelected = theme.templateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => onChange({ templateId: tmpl.id })}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-slate-800/90 border-sky-500 shadow-md shadow-sky-500/10 ring-1 ring-sky-500"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">
                      {tmpl.name}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 border border-sky-500/20">
                      {tmpl.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {tmpl.desc}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center text-slate-950 flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Accent Color Palette */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>Accent Color & Branding</span>
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {colorPresets.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => onChange({ accentColor: c.hex })}
              title={c.name}
              className={`w-7 h-7 rounded-full transition-transform relative flex items-center justify-center ${
                theme.accentColor === c.hex
                  ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900"
                  : "hover:scale-105 opacity-90 hover:opacity-100"
              }`}
              style={{ backgroundColor: c.hex }}
            >
              {theme.accentColor === c.hex && (
                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
              )}
            </button>
          ))}

          {/* Custom Hex Picker Input */}
          <div className="flex items-center gap-1.5 ml-2 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
            <span className="text-[10px] text-slate-400 font-mono">Custom:</span>
            <input
              type="color"
              value={theme.accentColor}
              onChange={(e) => onChange({ accentColor: e.target.value })}
              className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent"
              title="Pick custom color"
            />
          </div>
        </div>
      </div>

      {/* 3. Typography Selection */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
          <Type className="w-3.5 h-3.5 text-indigo-400" />
          <span>Typography / Font Family</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {fonts.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onChange({ fontFamily: f.id })}
              className={`px-3 py-2 rounded-xl border text-left text-xs transition-all ${
                theme.fontFamily === f.id
                  ? "bg-slate-800 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className={f.previewClass}>{f.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Spacing & Density */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Section Spacing
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(["compact", "standard", "spacious"] as SpacingScale[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ spacing: s })}
                className={`py-1.5 text-[11px] font-semibold rounded-lg capitalize transition-all ${
                  theme.spacing === s
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Profile Photo
          </label>
          <button
            type="button"
            onClick={() => onChange({ showAvatar: !theme.showAvatar })}
            className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
              theme.showAvatar
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <span>Show Photo / Avatar</span>
            <div
              className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                theme.showAvatar
                  ? "bg-emerald-500 border-emerald-400 text-slate-950"
                  : "border-slate-700"
              }`}
            >
              {theme.showAvatar && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

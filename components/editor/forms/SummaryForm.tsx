"use client";

import React from "react";
import { Sparkles, HelpCircle } from "lucide-react";

interface SummaryFormProps {
  summary: string;
  onChange: (summary: string) => void;
}

export function SummaryForm({ summary, onChange }: SummaryFormProps) {
  const wordCount = summary.trim() ? summary.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Professional Summary / Bio</span>
        </label>
        <span className="text-[11px] text-slate-500 font-mono">
          {wordCount} words / ~3-5 sentences recommended
        </span>
      </div>

      <textarea
        rows={6}
        value={summary}
        onChange={(e) => onChange(e.target.value)}
        placeholder="A brief 3-5 sentence highlight of your career achievements, core technical expertise, and what value you bring to your next employer..."
        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 leading-relaxed transition-colors"
      />

      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
        <HelpCircle className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">ATS Pro Tip: </span>
          Include 2-3 specific technical keywords and quantifiable impact metrics (e.g., "scaled to 10M+ users", "reduced latency by 40%").
        </div>
      </div>
    </div>
  );
}

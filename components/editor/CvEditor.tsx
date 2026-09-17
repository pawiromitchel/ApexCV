"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ResumeData, ThemeConfig } from "@/lib/types";
import { CvPreview } from "@/components/preview/CvPreview";
import { SectionList } from "./SectionList";
import { ThemeToolbar } from "./styling/ThemeToolbar";
import { PersonalInfoForm } from "./forms/PersonalInfoForm";
import { SummaryForm } from "./forms/SummaryForm";
import { ExperienceForm } from "./forms/ExperienceForm";
import { EducationForm } from "./forms/EducationForm";
import { SkillsForm } from "./forms/SkillsForm";
import { ProjectsForm } from "./forms/ProjectsForm";
import { CertificationsForm } from "./forms/CertificationsForm";
import {
  Save,
  Download,
  Copy,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  SlidersHorizontal,
  Edit2,
  Check,
  Share2,
} from "lucide-react";

interface CvEditorProps {
  initialData: ResumeData;
}

export function CvEditor({ initialData }: CvEditorProps) {
  const router = useRouter();
  const [data, setData] = useState<ResumeData>(initialData);
  const [activeSection, setActiveSection] = useState<string>("personal");
  const [activeTab, setActiveTab] = useState<"content" | "design">("content");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSavedAt, setLastSavedAt] = useState<string>("just now");
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [titleInput, setTitleInput] = useState<string>(initialData.title);
  const [isDuplicating, setIsDuplicating] = useState<boolean>(false);

  // Debounced auto-save timer ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  // Auto-save logic
  const saveResumeToServer = useCallback(async (currentData: ResumeData) => {
    try {
      setSaveStatus("saving");
      const res = await fetch(`/api/resumes/${currentData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentData),
      });

      if (res.ok) {
        setSaveStatus("saved");
        const timeStr = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        setLastSavedAt(timeStr);
      } else {
        setSaveStatus("unsaved");
      }
    } catch (err) {
      console.error("Auto-save error:", err);
      setSaveStatus("unsaved");
    }
  }, []);

  // Watch for data changes to trigger debounced auto-save (800ms)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSaveStatus("unsaved");
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveResumeToServer(data);
    }, 800);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [data, saveResumeToServer]);

  // Update handlers
  const updateData = (partial: Partial<ResumeData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const updatePersonalInfo = (partial: any) => {
    setData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...partial },
    }));
  };

  const updateTheme = (partial: Partial<ThemeConfig>) => {
    setData((prev) => ({
      ...prev,
      themeConfig: { ...prev.themeConfig, ...partial },
    }));
  };

  const handleDuplicate = async () => {
    try {
      setIsDuplicating(true);
      const res = await fetch(`/api/resumes/${data.id}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `${data.title} (Copy)` }),
      });
      const result = await res.json();
      if (result.success && result.resume) {
        router.push(`/app/${result.resume.id}`);
      }
    } catch (err) {
      console.error("Duplication failed:", err);
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleTitleSubmit = () => {
    if (titleInput.trim() && titleInput !== data.title) {
      updateData({ title: titleInput.trim() });
    }
    setIsRenaming(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top Main Navigation Bar */}
      <header className="no-print h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-30">
        {/* Left: Back & Title Edit */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/app"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">All CVs</span>
          </Link>

          <div className="h-4 w-[1px] bg-slate-800" />

          {/* Inline Rename CV */}
          <div className="flex items-center gap-2 min-w-0">
            {isRenaming ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={titleInput}
                  autoFocus
                  onChange={(e) => setTitleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTitleSubmit();
                    if (e.key === "Escape") setIsRenaming(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-sky-500 text-xs font-bold text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleTitleSubmit}
                  className="p-1 rounded-lg bg-sky-500 text-slate-950 hover:bg-sky-400"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsRenaming(true)}
                className="group flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-900 transition-colors truncate"
              >
                <span className="font-extrabold text-sm text-white truncate max-w-[200px] sm:max-w-xs">
                  {data.title}
                </span>
                <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-sky-400 flex-shrink-0 transition-colors" />
              </div>
            )}
          </div>
        </div>

        {/* Center: Live Autosave Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-medium text-slate-400">
          {saveStatus === "saving" ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400">Autosaving changes...</span>
            </>
          ) : saveStatus === "saved" ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Saved to Cloud ({lastSavedAt})</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span>Unsaved changes</span>
            </>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Duplicate Button */}
          <button
            type="button"
            disabled={isDuplicating}
            onClick={handleDuplicate}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all"
            title="Create a duplicate copy of this CV"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{isDuplicating ? "Copying..." : "Duplicate"}</span>
          </button>

          {/* Manual Save Button */}
          <button
            type="button"
            onClick={() => saveResumeToServer(data)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Download / Print PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </header>

      {/* Main Split Screen Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Form Editor & Controls */}
        <div className="no-print w-full lg:w-[48%] xl:w-[42%] flex flex-col border-r border-slate-800 bg-slate-950/90 z-20 flex-shrink-0">
          {/* Editor Header Navigation Tabs: Content vs Design */}
          <div className="h-12 border-b border-slate-800 bg-slate-900/40 px-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("content")}
                className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "content"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Content & Sections
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("design")}
                className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "design"
                    ? "bg-slate-800 text-sky-400 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Templates & Theme</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-medium">
              Autosaves in background
            </div>
          </div>

          {/* Scrollable Form Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {activeTab === "design" ? (
              /* Design / Styling Tab */
              <ThemeToolbar theme={data.themeConfig} onChange={updateTheme} />
            ) : (
              /* Content Editor Tab */
              <div className="space-y-6">
                {/* 1. Drag & Drop Section Reordering */}
                <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                  <SectionList
                    sectionOrder={data.sectionOrder}
                    activeSection={activeSection}
                    onSelectSection={(key) => setActiveSection(key)}
                    onReorder={(newOrder) => updateData({ sectionOrder: newOrder })}
                  />
                </div>

                {/* 2. Active Section Form View */}
                <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                  {activeSection === "personal" && (
                    <PersonalInfoForm
                      data={data.personalInfo}
                      onChange={updatePersonalInfo}
                    />
                  )}

                  {activeSection === "summary" && (
                    <SummaryForm
                      summary={data.summary}
                      onChange={(summary) => updateData({ summary })}
                    />
                  )}

                  {activeSection === "experience" && (
                    <ExperienceForm
                      experience={data.experience}
                      onChange={(experience) => updateData({ experience })}
                    />
                  )}

                  {activeSection === "education" && (
                    <EducationForm
                      education={data.education}
                      onChange={(education) => updateData({ education })}
                    />
                  )}

                  {activeSection === "skills" && (
                    <SkillsForm
                      skills={data.skills}
                      onChange={(skills) => updateData({ skills })}
                    />
                  )}

                  {activeSection === "projects" && (
                    <ProjectsForm
                      projects={data.projects}
                      onChange={(projects) => updateData({ projects })}
                    />
                  )}

                  {activeSection === "certifications" && (
                    <CertificationsForm
                      certifications={data.certifications}
                      onChange={(certifications) => updateData({ certifications })}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Live Render Preview */}
        <div className="flex-1 h-full overflow-hidden flex flex-col">
          <CvPreview data={data} />
        </div>
      </div>
    </div>
  );
}

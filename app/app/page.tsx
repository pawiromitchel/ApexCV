"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ResumeSummary, TemplateId } from "@/lib/types";
import {
  Plus,
  FileText,
  Copy,
  Trash2,
  Edit3,
  Sparkles,
  UserCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
  Search,
  FileUp,
  Upload,
  Loader2,
} from "lucide-react";

const templates: Array<{ id: TemplateId; name: string; tag: string }> = [
  { id: "modern-tech", name: "Modern Tech", tag: "POPULAR" },
  { id: "executive", name: "Executive Classic", tag: "FORMAL" },
  { id: "creative", name: "Creative Grid", tag: "BOLD" },
  { id: "sidebar", name: "Compact Sidebar", tag: "HIGH DENSITY" },
  { id: "ats-classic", name: "Harvard ATS", tag: "100% ATS" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create CV Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createMode, setCreateMode] = useState<"scratch" | "import">("scratch");
  const [newTitle, setNewTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("modern-tech");
  const [useSample, setUseSample] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // User Profile / Claim State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userName, setUserName] = useState("");
  const [savedName, setSavedName] = useState<string | null>(null);

  const handlePdfUpload = async (file: File) => {
    if (!file || !file.name.endsWith(".pdf")) {
      setParseError("Please select a valid .pdf document.");
      return;
    }

    try {
      setIsParsingPdf(true);
      setParseError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("save", "true");

      const res = await fetch("/api/resumes/parse-pdf", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (result.success && result.resume) {
        setShowCreateModal(false);
        router.push(`/app/${result.resume.id}`);
      } else {
        setParseError(result.error || "Failed to parse PDF resume.");
      }
    } catch (err: any) {
      console.error("PDF upload failed:", err);
      setParseError(err?.message || "An error occurred during PDF parsing.");
    } finally {
      setIsParsingPdf(false);
    }
  };

  // Load saved profile name from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("cv_builder_user_name");
    if (stored) setSavedName(stored);
  }, []);

  // Fetch resumes from SQLite
  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/resumes");
      const data = await res.json();
      if (data.success) {
        setResumes(data.resumes);
      }
    } catch (err) {
      console.error("Failed to fetch resumes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleCreateCv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          templateId: selectedTemplate,
          useSample,
        }),
      });

      const data = await res.json();
      if (data.success && data.resume) {
        setShowCreateModal(false);
        router.push(`/app/${data.resume.id}`);
      }
    } catch (err) {
      console.error("Failed to create resume:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/resumes/${id}/duplicate`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        fetchResumes();
      }
    } catch (err) {
      console.error("Failed to duplicate resume:", err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this resume?")) return;

    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setResumes((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete resume:", err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    const userId = `usr_${userName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    localStorage.setItem("cv_builder_user_name", userName.trim());
    localStorage.setItem("cv_builder_user_id", userId);
    setSavedName(userName.trim());

    // Claim resumes
    try {
      await fetch("/api/auth/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          userName: userName.trim(),
          resumeIds: resumes.map((r) => r.id),
        }),
      });
    } catch (err) {
      console.error("Failed to claim resumes:", err);
    }
    setShowProfileModal(false);
  };

  const filteredResumes = resumes.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-sky-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              ApexCV
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </span>
          </Link>
        </div>

        {/* User Status / Name Claim */}
        <div className="flex items-center gap-3">
          {savedName ? (
            <div
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white cursor-pointer hover:border-slate-700 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{savedName}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
            >
              Save under my name
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setCreateMode("import");
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white text-xs font-semibold transition-all"
          >
            <FileUp className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Import PDF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCreateMode("scratch");
              setNewTitle("My Professional Resume");
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 text-xs font-bold transition-all shadow-md shadow-sky-500/20"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Create New CV</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full p-4 sm:p-8 flex-1 flex flex-col">
        {/* Welcome & Search Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Your Resumes & CVs
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select a CV to edit, create a duplicate for a specific job, or start a new draft.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resumes..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Resumes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-slate-900/50 border border-slate-800/80 animate-pulse p-6 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-24 h-4 rounded bg-slate-800" />
                  <div className="w-40 h-5 rounded bg-slate-800" />
                </div>
                <div className="w-32 h-3 rounded bg-slate-800" />
              </div>
            ))}
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center my-auto">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-sky-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              {searchQuery ? "No matching resumes found" : "No resumes built yet"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              Start by creating your first CV using one of our 5 industry-standard ATS templates.
            </p>
            <button
              type="button"
              onClick={() => {
                setNewTitle("My Professional Resume");
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-sky-500/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Your First CV</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResumes.map((resume) => (
              <div
                key={resume.id}
                onClick={() => router.push(`/app/${resume.id}`)}
                className="group relative p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer flex flex-col justify-between shadow-lg shadow-black/20 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-sky-400 border border-slate-700">
                      {resume.templateId.replace("-", " ")}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(resume.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-white group-hover:text-sky-300 transition-colors line-clamp-1 mb-1">
                    {resume.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-1">
                    {resume.fullName || "Unnamed Candidate"} • {resume.jobTitle || "No Title Set"}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-sky-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Open Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => handleDuplicate(resume.id, e)}
                      title="Duplicate CV"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(resume.id, e)}
                      title="Delete CV"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CREATE CV MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  Create or Import CV
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Start fresh with a template or upload an existing PDF to auto-fill.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-500 hover:text-white text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-4">
              <button
                type="button"
                onClick={() => setCreateMode("scratch")}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  createMode === "scratch"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Build from Template
              </button>
              <button
                type="button"
                onClick={() => setCreateMode("import")}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  createMode === "import"
                    ? "bg-slate-800 text-sky-400 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>Import from PDF</span>
              </button>
            </div>

            {createMode === "import" ? (
              /* PDF Upload Dropzone */
              <div className="space-y-4">
                {parseError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                    {parseError}
                  </div>
                )}

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handlePdfUpload(file);
                  }}
                  className="p-8 border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-2xl bg-slate-950/60 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group"
                  onClick={() => {
                    document.getElementById("modal-pdf-file-input")?.click();
                  }}
                >
                  <input
                    id="modal-pdf-file-input"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePdfUpload(file);
                    }}
                  />

                  {isParsingPdf ? (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                      <div className="text-xs font-bold text-slate-200">
                        Analyzing and parsing your resume...
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Extracting contact info, work history, education, and skills.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform mb-3">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-white mb-1">
                        Click to upload or drag & drop your PDF
                      </div>
                      <p className="text-[11px] text-slate-400 max-w-xs mb-3">
                        Supports standard resume PDFs. Text and sections will be extracted automatically.
                      </p>
                      <span className="px-3.5 py-1.5 rounded-xl bg-slate-800 group-hover:bg-sky-500 group-hover:text-slate-950 text-xs font-bold text-slate-300 transition-all">
                        Select PDF Document
                      </span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* Scratch / Template Form */
              <form onSubmit={handleCreateCv} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Resume Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Senior Software Engineer - Stripe"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    Choose Starting Template
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {templates.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => setSelectedTemplate(tmpl.id)}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${
                          selectedTemplate === tmpl.id
                            ? "bg-slate-800 border-sky-500 text-white ring-1 ring-sky-500"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <div className="font-bold text-white">{tmpl.name}</div>
                        <div className="text-[10px] text-sky-400 font-semibold mt-0.5">
                          {tmpl.tag}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sample Data Toggle */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      Pre-fill with Sample Data
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Recommended: Starts with realistic experience & skills you can easily replace.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={useSample}
                    onChange={(e) => setUseSample(e.target.checked)}
                    className="rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-900 w-4 h-4"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newTitle.trim()}
                    className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all shadow-md shadow-sky-500/20 flex items-center gap-1.5"
                  >
                    <span>{isSubmitting ? "Creating..." : "Start Building"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* USER PROFILE / CLAIM MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-white">
                Save Work Under Your Name
              </h3>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="text-slate-500 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Enter your name to organize and associate all current and future CVs with your profile.
            </p>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Your Full Name / Workspace Handle
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Mitchell Pawiromitchel"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

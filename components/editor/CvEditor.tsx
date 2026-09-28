"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  Columns2,
  Copy,
  Download,
  Eye,
  FileUp,
  ListOrdered,
  Loader2,
  MoreHorizontal,
  PenLine,
  Redo2,
  Share2,
  SlidersHorizontal,
  Undo2,
} from "lucide-react";
import { ResumeData, ThemeConfig, CustomSection, FocusedTarget, PageSize } from "@/lib/types";
import { auditResumeHealth, HealthIssue } from "@/lib/resumeHealth";
import { getClientDeviceId } from "@/lib/deviceAuth";
import { pageSizeOf } from "@/lib/pageSize";
import { useHistoryState } from "@/lib/hooks/useHistoryState";
import { useAutosave } from "@/lib/hooks/useAutosave";
import { cn } from "@/lib/utils";
import { ease } from "@/lib/motion";
import { ApexLogo } from "@/components/ui/ApexLogo";
import { Button, IconButton } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Menu, MenuItem, MenuLabel, MenuSeparator } from "@/components/ui/Popover";
import { useToast } from "@/components/ui/Toast";
import { ThemeSelect, ThemeToggle } from "@/components/theme/ThemeToggle";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { CvPreview, EditTarget } from "@/components/preview/CvPreview";
import { ThemeToolbar } from "./styling/ThemeToolbar";
import { ShareModal } from "./ShareModal";
import { OrganizeModal } from "./OrganizeModal";
import { ExportDialog, PRINT_TIPS_KEY } from "./ExportDialog";
import { ChecksButton } from "./ChecksPanel";
import { SaveIndicator } from "./SaveIndicator";
import { SectionNav } from "./SectionNav";
import { RevealProvider, RevealRequest } from "./EditorContext";
import { navigableSections, sectionLabel } from "./sections";
import { PersonalInfoForm } from "./forms/PersonalInfoForm";
import { SummaryForm } from "./forms/SummaryForm";
import { ExperienceForm } from "./forms/ExperienceForm";
import { EducationForm } from "./forms/EducationForm";
import { SkillsForm } from "./forms/SkillsForm";
import { LanguagesForm } from "./forms/LanguagesForm";
import { ProjectsForm } from "./forms/ProjectsForm";
import { CertificationsForm } from "./forms/CertificationsForm";
import { CustomSectionsForm } from "./forms/CustomSectionsForm";

type ViewMode = "edit" | "split" | "preview";
type Tab = "content" | "design";

/** Lists whose single-item removals get an "Undo" toast, with the noun to show. */
const UNDOABLE_LISTS: Partial<Record<keyof ResumeData, string>> = {
  experience: "Position",
  education: "Education entry",
  skills: "Skill",
  languages: "Language",
  projects: "Project",
  certifications: "Certification",
  customSections: "Section",
};

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export function CvEditor({ initialData }: { initialData: ResumeData }) {
  const router = useRouter();
  const { toast } = useToast();
  const history = useHistoryState<ResumeData>(initialData);
  const data = history.state;
  const dataRef = useRef(data);
  dataRef.current = data;

  const [activeSection, setActiveSection] = useState("personal");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [tab, setTab] = useState<Tab>("content");
  const [designMounted, setDesignMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [renaming, setRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState(initialData.title);
  const [pageCount, setPageCount] = useState(1);
  const [focusedTarget, setFocusedTarget] = useState<FocusedTarget | null>(null);
  const [reveal, setReveal] = useState<RevealRequest | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [organizeOpen, setOrganizeOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [busy, setBusy] = useState<null | "duplicate" | "import">(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* ------------------------------- Persistence ------------------------------ */

  const saveToServer = useCallback(async (resume: ResumeData, { keepalive }: { keepalive: boolean }) => {
    const res = await fetch(`/api/resumes/${resume.id}`, {
      method: "PUT",
      keepalive,
      headers: { "Content-Type": "application/json", "x-device-id": getClientDeviceId() },
      body: JSON.stringify(resume),
    });
    if (res.status === 403 || res.status === 404) return "forbidden" as const;
    return res.ok;
  }, []);

  const autosave = useAutosave({ data, save: saveToServer });

  // Split view needs room; phones start on the form with a one-tap switch to the preview
  useEffect(() => {
    if (window.innerWidth < 768) setViewMode("edit");
  }, []);

  // Restore the section (or Design tab) from the URL hash, e.g. /app/<id>#experience.
  // Syncing only starts once the restored section has rendered, so the default
  // section can never overwrite the hash first.
  const hashRead = useRef(false);
  const [hashReady, setHashReady] = useState(false);
  useEffect(() => {
    if (!hashRead.current) {
      hashRead.current = true;
      const hash = decodeURIComponent(window.location.hash.slice(1)).toLowerCase();
      if (hash === "design") {
        setTab("design");
        setDesignMounted(true);
      } else if (hash) {
        const match =
          navigableSections(dataRef.current).find((k) => k.toLowerCase() === hash) ??
          dataRef.current.customSections?.find((c) => c.id.toLowerCase() === hash)?.id;
        if (match) setActiveSection(match);
      }
    }
    setHashReady(true);
  }, []);

  // Keep the hash in sync without adding history entries
  useEffect(() => {
    if (!hashReady) return;
    const hash = tab === "design" ? "design" : activeSection.toLowerCase();
    if (window.location.hash.slice(1) !== hash) {
      window.history.replaceState(window.history.state, "", `#${hash}`);
    }
  }, [hashReady, tab, activeSection]);

  // Live sync to an open public page in another tab
  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel("apexcv_preview_sync");
    channel.postMessage({ id: data.id, resume: data });
    return () => channel.close();
  }, [data]);

  /* --------------------------------- Updates -------------------------------- */

  const updateData = useCallback(
    (partial: Partial<ResumeData>) => {
      const prev = dataRef.current;
      let removal: { key: keyof ResumeData; item: any; index: number } | null = null;

      for (const key of Object.keys(partial) as (keyof ResumeData)[]) {
        if (!UNDOABLE_LISTS[key]) continue;
        const before = (prev[key] as { id: string }[] | undefined) ?? [];
        const after = (partial[key] as { id: string }[] | undefined) ?? [];
        if (after.length === before.length - 1) {
          const index = before.findIndex((b) => !after.some((a) => a.id === b.id));
          if (index >= 0) removal = { key, item: before[index], index };
        }
      }

      history.set((p) => ({ ...p, ...partial }), { discrete: !!removal });

      if (removal) {
        const { key, item, index } = removal;
        const name = item.name || item.role || item.degree || item.title;
        toast({
          title: `${UNDOABLE_LISTS[key]} removed`,
          description: name ? `“${name}”` : undefined,
          action: {
            label: "Undo",
            onClick: () =>
              history.set(
                (p) => {
                  const list = [...(((p[key] as unknown) as any[]) ?? [])];
                  list.splice(Math.min(index, list.length), 0, item);
                  return { ...p, [key]: list };
                },
                { discrete: true }
              ),
          },
        });
      }
    },
    [history, toast]
  );

  const updatePersonalInfo = (partial: Partial<ResumeData["personalInfo"]>) =>
    history.set((p) => ({ ...p, personalInfo: { ...p.personalInfo, ...partial } }));

  const updateTheme = (partial: Partial<ThemeConfig>) =>
    history.set((p) => ({ ...p, themeConfig: { ...p.themeConfig, ...partial } }), { discrete: true });

  /* ------------------------------- Navigation ------------------------------- */

  const navKeys = navigableSections(data);
  const navIndex = navKeys.findIndex((k) => k === activeSection || (k === "customSections" && activeSection.startsWith("sec_")));
  const prevKey = navIndex > 0 ? navKeys[navIndex - 1] : null;
  const nextKey = navIndex >= 0 && navIndex < navKeys.length - 1 ? navKeys[navIndex + 1] : null;

  const goToSection = useCallback(
    (key: string) => {
      const keys = navigableSections(dataRef.current);
      const from = keys.indexOf(activeSection);
      const to = keys.indexOf(key.startsWith("sec_") && !keys.includes(key) ? "customSections" : key);
      setDirection(to >= from ? 1 : -1);
      setActiveSection(key);
      setTab("content");
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    },
    [activeSection]
  );

  const revealItem = (itemId?: string) => {
    if (itemId) setReveal({ itemId, nonce: Date.now() });
  };

  const handleEditTarget = ({ section, itemId }: EditTarget) => {
    if (viewMode === "preview") setViewMode(window.innerWidth >= 768 ? "split" : "edit");
    goToSection(section);
    revealItem(itemId);
  };

  const handleFix = (issue: HealthIssue) => {
    if (issue.section === "layout") {
      setTab("design");
      setDesignMounted(true);
      return;
    }
    if (viewMode === "preview") setViewMode(window.innerWidth >= 768 ? "split" : "edit");
    goToSection(issue.section);
    revealItem(issue.itemId);
  };

  const addSection = (key: string) => {
    updateData({ sectionOrder: [...data.sectionOrder, key] });
    goToSection(key);
  };

  const addCustomSection = () => {
    const id = `sec_${Date.now()}`;
    const section: CustomSection = {
      id,
      title: "New section",
      items: [{ id: `item_${Date.now()}`, title: "", subtitle: "", date: "", description: "" }],
    };
    const hasAggregate = data.sectionOrder.includes("customSections") || data.sectionOrder.some((s) => s.startsWith("sec_"));
    updateData({
      customSections: [...(data.customSections || []), section],
      sectionOrder: hasAggregate ? data.sectionOrder : [...data.sectionOrder, "customSections"],
    });
    goToSection(id);
  };

  /* --------------------------------- Actions -------------------------------- */

  const issues = useMemo(() => auditResumeHealth(data, { pageCount }), [data, pageCount]);

  const print = async () => {
    setExportOpen(false);
    await autosave.flush();
    // Let the dialog finish closing so it never appears in the print snapshot
    window.setTimeout(() => window.print(), 120);
  };

  const startExport = () => {
    const blocking = issues.some((i) => i.severity !== "tip");
    let seenTips = false;
    try {
      seenTips = localStorage.getItem(PRINT_TIPS_KEY) === "1";
    } catch {
      // ignore
    }
    if (blocking || !seenTips) setExportOpen(true);
    else void print();
  };

  const leaveEditor = async () => {
    await autosave.flush();
    router.push("/app");
  };

  const duplicate = async () => {
    setBusy("duplicate");
    try {
      await autosave.flush();
      const res = await fetch(`/api/resumes/${data.id}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-device-id": getClientDeviceId() },
        body: JSON.stringify({ title: `${data.title} (copy)` }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast({ variant: "success", title: "Copy created", description: "You’re now editing the copy." });
      router.push(`/app/${json.resume.id}`);
    } catch {
      toast({ variant: "error", title: "Couldn’t duplicate this CV" });
    } finally {
      setBusy(null);
    }
  };

  // PDF import always creates a new CV, so it can never overwrite this one
  const importPdf = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast({ variant: "error", title: "Please choose a PDF file" });
      return;
    }
    setBusy("import");
    try {
      await autosave.flush();
      const form = new FormData();
      form.append("file", file);
      form.append("save", "true");
      const res = await fetch("/api/resumes/parse-pdf", { method: "POST", body: form, headers: { "x-device-id": getClientDeviceId() } });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast({ variant: "success", title: "Imported as a new CV", description: "Check each section: PDF parsing isn’t perfect." });
      router.push(`/app/${json.resume.id}`);
    } catch (err: any) {
      toast({ variant: "error", title: "Couldn’t read that PDF", description: err?.message });
    } finally {
      setBusy(null);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  const commitTitle = () => {
    const next = titleDraft.trim();
    if (next && next !== data.title) history.set((p) => ({ ...p, title: next }), { discrete: true });
    else setTitleDraft(data.title);
    setRenaming(false);
  };
  useEffect(() => {
    if (!renaming) setTitleDraft(data.title);
  }, [data.title, renaming]);

  /* ------------------------------- Shortcuts -------------------------------- */

  const shortcutRef = useRef({ undo: history.undo, redo: history.redo, flush: autosave.flush, startExport });
  shortcutRef.current = { undo: history.undo, redo: history.redo, flush: autosave.flush, startExport };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === "z") {
        e.preventDefault();
        if (e.shiftKey) shortcutRef.current.redo();
        else shortcutRef.current.undo();
      } else if (key === "y") {
        e.preventDefault();
        shortcutRef.current.redo();
      } else if (key === "s") {
        e.preventDefault();
        void shortcutRef.current.flush();
      } else if (key === "p") {
        e.preventDefault();
        shortcutRef.current.startExport();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* --------------------------------- Render --------------------------------- */

  const mod = isMac() ? "⌘" : "Ctrl+";
  const paper = pageSizeOf(data.themeConfig.pageSize);

  const renderForm = (key: string) => {
    switch (key) {
      case "personal":
        return (
          <PersonalInfoForm
            data={data.personalInfo}
            onChange={updatePersonalInfo}
            showAvatar={data.themeConfig?.showAvatar ?? true}
            onThemeChange={updateTheme}
          />
        );
      case "summary":
        return <SummaryForm summary={data.summary} onChange={(summary) => updateData({ summary })} />;
      case "experience":
        return <ExperienceForm experience={data.experience} onChange={(experience) => updateData({ experience })} />;
      case "education":
        return <EducationForm education={data.education} onChange={(education) => updateData({ education })} />;
      case "skills":
        return <SkillsForm skills={data.skills} onChange={(skills) => updateData({ skills })} />;
      case "languages":
        return <LanguagesForm languages={data.languages || []} onChange={(languages) => updateData({ languages })} />;
      case "projects":
        return <ProjectsForm projects={data.projects} onChange={(projects) => updateData({ projects })} />;
      case "certifications":
        return (
          <CertificationsForm certifications={data.certifications} onChange={(certifications) => updateData({ certifications })} />
        );
      default:
        return (
          <CustomSectionsForm
            customSections={data.customSections || []}
            onChange={(customSections) => {
              const order = [...data.sectionOrder];
              if (customSections.length > 0 && !order.includes("customSections") && !order.some((s) => s.startsWith("sec_"))) {
                order.push("customSections");
              }
              updateData({ customSections, sectionOrder: order });
            }}
          />
        );
    }
  };

  const formKey = activeSection.startsWith("sec_") ? "customSections" : activeSection;

  return (
    <RevealProvider value={reveal}>
      <div className="flex h-[100dvh] flex-col overflow-hidden bg-canvas text-fg print:!block print:!h-auto print:!overflow-visible print:!bg-white">
        {/* ------------------------------ Header ------------------------------ */}
        <header className="no-print z-30 flex h-14 shrink-0 items-center gap-2 border-b border-line bg-surface/80 px-2 backdrop-blur-xl sm:px-3">
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden sm:gap-2">
            <button
              type="button"
              onClick={leaveEditor}
              className="group flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-1.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-label="Back to all CVs"
              title="All CVs"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <ApexLogo size={22} className="hidden h-[22px] w-[22px] sm:block" />
            </button>

            <div className="min-w-0">
              {renaming ? (
                <input
                  autoFocus
                  value={titleDraft}
                  aria-label="CV name"
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={commitTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitTitle();
                    if (e.key === "Escape") {
                      setTitleDraft(data.title);
                      setRenaming(false);
                    }
                  }}
                  className="h-8 w-40 rounded-lg border border-primary bg-surface px-2 text-sm font-semibold text-fg focus:outline-none focus:ring-4 focus:ring-primary/15 sm:w-64"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setRenaming(true)}
                  title="Rename"
                  className="group flex h-8 max-w-[30vw] items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-fg transition-colors hover:bg-surface-2 sm:max-w-[260px]"
                >
                  <span className="truncate">{data.title}</span>
                  <PenLine className="h-3.5 w-3.5 shrink-0 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              )}
            </div>

            <SaveIndicator status={autosave.status} lastSavedAt={autosave.lastSavedAt} onRetry={autosave.retry} />
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            <div className="hidden items-center md:flex">
              <IconButton label={`Undo (${mod}Z)`} onClick={history.undo} disabled={!history.canUndo}>
                <Undo2 className="h-4 w-4" />
              </IconButton>
              <IconButton label={`Redo (${mod}⇧Z)`} onClick={history.redo} disabled={!history.canRedo}>
                <Redo2 className="h-4 w-4" />
              </IconButton>
            </div>

            <SegmentedControl<ViewMode>
              ariaLabel="Layout"
              size="sm"
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: "edit", label: <span className="hidden lg:inline">Edit</span>, icon: <PenLine className="h-3.5 w-3.5" />, ariaLabel: "Form only" },
                { value: "split", label: <span className="hidden lg:inline">Split</span>, icon: <Columns2 className="h-3.5 w-3.5" />, ariaLabel: "Form and preview", className: "hidden md:inline-flex" },
                { value: "preview", label: <span className="hidden lg:inline">Preview</span>, icon: <Eye className="h-3.5 w-3.5" />, ariaLabel: "Preview only" },
              ]}
            />

            <ChecksButton issues={issues} onFix={handleFix} />
            <ThemeToggle className="hidden md:inline-flex" />

            <Button variant="outline" onClick={() => setShareOpen(true)} className="hidden sm:inline-flex" aria-label="Share">
              <Share2 className="h-4 w-4" />
              <span className="hidden xl:inline">Share</span>
            </Button>
            <Button variant="primary" onClick={startExport} aria-label="Download PDF">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>

            <Menu
              align="end"
              ariaLabel="More actions"
              className="w-60"
              trigger={(props) => (
                <IconButton {...props} label="More actions" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </IconButton>
              )}
            >
              <MenuItem icon={<Share2 />} onSelect={() => setShareOpen(true)} className="sm:hidden">
                Share
              </MenuItem>
              <MenuItem icon={<ListOrdered />} onSelect={() => setOrganizeOpen(true)}>
                Organise sections
              </MenuItem>
              <MenuItem icon={busy === "duplicate" ? <Loader2 className="animate-spin" /> : <Copy />} onSelect={duplicate} disabled={!!busy}>
                Duplicate CV
              </MenuItem>
              <MenuItem
                icon={busy === "import" ? <Loader2 className="animate-spin" /> : <FileUp />}
                onSelect={() => pdfInputRef.current?.click()}
                disabled={!!busy}
              >
                Import PDF as new CV
              </MenuItem>
              <MenuItem icon={<Undo2 />} onSelect={history.undo} disabled={!history.canUndo} shortcut={`${mod}Z`} keepOpen className="md:hidden">
                Undo
              </MenuItem>
              <MenuSeparator />
              <MenuLabel>Appearance</MenuLabel>
              <div className="px-1.5 pb-1">
                <ThemeSelect />
              </div>
              <div className="px-1 pt-1 empty:hidden">
                <InstallPrompt variant="button" />
              </div>
            </Menu>
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importPdf(file);
              }}
            />
          </div>
        </header>

        {/* ----------------------------- Workspace ---------------------------- */}
        <div className="flex flex-1 overflow-hidden print:!block print:!h-auto print:!overflow-visible">
          {/* Editor panel */}
          <div
            className={cn(
              "no-print z-20 flex min-w-0 shrink-0 flex-col border-r border-line bg-canvas",
              viewMode === "preview" && "hidden",
              viewMode === "edit" && "w-full",
              viewMode === "split" && "w-full md:w-[52%] lg:w-[48%] xl:w-[44%] 2xl:w-[40%]"
            )}
          >
            <div className="shrink-0 space-y-2.5 border-b border-line bg-surface/60 px-3 pb-2.5 pt-3 sm:px-5">
              <SegmentedControl<Tab>
                ariaLabel="Editor mode"
                fullWidth
                value={tab}
                onChange={(t) => {
                  setTab(t);
                  if (t === "design") setDesignMounted(true);
                }}
                options={[
                  { value: "content", label: "Content", icon: <PenLine className="h-3.5 w-3.5" /> },
                  { value: "design", label: "Design", icon: <SlidersHorizontal className="h-3.5 w-3.5" /> },
                ]}
              />
              {tab === "content" && (
                <SectionNav
                  data={data}
                  active={activeSection}
                  issues={issues}
                  onSelect={goToSection}
                  onAddSection={addSection}
                  onAddCustom={addCustomSection}
                  onOrganize={() => setOrganizeOpen(true)}
                />
              )}
            </div>

            <div ref={scrollRef} className={cn("flex-1 overflow-y-auto overflow-x-hidden", viewMode === "edit" && "flex justify-center")}>
              {/* Content stays mounted while on Design so open cards and drafts survive */}
              <div hidden={tab !== "content"} className={cn("px-3 py-5 sm:px-5", viewMode === "edit" && "w-full max-w-3xl")}>
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                  <motion.div
                    key={formKey}
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 24 }}
                    animate={{ opacity: 1, x: 0, transition: { duration: 0.28, ease: ease.out } }}
                    exit={{ opacity: 0, x: direction * -24, transition: { duration: 0.14, ease: ease.inOut } }}
                    onFocusCapture={(e) => {
                      const target = e.target as HTMLElement;
                      const itemId = target.closest<HTMLElement>("[data-item-id]")?.dataset.itemId;
                      const bulletStr = target.closest<HTMLElement>("[data-bullet-index]")?.dataset.bulletIndex;
                      const bulletIndex = bulletStr !== undefined ? parseInt(bulletStr, 10) : undefined;
                      setFocusedTarget({ section: formKey, itemId, bulletIndex: Number.isNaN(bulletIndex) ? undefined : bulletIndex });
                    }}
                    onBlurCapture={() => {
                      window.setTimeout(() => {
                        if (!document.activeElement?.closest("[data-item-id], input, textarea")) setFocusedTarget(null);
                      }, 100);
                    }}
                    className="space-y-6"
                  >
                    {renderForm(activeSection)}
                  </motion.div>
                </AnimatePresence>

                {/* Step navigation follows the CV's own section order */}
                <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-4">
                  {prevKey ? (
                    <Button variant="ghost" onClick={() => goToSection(prevKey)} className="min-w-0">
                      <ChevronLeft className="h-4 w-4 shrink-0" />
                      <span className="truncate">{sectionLabel(prevKey, data)}</span>
                    </Button>
                  ) : (
                    <span />
                  )}
                  {nextKey ? (
                    <Button variant="secondary" onClick={() => goToSection(nextKey)} className="min-w-0">
                      <span className="truncate">Next: {sectionLabel(nextKey, data)}</span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={startExport}>
                      Review & download
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {designMounted && (
                <div hidden={tab !== "design"} className={cn("px-3 py-5 sm:px-5", viewMode === "edit" && "w-full max-w-3xl")}>
                  <ThemeToolbar data={data} onChange={updateTheme} />
                </div>
              )}
            </div>
          </div>

          {/* Preview panel */}
          <div
            className={cn(
              "h-full min-w-0 flex-1 flex-col overflow-hidden print:!flex print:!h-auto print:!overflow-visible",
              viewMode === "edit" ? "hidden" : viewMode === "preview" ? "flex" : "hidden md:flex"
            )}
          >
            <CvPreview
              data={data}
              focusedTarget={focusedTarget}
              onEditTarget={handleEditTarget}
              onPageCountChange={setPageCount}
              onPageSizeChange={(pageSize: PageSize) => updateTheme({ pageSize })}
            />
          </div>
        </div>

        <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} resumeId={data.id} />
        <OrganizeModal
          open={organizeOpen}
          onClose={() => setOrganizeOpen(false)}
          data={data}
          onReorder={(sectionOrder) => history.set((p) => ({ ...p, sectionOrder }))}
          onToggleHidden={(key) => {
            const hidden = data.hiddenSections || [];
            updateData({ hiddenSections: hidden.includes(key) ? hidden.filter((k) => k !== key) : [...hidden, key] });
          }}
          onSelect={goToSection}
        />
        <ExportDialog
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          issues={issues}
          onFix={handleFix}
          onDownload={print}
          paperLabel={paper.label}
        />
      </div>
    </RevealProvider>
  );
}

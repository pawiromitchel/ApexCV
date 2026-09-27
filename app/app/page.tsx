"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Copy, FilePlus2, FileUp, Globe2, MoreHorizontal, PenLine, Plus, Search, Trash2 } from "lucide-react";
import { ResumeSummary } from "@/lib/types";
import { getClientDeviceId } from "@/lib/deviceAuth";
import { timeAgo } from "@/lib/time";
import { spring, fadeUp, stagger } from "@/lib/motion";
import { ApexLogo } from "@/components/ui/ApexLogo";
import { Button, IconButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Menu, MenuItem, MenuSeparator } from "@/components/ui/Popover";
import { useToast } from "@/components/ui/Toast";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { TemplateThumbnail } from "@/components/preview/TemplateThumbnail";
import { TEMPLATE_NAMES } from "@/components/preview/CvPreview";
import { CreateCvModal, CreateMode } from "@/components/dashboard/CreateCvModal";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [createMode, setCreateMode] = useState<CreateMode | null>(null);

  const load = useCallback(async () => {
    try {
      setLoadError(false);
      const res = await fetch("/api/resumes", { headers: { "x-device-id": getClientDeviceId() } });
      const json = await res.json();
      if (!json.success) throw new Error();
      setResumes(json.resumes);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Deep links from the landing page: /app?new=template or /app?new=import
  useEffect(() => {
    const intent = new URLSearchParams(window.location.search).get("new");
    if (intent === "template" || intent === "import") {
      setCreateMode(intent);
      window.history.replaceState(null, "", "/app");
    }
  }, []);

  const duplicate = async (resume: ResumeSummary) => {
    const res = await fetch(`/api/resumes/${resume.id}/duplicate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-device-id": getClientDeviceId() },
      body: JSON.stringify({ title: `${resume.title} (copy)` }),
    });
    const json = await res.json().catch(() => ({}));
    if (json.success) {
      toast({ variant: "success", title: "Copy created", description: json.resume.title });
      void load();
    } else {
      toast({ variant: "error", title: "Couldn’t duplicate this CV" });
    }
  };

  // Deleting is deferred until the undo toast expires, so "Undo" never needs a restore call
  const remove = (resume: ResumeSummary) => {
    const index = resumes.findIndex((r) => r.id === resume.id);
    setResumes((prev) => prev.filter((r) => r.id !== resume.id));
    toast({
      title: "CV deleted",
      description: resume.title,
      action: {
        label: "Undo",
        onClick: () =>
          setResumes((prev) => {
            const next = [...prev];
            next.splice(Math.min(index, next.length), 0, resume);
            return next;
          }),
      },
      onExpire: () => {
        void fetch(`/api/resumes/${resume.id}`, {
          method: "DELETE",
          keepalive: true,
          headers: { "x-device-id": getClientDeviceId() },
        }).then((res) => {
          if (!res.ok) {
            toast({ variant: "error", title: "Couldn’t delete that CV" });
            void load();
          }
        });
      },
    });
  };

  const q = query.trim().toLowerCase();
  const filtered = q
    ? resumes.filter((r) => [r.title, r.fullName, r.jobTitle].some((v) => v?.toLowerCase().includes(q)))
    : resumes;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
            <ApexLogo size={28} className="h-7 w-7" />
            <span className="text-[15px] font-semibold tracking-tight text-fg">ApexCV</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={() => setCreateMode("import")} aria-label="Import PDF">
              <FileUp className="h-4 w-4" />
              <span className="hidden sm:inline">Import PDF</span>
            </Button>
            <Button variant="primary" onClick={() => setCreateMode("template")}>
              <Plus className="h-4 w-4" />
              New CV
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">Your CVs</h1>
            <p className="mt-1 text-sm text-fg-muted">Keep one version per role you apply for. Everything saves automatically.</p>
          </div>
          {resumes.length > 3 && (
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search CVs" aria-label="Search CVs" className="pl-9" />
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-line bg-surface">
                <div className="aspect-[4/3] animate-pulse bg-surface-2" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2" />
                </div>
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-line bg-surface p-10 text-center">
            <p className="text-sm font-medium text-fg">We couldn’t load your CVs.</p>
            <Button variant="outline" className="mt-4" onClick={() => void load()}>
              Try again
            </Button>
          </div>
        ) : resumes.length === 0 ? (
          <Onboarding onCreate={setCreateMode} />
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-fg-muted">No CVs match “{query}”.</p>
        ) : (
          <motion.ul variants={stagger(0.05)} initial="hidden" animate="show" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false}>
              {filtered.map((resume) => (
                <motion.li
                  key={resume.id}
                  layout
                  variants={fadeUp}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
                  transition={spring.smooth}
                  className="group relative"
                >
                  <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition-[transform,box-shadow,border-color] duration-300 group-hover:-translate-y-1 group-hover:border-line-strong group-hover:shadow-lifted group-focus-within:border-line-strong">
                    <div className="relative border-b border-line bg-preview/40 px-5 pt-5">
                      {resume.data ? (
                        <TemplateThumbnail data={resume.data} className="rounded-t-md shadow-lifted transition-transform duration-500 group-hover:scale-[1.02]" />
                      ) : (
                        <div className="aspect-[4/3] rounded-t-md bg-white" />
                      )}
                    </div>
                    <div className="p-4 pr-12">
                      {/* Stretched link: covers the whole card without wrapping the template's own links */}
                      <Link
                        href={`/app/${resume.id}`}
                        className="block truncate text-[15px] font-semibold text-fg outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-primary/60"
                      >
                        {resume.title}
                      </Link>
                      <p className="mt-0.5 truncate text-[13px] text-fg-muted">
                        {[resume.fullName !== "Unnamed" && resume.fullName, resume.jobTitle].filter(Boolean).join(" · ") || "No name yet"}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-fg-subtle">Edited {timeAgo(resume.updatedAt)}</span>
                        <span className="text-fg-subtle" aria-hidden>·</span>
                        <span className="text-xs text-fg-subtle">{TEMPLATE_NAMES[resume.templateId] ?? "Template"}</span>
                        {resume.shareEnabled && (
                          <Badge tone="success" className="ml-auto">
                            <Globe2 className="h-3 w-3" /> Shared
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-[4.4rem] right-3 z-10">
                    <Menu
                      align="end"
                      ariaLabel={`Actions for ${resume.title}`}
                      trigger={(props) => (
                        <IconButton {...props} label={`Actions for ${resume.title}`} className="bg-surface shadow-soft ring-1 ring-line">
                          <MoreHorizontal className="h-4 w-4" />
                        </IconButton>
                      )}
                    >
                      <MenuItem icon={<PenLine />} onSelect={() => router.push(`/app/${resume.id}`)}>
                        Open
                      </MenuItem>
                      <MenuItem icon={<Copy />} onSelect={() => void duplicate(resume)}>
                        Duplicate
                      </MenuItem>
                      <MenuSeparator />
                      <MenuItem icon={<Trash2 />} destructive onSelect={() => remove(resume)}>
                        Delete
                      </MenuItem>
                    </Menu>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </main>

      <CreateCvModal open={createMode !== null} initialMode={createMode ?? "template"} onClose={() => setCreateMode(null)} />
    </div>
  );
}

function Onboarding({ onCreate }: { onCreate: (mode: CreateMode) => void }) {
  const options = [
    {
      mode: "template" as const,
      icon: <FilePlus2 className="h-6 w-6" />,
      title: "Start from a template",
      body: "Pick a layout and fill it in with live preview. Takes about 15 minutes.",
    },
    {
      mode: "import" as const,
      icon: <FileUp className="h-6 w-6" />,
      title: "Import your current CV",
      body: "Upload a PDF and we’ll fill in the sections for you to polish.",
    },
  ];
  return (
    <motion.div variants={stagger(0.08)} initial="hidden" animate="show" className="mx-auto max-w-3xl py-6 text-center">
      <motion.h2 variants={fadeUp} className="text-lg font-semibold text-fg">
        Let’s make your first CV
      </motion.h2>
      <motion.p variants={fadeUp} className="mt-1 text-sm text-fg-muted">
        No account needed. You can export a PDF or share a link when you’re done.
      </motion.p>
      <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
        {options.map((o) => (
          <motion.button
            key={o.mode}
            variants={fadeUp}
            type="button"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={spring.smooth}
            onClick={() => onCreate(o.mode)}
            className="group rounded-2xl border border-line bg-surface p-6 text-left shadow-soft transition-[border-color,box-shadow] hover:border-primary/50 hover:shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
              {o.icon}
            </span>
            <span className="block text-base font-semibold text-fg">{o.title}</span>
            <span className="mt-1 block text-sm text-fg-muted">{o.body}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

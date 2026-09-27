"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { FilePlus2, FileUp, Loader2, ShieldCheck, UploadCloud } from "lucide-react";
import { TemplateId } from "@/lib/types";
import { initialResumeData } from "@/lib/sampleData";
import { getClientDeviceId } from "@/lib/deviceAuth";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Field } from "@/components/ui/Field";
import { Switch } from "@/components/ui/Switch";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useToast } from "@/components/ui/Toast";
import { TemplateOption } from "@/components/preview/TemplateOption";
import { TEMPLATES } from "@/components/editor/styling/ThemeToolbar";

export type CreateMode = "template" | "import";

export function CreateCvModal({ open, onClose, initialMode = "template" }: { open: boolean; onClose: () => void; initialMode?: CreateMode }) {
  const router = useRouter();
  const { toast } = useToast();
  const [mode, setMode] = useState<CreateMode>(initialMode);
  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState<TemplateId>("modern-tech");
  const [withExample, setWithExample] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Re-sync the tab when reopened from a different entry point
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setMode(initialMode);
      setError(null);
    }
  }

  const create = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-device-id": getClientDeviceId() },
        body: JSON.stringify({ title: title.trim() || "My CV", templateId: template, useSample: withExample }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      router.push(`/app/${json.resume.id}`);
    } catch {
      setError("Couldn’t create your CV. Please try again.");
      setBusy(false);
    }
  };

  const importPdf = async (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("That doesn’t look like a PDF. Please choose a .pdf file.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("save", "true");
      const res = await fetch("/api/resumes/parse-pdf", { method: "POST", body: form, headers: { "x-device-id": getClientDeviceId() } });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast({ variant: "success", title: "Imported your CV", description: "Check each section: PDF parsing isn’t perfect." });
      router.push(`/app/${json.resume.id}`);
    } catch (err: any) {
      setError(err?.message || "We couldn’t read that PDF. Try another file or start from a template.");
      setBusy(false);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => !busy && onClose()}
      size="xl"
      title="Create a new CV"
      description="Start from a template or bring your existing CV."
      footer={
        mode === "template" ? (
          <>
            <Button variant="ghost" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => create()} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Create CV
            </Button>
          </>
        ) : undefined
      }
    >
      <div className="space-y-5">
        <SegmentedControl<CreateMode>
          ariaLabel="How to start"
          fullWidth
          value={mode}
          onChange={(m) => {
            setMode(m);
            setError(null);
          }}
          options={[
            { value: "template", label: "Start fresh", icon: <FilePlus2 className="h-4 w-4" /> },
            { value: "import", label: "Import a PDF", icon: <FileUp className="h-4 w-4" /> },
          ]}
        />

        <AnimatePresence mode="wait" initial={false}>
          {mode === "template" ? (
            <motion.form
              key="template"
              onSubmit={create}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
              className="space-y-5"
            >
              <Field label="Name" hint="Only you see this. Tip: one CV per role you apply for.">
                {(p) => <Input {...p} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Product Designer – Spotify" />}
              </Field>

              <div>
                <p className="mb-2 text-[13px] font-medium text-fg-secondary">Template <span className="font-normal text-fg-subtle">· you can switch any time</span></p>
                <div role="radiogroup" aria-label="Template" className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                  {TEMPLATES.map((t) => (
                    <TemplateOption
                      key={t.id}
                      data={initialResumeData}
                      templateId={t.id}
                      name={t.name}
                      active={template === t.id}
                      onSelect={() => setTemplate(t.id)}
                      checkLayoutId="create-template-check"
                      aspect="page"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface-2/70 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-fg">Start with example content</p>
                  <p className="text-[13px] text-fg-muted">Handy to see how it fits. We’ll remind you to replace it.</p>
                </div>
                <Switch label="Start with example content" checked={withExample} onCheckedChange={setWithExample} />
              </div>
              {error && <p className="text-[13px] font-medium text-danger">{error}</p>}
              <button type="submit" hidden />
            </motion.form>
          ) : (
            <motion.div
              key="import"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <button
                type="button"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  void importPdf(e.dataTransfer.files?.[0]);
                }}
                className={cn(
                  "flex w-full flex-col items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                  dragging ? "border-primary bg-primary/5" : "border-line-strong hover:border-primary/60 hover:bg-surface-2/60"
                )}
              >
                <motion.div
                  animate={busy ? { rotate: 360 } : dragging ? { y: -4, scale: 1.08 } : { y: 0, scale: 1 }}
                  transition={busy ? { repeat: Infinity, duration: 1, ease: "linear" } : spring.snappy}
                  className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                >
                  {busy ? <Loader2 className="h-6 w-6" /> : <UploadCloud className="h-6 w-6" />}
                </motion.div>
                <p className="text-sm font-semibold text-fg">{busy ? "Reading your CV…" : dragging ? "Drop to import" : "Drop your CV here, or click to choose"}</p>
                <p className="mt-1 text-[13px] text-fg-muted">PDF exported from Word, Google Docs, LinkedIn, or another builder</p>
              </button>
              <input id="modal-pdf-file-input" ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => importPdf(e.target.files?.[0])} />

              <div className="flex gap-3 rounded-2xl bg-surface-2/70 p-4 text-[13px] text-fg-secondary">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-fg-muted" />
                <p>
                  We pull out your name, contact details, experience, education, and skills so you can review and edit them. Scanned or image-only
                  PDFs can’t be read. The file itself isn’t kept after import.
                </p>
              </div>
              {error && <p className="text-[13px] font-medium text-danger">{error}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}

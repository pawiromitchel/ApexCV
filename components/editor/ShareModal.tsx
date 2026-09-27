"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, CheckCircle2, Copy, ExternalLink, Link as LinkIcon, Loader2, XCircle } from "lucide-react";
import { getClientDeviceId } from "@/lib/deviceAuth";
import { Modal } from "@/components/ui/Modal";
import { Button, IconButton } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Collapse } from "@/components/ui/Collapse";
import { useToast } from "@/components/ui/Toast";
import { fieldClass } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface ShareSettings {
  enabled: boolean;
  shareToken: string | null;
  customUrl: string | null;
  urlExpiresAt: string | null;
}

type Expiry = number | null | "keep";

export function ShareModal({ isOpen, onClose, resumeId }: { isOpen: boolean; onClose: () => void; resumeId: string }) {
  const { toast } = useToast();
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<ShareSettings | null>(null);

  const [enabled, setEnabled] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [expiry, setExpiry] = useState<Expiry>(null);
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  const apply = (s: ShareSettings) => {
    setSaved(s);
    setEnabled(s.enabled);
    setCustomUrl(s.customUrl || "");
    setExpiry(s.urlExpiresAt ? "keep" : null);
  };

  useEffect(() => {
    if (!isOpen) return;
    setLoaded(false);
    setError(null);
    fetch(`/api/resumes/${resumeId}/share`, { headers: { "x-device-id": getClientDeviceId() } })
      .then((res) => res.json())
      .then((json) => (json.success ? apply(json.settings) : setError(json.error || "Couldn’t load sharing settings")))
      .catch(() => setError("Couldn’t load sharing settings"))
      .finally(() => setLoaded(true));
  }, [isOpen, resumeId]);

  // Debounced availability check for custom links
  useEffect(() => {
    const value = customUrl.trim();
    if (!isOpen || !value || value === (saved?.customUrl || "")) {
      setAvailable(null);
      setChecking(false);
      return;
    }
    setChecking(true);
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/resumes/check-url?url=${encodeURIComponent(value)}&resumeId=${encodeURIComponent(resumeId)}`);
        const json = await res.json();
        setAvailable(json.success ? json.available : null);
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 450);
    return () => window.clearTimeout(t);
  }, [customUrl, saved?.customUrl, resumeId, isOpen]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const liveSlug = saved?.enabled ? saved.customUrl || saved.shareToken : null;
  const liveLink = liveSlug ? `${origin}/view/${liveSlug}` : null;
  const expired = !!saved?.urlExpiresAt && new Date(saved.urlExpiresAt) < new Date();
  const dirty =
    !!saved &&
    (enabled !== saved.enabled || customUrl.trim() !== (saved.customUrl || "") || expiry !== (saved.urlExpiresAt ? "keep" : null));

  const copy = async () => {
    if (!liveLink) return;
    await navigator.clipboard.writeText(liveLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-device-id": getClientDeviceId() },
        body: JSON.stringify({
          enabled,
          customUrl: customUrl.trim() || null,
          keepExpiry: expiry === "keep",
          expiresInDays: expiry === "keep" ? null : expiry,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Couldn’t update sharing");
        return;
      }
      apply(json.settings);
      toast({ variant: "success", title: enabled ? "Public link is live" : "Public link turned off" });
    } catch {
      setError("Couldn’t update sharing. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      icon={<LinkIcon />}
      title="Share your CV"
      description="Send recruiters a link to an always-up-to-date version."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {dirty ? "Cancel" : "Close"}
          </Button>
          <Button variant="primary" onClick={save} disabled={!loaded || !dirty || saving || checking || available === false}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-line p-4">
          <div>
            <p className="text-sm font-semibold text-fg">Public link</p>
            <p className="mt-0.5 text-[13px] text-fg-muted">
              {enabled ? "Anyone with the link can view this CV." : "Off. Only you can see this CV."}
            </p>
          </div>
          <Switch label="Public link" checked={enabled} onCheckedChange={setEnabled} disabled={!loaded} />
        </div>

        <Collapse open={enabled} className="space-y-4 pt-0.5">
          <AnimatePresence mode="wait" initial={false}>
            {liveLink ? (
              <motion.div key="link" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1 truncate rounded-xl bg-surface-2 px-3 py-2 font-mono text-[13px] text-fg-secondary">
                    {liveLink}
                  </div>
                  <Button variant="outline" size="md" onClick={copy} aria-label="Copy link">
                    {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                    <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                  </Button>
                  <IconButton label="Open public page" size="icon" onClick={() => window.open(liveLink, "_blank", "noopener")}>
                    <ExternalLink className="h-4 w-4" />
                  </IconButton>
                </div>
                {expired && <p className="text-[13px] text-warning">This link has expired. Choose a new expiry and save to reactivate it.</p>}
              </motion.div>
            ) : (
              <motion.p key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[13px] text-fg-muted">
                Save to create a private, hard-to-guess link.
              </motion.p>
            )}
          </AnimatePresence>

          <Field
            label="Custom link"
            hint="Optional. Letters, numbers, hyphens, and underscores."
            aside={
              checking ? (
                <span className="inline-flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Checking</span>
              ) : available === true ? (
                <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" /> Available</span>
              ) : available === false ? (
                <span className="inline-flex items-center gap-1 text-danger"><XCircle className="h-3 w-3" /> Taken</span>
              ) : null
            }
          >
            {(props) => (
              <div className={cn(fieldClass, "flex h-9 items-center gap-0 px-0 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15", available === false && "border-danger")}>
                <span className="select-none border-r border-line px-3 text-[13px] text-fg-subtle">/view/</span>
                <input
                  {...props}
                  value={customUrl}
                  placeholder="jane-doe"
                  onChange={(e) => setCustomUrl(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-fg placeholder:text-fg-subtle focus:outline-none"
                />
              </div>
            )}
          </Field>

          <Field label="Link expires">
            {(props) => (
              <Select
                {...props}
                value={expiry === null ? "never" : String(expiry)}
                onChange={(e) => setExpiry(e.target.value === "never" ? null : e.target.value === "keep" ? "keep" : Number(e.target.value))}
              >
                {saved?.urlExpiresAt && (
                  <option value="keep">
                    {expired ? "Expired" : "Keep current"} ({new Date(saved.urlExpiresAt).toLocaleDateString()})
                  </option>
                )}
                <option value="never">Never</option>
                <option value="3">In 3 days</option>
                <option value="7">In 7 days</option>
                <option value="30">In 30 days</option>
              </Select>
            )}
          </Field>
        </Collapse>

        {error && <p className="text-[13px] font-medium text-danger">{error}</p>}
      </div>
    </Modal>
  );
}

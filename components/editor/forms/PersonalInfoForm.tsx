"use client";

import React, { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Briefcase, Github, Globe, ImagePlus, Linkedin, Mail, MapPin, Phone, Trash2, User } from "lucide-react";
import { PersonalInfo } from "@/lib/types";
import { Input } from "@/components/ui/Input";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { SectionHeader } from "../ItemCard";

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (updated: Partial<PersonalInfo>) => void;
  showAvatar?: boolean;
  onThemeChange?: (updated: { showAvatar: boolean }) => void;
}

const MAX_PHOTO_PX = 480;

/** Downscale photos before storing them; phone photos are often 5MB+. */
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Unsupported image"));
      img.onload = () => {
        const scale = Math.min(1, MAX_PHOTO_PX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const FIELDS: Array<{ key: keyof PersonalInfo; label: string; icon: React.ReactNode; placeholder: string; type?: string; required?: boolean }> = [
  { key: "fullName", label: "Full name", icon: <User />, placeholder: "e.g. Jane Doe", required: true },
  { key: "jobTitle", label: "Target role", icon: <Briefcase />, placeholder: "e.g. Senior Product Designer" },
  { key: "email", label: "Email", icon: <Mail />, placeholder: "jane@example.com", type: "email", required: true },
  { key: "phone", label: "Phone", icon: <Phone />, placeholder: "+31 6 1234 5678", type: "tel" },
  { key: "location", label: "Location", icon: <MapPin />, placeholder: "City, Country" },
  { key: "website", label: "Website", icon: <Globe />, placeholder: "janedoe.com" },
  { key: "linkedin", label: "LinkedIn", icon: <Linkedin />, placeholder: "linkedin.com/in/janedoe" },
  { key: "github", label: "GitHub or portfolio", icon: <Github />, placeholder: "github.com/janedoe" },
];

export function PersonalInfoForm({ data, onChange, showAvatar = true, onThemeChange }: PersonalInfoFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ variant: "error", title: "Please choose an image file" });
      return;
    }
    try {
      const avatarUrl = await resizeImage(file);
      onChange({ avatarUrl });
      onThemeChange?.({ showAvatar: true });
    } catch {
      toast({ variant: "error", title: "Couldn’t read that image" });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Personal details" description="How recruiters will find and contact you." />

      <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label={data.avatarUrl ? "Change photo" : "Upload photo"}
        >
          <AnimatePresence mode="wait" initial={false}>
            {data.avatarUrl ? (
              <motion.img
                key={data.avatarUrl.slice(-24)}
                src={data.avatarUrl}
                alt=""
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="h-full w-full object-cover"
              />
            ) : (
              <motion.span key="empty" className="flex h-full w-full items-center justify-center text-fg-subtle">
                <ImagePlus className="h-6 w-6" />
              </motion.span>
            )}
          </AnimatePresence>
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            {data.avatarUrl ? "Change" : "Upload"}
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-fg">Photo</p>
          <p className="text-[13px] text-fg-muted">Optional. Common in Europe, usually left out in the US and UK.</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              {data.avatarUrl ? "Replace" : "Upload photo"}
            </Button>
            {data.avatarUrl && (
              <Button variant="ghost" size="sm" onClick={() => onChange({ avatarUrl: "" })} className="hover:bg-danger/10 hover:text-danger">
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </Button>
            )}
          </div>
        </div>
        {onThemeChange && data.avatarUrl && (
          <Switch label="Show photo on CV" showLabel checked={showAvatar} onCheckedChange={(v) => onThemeChange({ showAvatar: v })} className="hidden sm:inline-flex" />
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>

      <div className="grid grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <Field key={f.key} label={f.label} icon={f.icon} required={f.required}>
            {(p) => (
              <Input
                {...p}
                type={f.type ?? "text"}
                autoComplete={f.key === "fullName" ? "name" : f.key === "email" ? "email" : f.key === "phone" ? "tel" : undefined}
                value={(data[f.key] as string) || ""}
                onChange={(e) => onChange({ [f.key]: e.target.value })}
                placeholder={f.placeholder}
              />
            )}
          </Field>
        ))}
      </div>
    </div>
  );
}

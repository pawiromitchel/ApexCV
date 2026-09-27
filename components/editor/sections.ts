import {
  Award,
  Briefcase,
  FileText,
  FolderGit2,
  Globe,
  GraduationCap,
  Layers,
  LucideIcon,
  Sparkles,
  User,
} from "lucide-react";
import { ResumeData } from "@/lib/types";

/** Single source of truth for section names and icons, used by every navigation surface. */
export const SECTION_META: Record<string, { label: string; icon: LucideIcon }> = {
  personal: { label: "Personal details", icon: User },
  summary: { label: "Summary", icon: FileText },
  experience: { label: "Experience", icon: Briefcase },
  education: { label: "Education", icon: GraduationCap },
  skills: { label: "Skills", icon: Sparkles },
  languages: { label: "Languages", icon: Globe },
  projects: { label: "Projects", icon: FolderGit2 },
  certifications: { label: "Certifications", icon: Award },
  customSections: { label: "Custom sections", icon: Layers },
};

/** Standard sections a user can add back if they are not in the CV yet. */
export const OPTIONAL_SECTIONS = ["summary", "experience", "education", "skills", "languages", "projects", "certifications"];

export function sectionLabel(key: string, data: Pick<ResumeData, "customSections">): string {
  if (SECTION_META[key]) return SECTION_META[key].label;
  const custom = data.customSections?.find((c) => c.id === key);
  return custom?.title?.trim() || "Custom section";
}

export function sectionIcon(key: string): LucideIcon {
  return SECTION_META[key]?.icon ?? Layers;
}

/** Ordered list of sections to navigate: personal details first, then the CV's own order. */
export function navigableSections(data: Pick<ResumeData, "sectionOrder" | "customSections">): string[] {
  return ["personal", ...data.sectionOrder.filter((k) => k !== "personal")];
}

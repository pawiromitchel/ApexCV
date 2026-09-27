export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  avatarUrl?: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
  visible?: boolean;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string;
  visible?: boolean;
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  level?: number; // 1 to 5
  visible?: boolean;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  link?: string;
  github?: string;
  visible?: boolean;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
  visible?: boolean;
}

export interface LanguageItem {
  id: string;
  name: string;
  proficiency: string; // e.g. "Native / Bilingual", "Full Professional (C1/C2)", "Professional Working (B2)", etc.
  visible?: boolean;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
  visible?: boolean;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
  visible?: boolean;
}

export type TemplateId =
  | "modern-tech"
  | "executive"
  | "creative"
  | "sidebar"
  | "ats-classic";

export type FontFamily =
  | "inter"
  | "merriweather"
  | "roboto-mono"
  | "playfair"
  | "plus-jakarta";

export type SpacingScale = "compact" | "standard" | "spacious";
export type FontSizeScale = "sm" | "base" | "lg";
export type PageSize = "a4" | "letter";

export interface ThemeConfig {
  templateId: TemplateId;
  fontFamily: FontFamily;
  fontSize: FontSizeScale;
  documentMargins: SpacingScale;
  accentColor: string;
  spacing: SpacingScale;
  showAvatar: boolean;
  showIcons: boolean;
  /** Paper size for preview and print. Missing on older CVs, which are A4. */
  pageSize?: PageSize;
}

export interface ResumeData {
  id: string;
  userId?: string;
  title: string;
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  languages?: LanguageItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  customSections: CustomSection[];
  sectionOrder: string[]; // e.g. ['summary', 'experience', 'education', 'skills', 'projects', 'certifications']
  hiddenSections?: string[]; // array of section keys that should not be rendered
  themeConfig: ThemeConfig;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeSummary {
  id: string;
  userId?: string;
  title: string;
  fullName: string;
  jobTitle: string;
  templateId: TemplateId;
  updatedAt: string;
  createdAt: string;
  shareEnabled?: boolean;
  data?: ResumeData;
}

export interface FocusedTarget {
  section?: string;
  itemId?: string;
  bulletIndex?: number;
}

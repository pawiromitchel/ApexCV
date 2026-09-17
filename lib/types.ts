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
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  level?: number; // 1 to 5
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  link?: string;
  github?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
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

export interface ThemeConfig {
  templateId: TemplateId;
  fontFamily: FontFamily;
  fontSize: FontSizeScale;
  accentColor: string;
  spacing: SpacingScale;
  showAvatar: boolean;
  showIcons: boolean;
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
  projects: ProjectItem[];
  certifications: CertificationItem[];
  customSections: CustomSection[];
  sectionOrder: string[]; // e.g. ['summary', 'experience', 'education', 'skills', 'projects', 'certifications']
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
}

import { ResumeData } from "./types";
import { initialResumeData } from "./sampleData";
import {
  validateDateRange,
  validateCertificationYear,
  validateEducationDates,
} from "./dateValidation";

export type HealthSeverity = "error" | "warning" | "tip";

export interface HealthIssue {
  id: string;
  section: string;
  field: string;
  /** Entry to open when the user clicks "Fix". */
  itemId?: string;
  title: string;
  message: string;
  severity: HealthSeverity;
}

export interface AuditContext {
  /** Rendered page count from the live preview, when known. */
  pageCount?: number;
}

const SAMPLE = initialResumeData;
const SAMPLE_COMPANIES = new Set(SAMPLE.experience.map((e) => e.company.toLowerCase()));
const HAS_NUMBER = /\d/;
const LONG_BULLET = 220;
const LONG_SUMMARY_WORDS = 110;

const isVisible = (item: { visible?: boolean }) => item.visible !== false;

/**
 * Audits the CV for problems worth fixing before it is sent: blocking mistakes (errors),
 * things recruiters will notice (warnings), and optional polish (tips).
 * Hidden sections and entries are ignored.
 */
export function auditResumeHealth(data: ResumeData, ctx: AuditContext = {}): HealthIssue[] {
  const issues: HealthIssue[] = [];
  const shown = (key: string) => data.sectionOrder.includes(key) && !data.hiddenSections?.includes(key);
  const p = data.personalInfo;

  // Personal details
  if (!p.fullName?.trim()) {
    issues.push({ id: "personal_name", section: "personal", field: "fullName", title: "Add your name", message: "Your CV has no name at the top.", severity: "error" });
  }
  if (!p.email?.trim()) {
    issues.push({ id: "personal_email", section: "personal", field: "email", title: "Add an email address", message: "Recruiters need a way to reach you.", severity: "warning" });
  }
  if (!p.jobTitle?.trim()) {
    issues.push({ id: "personal_title", section: "personal", field: "jobTitle", title: "Add a target role", message: "A headline like “Product Designer” tells readers what you do at a glance.", severity: "tip" });
  }
  if (!p.phone?.trim() && p.email?.trim()) {
    issues.push({ id: "personal_phone", section: "personal", field: "phone", title: "Consider adding a phone number", message: "Many recruiters prefer a quick call.", severity: "tip" });
  }

  // Leftover sample content is the most embarrassing mistake, so it is an error
  const sampleSignals = [
    p.email && p.email === SAMPLE.personalInfo.email,
    p.fullName && p.fullName === SAMPLE.personalInfo.fullName,
    data.experience.some((e) => isVisible(e) && SAMPLE_COMPANIES.has(e.company?.toLowerCase())),
  ].filter(Boolean).length;
  if (sampleSignals > 0) {
    const inExperience = data.experience.find((e) => isVisible(e) && SAMPLE_COMPANIES.has(e.company?.toLowerCase()));
    issues.push({
      id: "sample_content",
      section: inExperience && !(p.email === SAMPLE.personalInfo.email || p.fullName === SAMPLE.personalInfo.fullName) ? "experience" : "personal",
      field: "fullName",
      itemId: inExperience?.id,
      title: "Sample content is still in your CV",
      message: "Replace the example name, email, or jobs with your own before sending.",
      severity: "error",
    });
  }

  // Summary
  if (shown("summary")) {
    const words = data.summary?.trim() ? data.summary.trim().split(/\s+/).length : 0;
    if (words === 0) {
      issues.push({ id: "summary_empty", section: "summary", field: "summary", title: "Write a short summary", message: "Two or three sentences about what you do and your biggest wins.", severity: "warning" });
    } else if (words > LONG_SUMMARY_WORDS) {
      issues.push({ id: "summary_long", section: "summary", field: "summary", title: "Summary is long", message: `${words} words. Aim for under ${LONG_SUMMARY_WORDS} so it gets read.`, severity: "tip" });
    }
  }

  // Experience
  if (shown("experience")) {
    const jobs = data.experience.filter(isVisible);
    if (jobs.length === 0) {
      issues.push({ id: "exp_none", section: "experience", field: "experience", title: "Add your experience", message: "Include jobs, internships, or volunteer roles.", severity: "warning" });
    }
    jobs.forEach((exp, idx) => {
      const label = exp.role || exp.company || `Position ${idx + 1}`;
      if (!exp.role?.trim()) {
        issues.push({ id: `exp_role_${exp.id}`, section: "experience", itemId: exp.id, field: "role", title: "A position has no job title", message: `The entry at “${exp.company || "an unnamed company"}” needs a role.`, severity: "error" });
      }
      if (!exp.company?.trim()) {
        issues.push({ id: `exp_company_${exp.id}`, section: "experience", itemId: exp.id, field: "company", title: "A position has no company", message: `“${label}” is missing its company or organisation.`, severity: "warning" });
      }
      if (exp.startDate && exp.endDate && !exp.current) {
        const val = validateDateRange(exp.startDate, exp.endDate, exp.current);
        if (!val.isValid) {
          issues.push({ id: `exp_dates_${exp.id}`, section: "experience", itemId: exp.id, field: "endDate", title: "Dates don’t add up", message: `“${label}”: ${val.message}`, severity: "error" });
        }
      }
      const bullets = (exp.bullets || []).map((b) => b.trim()).filter(Boolean);
      if (bullets.length === 0) {
        issues.push({ id: `exp_bullets_${exp.id}`, section: "experience", itemId: exp.id, field: "bullets", title: "No achievements listed", message: `Add 2–4 bullet points for “${label}”.`, severity: "warning" });
      } else {
        if (!bullets.some((b) => HAS_NUMBER.test(b))) {
          issues.push({ id: `exp_metrics_${exp.id}`, section: "experience", itemId: exp.id, field: "bullets", title: "Add a measurable result", message: `None of the bullets for “${label}” include a number (%, €, users, time saved).`, severity: "tip" });
        }
        if (bullets.some((b) => b.length > LONG_BULLET)) {
          issues.push({ id: `exp_long_${exp.id}`, section: "experience", itemId: exp.id, field: "bullets", title: "A bullet is very long", message: `Keep bullets for “${label}” to one or two lines.`, severity: "tip" });
        }
      }
    });
  }

  // Education
  if (shown("education")) {
    data.education.filter(isVisible).forEach((edu, idx) => {
      const label = edu.degree || edu.institution || `Education ${idx + 1}`;
      if (!edu.degree?.trim()) {
        issues.push({ id: `edu_degree_${edu.id}`, section: "education", itemId: edu.id, field: "degree", title: "An education entry has no degree", message: `Add the degree or field of study at “${edu.institution || "the institution"}”.`, severity: "error" });
      }
      if (edu.startDate && edu.endDate) {
        const val = validateEducationDates(edu.startDate, edu.endDate);
        if (!val.isValid) {
          issues.push({ id: `edu_dates_${edu.id}`, section: "education", itemId: edu.id, field: "endDate", title: "Dates don’t add up", message: `“${label}”: ${val.message}`, severity: "error" });
        }
      }
    });
  }

  // Certifications
  if (shown("certifications")) {
    data.certifications.filter(isVisible).forEach((cert, idx) => {
      const label = cert.name || cert.issuer || `Certification ${idx + 1}`;
      if (!cert.name?.trim()) {
        issues.push({ id: `cert_name_${cert.id}`, section: "certifications", itemId: cert.id, field: "name", title: "A certification has no name", message: `The certification from “${cert.issuer || "an unknown issuer"}” needs a title.`, severity: "error" });
      }
      if (cert.date) {
        const val = validateCertificationYear(cert.date);
        if (!val.isValid && val.isFuture) {
          issues.push({ id: `cert_future_${cert.id}`, section: "certifications", itemId: cert.id, field: "date", title: "Certification date is in the future", message: `“${label}” is dated ${cert.date}.`, severity: "warning" });
        }
      }
    });
  }

  // Length
  if (ctx.pageCount && ctx.pageCount > 2) {
    issues.push({ id: "length_pages", section: "layout", field: "pages", title: `Your CV is ${ctx.pageCount} pages`, message: "Most recruiters expect one or two. Trim older roles or switch to compact spacing.", severity: "warning" });
  }

  const order: Record<HealthSeverity, number> = { error: 0, warning: 1, tip: 2 };
  return issues.sort((a, b) => order[a.severity] - order[b.severity]);
}

export type SectionCompletion = "empty" | "partial" | "complete";

/** How filled-in a section is, for the progress dots in the section navigation. */
export function sectionCompletion(data: ResumeData, key: string): SectionCompletion {
  const count = (items: { visible?: boolean }[] | undefined) => (items || []).filter(isVisible).length;
  switch (key) {
    case "personal": {
      const p = data.personalInfo;
      if (!p.fullName?.trim() && !p.email?.trim()) return "empty";
      return p.fullName?.trim() && p.email?.trim() && p.jobTitle?.trim() ? "complete" : "partial";
    }
    case "summary":
      return data.summary?.trim() ? "complete" : "empty";
    case "experience":
      return count(data.experience) === 0 ? "empty" : data.experience.filter(isVisible).every((e) => e.role && e.company && e.bullets?.some((b) => b.trim())) ? "complete" : "partial";
    case "education":
      return count(data.education) === 0 ? "empty" : "complete";
    case "skills":
      return count(data.skills) === 0 ? "empty" : "complete";
    case "languages":
      return count(data.languages) === 0 ? "empty" : "complete";
    case "projects":
      return count(data.projects) === 0 ? "empty" : "complete";
    case "certifications":
      return count(data.certifications) === 0 ? "empty" : "complete";
    case "customSections":
      return (data.customSections || []).some((s) => s.items?.some((i) => i.title?.trim())) ? "complete" : "empty";
    default: {
      const custom = data.customSections?.find((c) => c.id === key);
      return custom?.items?.some((i) => i.title?.trim()) ? "complete" : "empty";
    }
  }
}

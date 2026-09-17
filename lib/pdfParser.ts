// @ts-ignore
const pdf = require("pdf-parse/lib/pdf-parse.js");
import { ResumeData, ExperienceItem, EducationItem, SkillItem, ProjectItem, CertificationItem } from "./types";
import { emptyResumeData } from "./sampleData";

export async function parsePdfResume(buffer: Buffer): Promise<ResumeData> {
  const pdfData = await pdf(buffer);
  const text = pdfData.text || "";

  return parseResumeText(text);
}

export function parseResumeText(text: string): ResumeData {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const resume: ResumeData = JSON.parse(JSON.stringify(emptyResumeData));
  resume.id = `cv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  resume.title = "Imported CV";
  resume.createdAt = new Date().toISOString();
  resume.updatedAt = new Date().toISOString();

  if (lines.length === 0) return resume;

  // 1. EXTRACT CONTACT INFO & HEADER
  const fullText = lines.join(" \n ");

  // Email
  const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) resume.personalInfo.email = emailMatch[0];

  // Phone
  const phoneMatch = fullText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) resume.personalInfo.phone = phoneMatch[0];

  // LinkedIn
  const linkedinMatch = fullText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  if (linkedinMatch) resume.personalInfo.linkedin = linkedinMatch[0];

  // GitHub
  const githubMatch = fullText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  if (githubMatch) resume.personalInfo.github = githubMatch[0];

  // Location heuristic
  const locationMatch = fullText.match(/([A-Z][a-zA-Z\s.-]+,\s*[A-Z]{2}(?:\s+\d{5})?|[A-Z][a-zA-Z\s.-]+,\s*(?:USA|Canada|UK|United States|Germany|France|Netherlands|Australia))/);
  if (locationMatch) {
    const loc = locationMatch[0].replace(/\n/g, " ").trim();
    if (loc.length < 40) resume.personalInfo.location = loc;
  }

  // Name & Job Title (Heuristic from top 5 lines)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    // Skip lines with email, phone, or links
    if (line.includes("@") || line.includes("http") || line.includes("www") || /^\+?\d/.test(line)) {
      continue;
    }
    // Name is typically 2-4 words, starts with capital
    if (!resume.personalInfo.fullName && /^[A-Z][a-zA-Z.'-]+\s+[A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+)?$/.test(line)) {
      resume.personalInfo.fullName = line;
      resume.title = `${line} - Resume`;
      continue;
    }
    // Job title often follows name
    if (resume.personalInfo.fullName && !resume.personalInfo.jobTitle && line.length < 50) {
      if (!line.includes("@") && !line.includes("|") && !line.includes("•")) {
        resume.personalInfo.jobTitle = line;
      }
    }
  }

  // Fallback name if regex was too strict
  if (!resume.personalInfo.fullName && lines.length > 0) {
    const firstLine = lines[0];
    if (!firstLine.includes("@") && firstLine.length < 40) {
      resume.personalInfo.fullName = firstLine;
      resume.title = `${firstLine} - Resume`;
    }
  }

  // 2. DETECT MAJOR SECTION HEADERS
  const sectionKeywords = [
    { type: "summary", patterns: [/^(?:professional\s+)?summary/i, /^profile/i, /^about\s+me/i, /^career\s+objective/i] },
    { type: "experience", patterns: [/^(?:work\s+|professional\s+)?experience/i, /^employment(?:\s+history)?/i, /^career\s+history/i] },
    { type: "education", patterns: [/^education/i, /^academic(?:\s+background)?/i, /^qualifications/i] },
    { type: "skills", patterns: [/^(?:technical\s+|core\s+)?skills/i, /^technologies/i, /^competencies/i] },
    { type: "projects", patterns: [/^(?:key\s+|featured\s+|personal\s+)?projects/i, /^portfolio/i] },
    { type: "certifications", patterns: [/^certifications/i, /^licenses/i, /^certificates/i] },
  ];

  type SectionMatch = { type: string; lineIndex: number };
  const detectedSections: SectionMatch[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Section headers are usually short (< 35 chars) and all caps or title case
    if (line.length <= 35) {
      for (const kw of sectionKeywords) {
        if (kw.patterns.some((p) => p.test(line))) {
          // Avoid duplicate triggers
          if (!detectedSections.some((ds) => ds.type === kw.type)) {
            detectedSections.push({ type: kw.type, lineIndex: i });
          }
          break;
        }
      }
    }
  }

  // Sort detected sections by lineIndex
  detectedSections.sort((a, b) => a.lineIndex - b.lineIndex);

  // Helper to extract lines between two sections
  const getSectionLines = (secType: string): string[] => {
    const foundIdx = detectedSections.findIndex((s) => s.type === secType);
    if (foundIdx === -1) return [];

    const startLine = detectedSections[foundIdx].lineIndex + 1;
    const endLine =
      foundIdx + 1 < detectedSections.length
        ? detectedSections[foundIdx + 1].lineIndex
        : lines.length;

    return lines.slice(startLine, endLine);
  };

  // 3. PARSE SUMMARY
  const summaryLines = getSectionLines("summary");
  if (summaryLines.length > 0) {
    resume.summary = summaryLines.join(" ");
  }

  // 4. PARSE SKILLS
  const skillLines = getSectionLines("skills");
  if (skillLines.length > 0) {
    const skillsList: SkillItem[] = [];
    skillLines.forEach((sLine) => {
      // Check if line has a category prefix like "Languages: Python, Go" or "Frontend: React"
      const categoryMatch = sLine.match(/^([^:]+):\s*(.+)$/);
      let cat = "Technical Skills";
      let content = sLine;

      if (categoryMatch) {
        cat = categoryMatch[1].trim();
        content = categoryMatch[2].trim();
      }

      // Split by comma, bullet, pipe, or semicolon
      const tokens = content.split(/[,•|;·]/).map((t) => t.trim()).filter((t) => t.length > 1 && t.length < 35);
      tokens.forEach((token) => {
        if (!skillsList.some((s) => s.name.toLowerCase() === token.toLowerCase())) {
          skillsList.push({
            id: `sk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            name: token,
            category: cat,
            level: 5,
          });
        }
      });
    });
    if (skillsList.length > 0) {
      resume.skills = skillsList;
    }
  }

  // 5. PARSE EXPERIENCE
  const expLines = getSectionLines("experience");
  if (expLines.length > 0) {
    const expItems: ExperienceItem[] = [];
    let currentExp: ExperienceItem | null = null;

    // Date range regex (e.g. 2020 - 2023, Jan 2021 – Present)
    const dateRegex = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?(?:19|20)\d{2}\s*[-–—to]+\s*(?:(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?(?:19|20)\d{2}|Present|Current)/i;

    expLines.forEach((line) => {
      const isDateLine = dateRegex.test(line);
      const isBullet = /^[•\-\*·▪▸]\s*/.test(line) || (/^[A-Z]/.test(line) && line.length > 40);

      if (isDateLine && (!currentExp || currentExp.bullets.length > 0)) {
        // Start a new experience item
        if (currentExp) expItems.push(currentExp);

        const dateMatch = line.match(dateRegex);
        const dateStr = dateMatch ? dateMatch[0] : "";
        const remaining = line.replace(dateRegex, "").trim().replace(/[|•–—]/g, "").trim();

        const parts = remaining.split(/\s+at\s+|\s+[-–—]\s+|\s*,\s*/);
        const role = parts[0] || "Professional Role";
        const company = parts[1] || "";

        currentExp = {
          id: `exp_${Date.now()}_${expItems.length}`,
          role,
          company,
          location: "",
          startDate: dateStr.split(/[-–—to]+/i)[0]?.trim() || "",
          endDate: dateStr.split(/[-–—to]+/i)[1]?.trim() || "Present",
          current: /present|current/i.test(dateStr),
          bullets: [],
        };
      } else if (currentExp) {
        if (isBullet) {
          const cleanBullet = line.replace(/^[•\-\*·▪▸]\s*/, "").trim();
          if (cleanBullet.length > 10) {
            currentExp.bullets.push(cleanBullet);
          }
        } else if (!currentExp.company && line.length < 40) {
          currentExp.company = line;
        }
      }
    });

    if (currentExp) expItems.push(currentExp);
    if (expItems.length > 0) resume.experience = expItems;
  }

  // 6. PARSE EDUCATION
  const eduLines = getSectionLines("education");
  if (eduLines.length > 0) {
    const eduItems: EducationItem[] = [];
    let currentEdu: EducationItem | null = null;

    eduLines.forEach((line) => {
      const isDegree = /(?:Bachelor|Master|B\.?S\.?|B\.?A\.?|M\.?S\.?|Ph\.?D\.?|Associate|Diploma|Degree)/i.test(line);
      const hasDate = /(?:19|20)\d{2}/.test(line);

      if (isDegree) {
        if (currentEdu) eduItems.push(currentEdu);
        currentEdu = {
          id: `edu_${Date.now()}_${eduItems.length}`,
          degree: line,
          institution: "",
          location: "",
          startDate: "",
          endDate: "",
        };
      } else if (currentEdu) {
        if (!currentEdu.institution && /(?:University|College|Institute|School|Academy)/i.test(line)) {
          currentEdu.institution = line;
        } else if (hasDate && !currentEdu.endDate) {
          currentEdu.endDate = line;
        } else if (/(?:GPA|Honors|Cum Laude|Dean)/i.test(line)) {
          currentEdu.honors = line;
        }
      }
    });

    if (currentEdu) eduItems.push(currentEdu);
    if (eduItems.length > 0) resume.education = eduItems;
  }

  return resume;
}

// @ts-ignore
const pdf = require("pdf-parse/lib/pdf-parse.js");
import { ResumeData, ExperienceItem, EducationItem, SkillItem, LanguageItem, ProjectItem, CertificationItem, CustomSection } from "./types";
import { emptyResumeData } from "./sampleData";
import { getCategoryForSkill } from "./skillTaxonomy";

export async function parsePdfResume(buffer: Buffer): Promise<ResumeData> {
  const pdfData = await pdf(buffer);
  const text = pdfData.text || "";

  return parseResumeText(text);
}

// ----------------------------------------------------------------------------
// DATE & LOCALE HELPER CONSTANTS
// ----------------------------------------------------------------------------
const MONTH_NAMES =
  "jan(?:uary|uari)?|feb(?:ruary|ruari)?|mar(?:ch)?|mrt|maart|apr(?:il)?|may|mei|jun(?:e|i)?|jul(?:y|i)?|aug(?:ust|ustus)?|sep(?:tember)?|okt(?:ober)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?";

const PRESENT_TERMS =
  "present|current|now|ongoing|today|heden|nu|vandaag|tegenwoordig|lopend";

const DATE_CONNECTORS =
  "\\s*[-–—]\\s*|\\s+to\\s+|\\s+until\\s+|\\s+till\\s+|\\s+tot\\s+|\\s+t/m\\s+|\\s+t\\.m\\.\\s+";

// Matches e.g. "Jan 2020 - Present", "03/2018 - 05/2021", "2016 - 2021", "mrt 2019 – heden", "2020 - Heden", "May 2020"
const DATE_RANGE_REGEX = new RegExp(
  `(?:(?:(?:${MONTH_NAMES})\\.?\\s+)?(?:19|20)\\d{2}|(?:0?[1-9]|1[0-2])\\/(?:19|20)?\\d{2})` +
    `(?:(?:${DATE_CONNECTORS})` +
    `(?:(?:(?:${MONTH_NAMES})\\.?\\s+)?(?:19|20)\\d{2}|(?:0?[1-9]|1[0-2])\\/(?:19|20)?\\d{2}|${PRESENT_TERMS}))?`,
  "i"
);

// Specifically checks if a line contains a date range (has start and end or present)
const HAS_DATE_RANGE_REGEX = new RegExp(
  `(?:(?:(?:${MONTH_NAMES})\\.?\\s*)?(?:19|20)\\d{2}|(?:0?[1-9]|1[0-2])\\/(?:19|20)?\\d{2})(?:${DATE_CONNECTORS})(?:(?:(?:${MONTH_NAMES})\\.?\\s*)?(?:19|20)\\d{2}|(?:0?[1-9]|1[0-2])\\/(?:19|20)?\\d{2}|${PRESENT_TERMS})`,
  "i"
);

// ----------------------------------------------------------------------------
// SECTION HEADERS DICTIONARY (English & Dutch / Nederlands)
// ----------------------------------------------------------------------------
interface SectionMatcher {
  type: "summary" | "experience" | "education" | "skills" | "projects" | "certifications" | "awards" | "languages" | "volunteer" | "custom";
  customTitle?: string;
  regex: RegExp;
}

const SECTION_MATCHERS: SectionMatcher[] = [
  // Summary / Profile / Samenvatting
  {
    type: "summary",
    regex: /^(?:PROFESSIONAL\s+|EXECUTIVE\s+|CAREER\s+)?(?:SUMMARY|PROFILE|OVERVIEW)\b|^(?:ABOUT\s+ME|WHO\s+I\s+AM)\b|^(?:CAREER\s+)?OBJECTIVE\b|^PROFIEL\b|^PERSOONLIJK\s+PROFIEL\b|^OVER\s+MIJ\b|^WIE\s+BEN\s+IK\b|^INTRODUCTIE\b|^(?:KORTE\s+)?SAMENVATTING\b/i,
  },
  // Experience / Werkervaring
  {
    type: "experience",
    regex: /^(?:WORK|PROFESSIONAL|CAREER|RELEVANT)?\s*EXPERIENCE\b|^(?:EMPLOYMENT|CAREER|WORK)\s+HISTORY\b|^WERKERVARING\b|^ERVARING\b|^ARBEIDSVERLEDEN\b|^WERKVERLEDEN\b|^LOOPBAAN\b|^RELEVANTE\s+WERKERVARING\b/i,
  },
  // Education / Opleidingen
  {
    type: "education",
    regex: /^EDUCATION(?:\s*&\s*TRAINING|\s*&\s*QUALIFICATIONS)?\b|^ACADEMIC\s+(?:BACKGROUND|HISTORY|QUALIFICATIONS)\b|^QUALIFICATIONS\b|^ACADEMICS\b|^OPLEIDINGEN?\b|^STUDIE(?:S)?\b|^SCHOLING\b|^CURSUSSEN\b|^VORMING\b/i,
  },
  // Skills / Vaardigheden
  {
    type: "skills",
    regex: /^(?:TECHNICAL\s+|CORE\s+|PROFESSIONAL\s+|KEY\s+)?(?:SKILLS|COMPETENCIES|TECHNOLOGIES|ABILITIES)\b|^AREAS\s+OF\s+EXPERTISE\b|^TOOLS(?:\s*&\s*FRAMEWORKS)?\b|^VAARDIGHEDEN\b|^COMPETENTIES\b|^KENNIS\b|^IT-VAARDIGHEDEN\b|^VAKKENNIS\b/i,
  },
  // Languages / Talen
  {
    type: "languages",
    customTitle: "Languages & Dialects",
    regex: /^LANGUAGES(?:\s*KNOWN)?\b|^TALEN(?:KENNIS)?\b/i,
  },
  // Projects / Projecten
  {
    type: "projects",
    regex: /^(?:KEY\s+|FEATURED\s+|PERSONAL\s+|SELECTED\s+|RELEVANT\s+)?PROJECTS?\b|^PORTFOLIO\b|^PROJECTEN\b|^RELEVANTE\s+PROJECTEN\b/i,
  },
  // Certifications / Certificaten
  {
    type: "certifications",
    regex: /^(?:LICENSES\s*&\s*)?CERTIFICATIONS?\b|^CERTIFICATES?\b|^PROFESSIONAL\s+CREDENTIALS\b|^CERTIFICATEN\b|^CERTIFICERINGEN\b|^GETUIGSCHRIFTEN\b|^DIPLOMA(?:['’]S)?\b/i,
  },
  // Awards / Honors / Onderscheidingen
  {
    type: "awards",
    customTitle: "Honors & Awards",
    regex: /^(?:HONORS\s*&\s*)?AWARDS?\b|^ACCOMPLISHMENTS\b|^ACHIEVEMENTS\b|^ONDERSCHEIDINGEN\b|^PRESTATIES\b|^PRIJZEN\b/i,
  },
  // Volunteer / Nevenactiviteiten
  {
    type: "volunteer",
    customTitle: "Volunteer & Leadership",
    regex: /^(?:VOLUNTEER(?:ING)?|VOLUNTARY\s+WORK|COMMUNITY\s+SERVICE)\b|^VRIJWILLIGERSWERK\b|^NEVENACTIVITEITEN\b|^BESTUURSWERK\b/i,
  },
  // Publications / Publicaties
  {
    type: "custom",
    customTitle: "Publications",
    regex: /^PUBLICATIONS?\b|^PUBLICATIES\b|^ARTIKELEN\b/i,
  },
];

// Common job titles keywords used to separate Role from Company
const JOB_TITLE_KEYWORDS = [
  "engineer", "developer", "architect", "lead", "manager", "director", "consultant",
  "analyst", "specialist", "administrator", "designer", "intern", "officer", "coordinator",
  "technician", "programmer", "scientist", "head", "vp", "vice president", "executive",
  "founder", "co-founder", "cto", "ceo", "cfo", "product owner", "scrum master",
  "ingenieur", "ontwikkelaar", "beheerder", "adviseur", "medewerker", "stagiair"
];

// Common degree keywords (EN + NL)
const DEGREE_REGEX =
  /(?:Bachelor(?:'s)?|Master(?:'s)?|B\.?S\.?|B\.?A\.?|B\.?Sc\.?|M\.?S\.?|M\.?Sc\.?|M\.?A\.?|Ph\.?D\.?|MBA|Associate(?:'s)?|Diploma|Degree|Engineer|HBO|WO|MBO|VWO|HAVO|VMBO|Propedeuse|Ing\.|Drs\.|Ir\.)/i;

const CERT_KEYWORD_REGEX =
  /(?:Certified|Certificate|Certification|CEH|AWS|Azure|GCP|Security\+|CompTIA|CISSP|PMP|Scrum|VCA|Prince2|ITIL|Kubernetes|CKA|CKAD)/i;

export function parseResumeText(text: string): ResumeData {
  const resume: ResumeData = JSON.parse(JSON.stringify(emptyResumeData));
  resume.id = `cv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  resume.title = "Imported CV";
  resume.createdAt = new Date().toISOString();
  resume.updatedAt = new Date().toISOString();

  if (!text || !text.trim()) return resume;

  // --------------------------------------------------------------------------
  // 1. EXTRACT CONTACT INFO & SOCIAL LINKS
  // --------------------------------------------------------------------------
  // Email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) resume.personalInfo.email = emailMatch[0];

  // Phone (Standard US/International + Dutch mobile/landline e.g. +31 6 12345678 or 06-12345678)
  const phoneMatch = text.match(
    /(?:\+\d{1,3}[\s.-]*)?(?:\(?\d{1,4}\)?[\s.-]*)?\d{3,4}[\s.-]?\d{3,4}|\b06[\s.-]?\d{8}\b/
  );
  if (phoneMatch) {
    const rawPhone = phoneMatch[0].trim();
    // Prepend + if starting with country code like 31
    resume.personalInfo.phone = rawPhone;
  }

  // LinkedIn (Full URL or username)
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  if (linkedinMatch) {
    resume.personalInfo.linkedin = linkedinMatch[0];
  } else if (emailMatch) {
    const usernameMatch = emailMatch[0].split("@")[0];
    if (new RegExp(`linkedin.*${usernameMatch}|${usernameMatch}.*linkedin`, "i").test(text)) {
      resume.personalInfo.linkedin = `linkedin.com/in/${usernameMatch}`;
    }
  }

  // GitHub (Full URL or username)
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  if (githubMatch) {
    resume.personalInfo.github = githubMatch[0];
  } else if (emailMatch) {
    const usernameMatch = emailMatch[0].split("@")[0];
    if (new RegExp(`github.*${usernameMatch}|${usernameMatch}.*github`, "i").test(text)) {
      resume.personalInfo.github = `github.com/${usernameMatch}`;
    }
  }

  // Website / Portfolio
  const emailDomain = (resume.personalInfo.email.split("@")[1] || "").toLowerCase();
  const websiteMatches = Array.from(
    text.matchAll(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.(?:com|org|io|dev|net|me|co|nl|sr|app|tech)(?:\/[^\s,\-]*)?)/gi)
  );
  for (const wm of websiteMatches) {
    const domain = wm[1] || wm[0];
    if (
      !/gmail\.com|yahoo\.com|outlook\.com|hotmail\.com|icloud\.com|proton\.me|linkedin\.com|github\.com|gitlab\.com/i.test(domain) &&
      // The domain of the candidate's own email address is their mail provider or employer, not a portfolio
      domain.toLowerCase() !== emailDomain
    ) {
      resume.personalInfo.website = domain.replace(/^https?:\/\//, "");
      break;
    }
  }

  // Location / Woonplaats heuristic
  // Checks for: "City, Country", "City, State ZIP", or "Woonplaats: City"
  const dutchLocationMatch = text.match(/(?:Woonplaats|Location|Adres|Address):\s*([A-Za-z\s.-]+(?:,\s*[A-Za-z\s.-]+)?)/i);
  if (dutchLocationMatch && dutchLocationMatch[1].trim().length < 45) {
    resume.personalInfo.location = dutchLocationMatch[1].trim();
  } else {
    const US_STATES =
      "AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY";
    const locRegex = new RegExp(
      `(?:^[\\s|•]+|[|•\\n\\r]\\s*)([A-Z][a-zA-Z\\s.-]{2,25}),\\s*(${US_STATES})(?:\\s+\\d{5})?(?:\\b|(?=[|•\\n\\r]))|` +
        `(?:^[\\s|•]+|[|•\\n\\r]\\s*)([A-Z][a-zA-Z\\s.-]{2,25}),\\s*(USA|Canada|UK|United States|Germany|France|Netherlands|Nederland|Suriname|Brazil|Australia|Belgium|België)\\b`,
      "im"
    );
    const locationMatch = text.match(locRegex);
    if (locationMatch) {
      const loc = (locationMatch[0] || "").replace(/^[|•\s\n\r]+|[|•\s\n\r]+$/g, "").trim();
      if (loc.length < 45) resume.personalInfo.location = loc;
    }
  }

  // --------------------------------------------------------------------------
  // 2. NORMALIZE LINES & UN-INLINE SECTION HEADERS
  // --------------------------------------------------------------------------
  const rawLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const lines: string[] = [];
  for (const line of rawLines) {
    let matched = false;
    for (const sec of SECTION_MATCHERS) {
      const m = line.match(sec.regex);
      if (m && m.index === 0) {
        // Guard against false positives like "Certificate of completion in..." inside bullet
        const headerCandidate = line.substring(0, m[0].length).trim();
        const restCandidate = line.substring(m[0].length).trim();

        // If the header itself is the whole line or rest is followed by capitalized text/colon/date
        if (
          restCandidate.length === 0 ||
          restCandidate.startsWith(":") ||
          restCandidate.startsWith("-") ||
          /^[A-Z0-9]/.test(restCandidate)
        ) {
          lines.push(headerCandidate.replace(/:$/, ""));
          if (restCandidate.replace(/^[:\s-]+/, "")) {
            lines.push(restCandidate.replace(/^[:\s-]+/, ""));
          }
          matched = true;
          break;
        }
      }
    }
    if (!matched) {
      lines.push(line);
    }
  }

  // --------------------------------------------------------------------------
  // 3. EXTRACT CANDIDATE NAME & JOB TITLE
  // --------------------------------------------------------------------------
  // Look at the first 8 non-contact, non-section lines
  for (let i = 0; i < Math.min(8, lines.length); i++) {
    const line = lines[i];
    if (
      line.includes("@") ||
      line.includes("http") ||
      line.includes("www") ||
      line.includes(".com") ||
      line.includes(".nl") ||
      line.includes(".io") ||
      /^\+?\d/.test(line) ||
      /^Curriculum\s+Vitae|^Resume|^CV\b/i.test(line) ||
      /^Personalia\b/i.test(line)
    ) {
      continue;
    }

    if (SECTION_MATCHERS.some((sec) => sec.regex.test(line))) {
      break;
    }

    // Clean any post-nominal credential (e.g. ", MBA", ", Ph.D.", ", PMP") from the name line
    const cleanNameCandidate = line.replace(/,\s*(?:MBA|Ph\.?D\.?|M\.?D\.?|PMP|CPA|Esq\.?|PE)\b/i, "").trim();

    // Check if line looks like a person's full name:
    // Allows Dutch prefixes (van, den, der, de, ten, ter) and capitalized names
    const isPersonName =
      /^[A-ZÀ-ÖØ-öø-ÿ][a-zA-ZÀ-ÖØ-öø-ÿ.'-]+(?:\s+(?:van\s+den|van\s+der|van\s+de|van|den|der|de|ten|ter|von|du|da|di|[A-ZÀ-ÖØ-öø-ÿ][a-zA-ZÀ-ÖØ-öø-ÿ.'-]+))+$/.test(
        cleanNameCandidate
      ) &&
      cleanNameCandidate.length < 50 &&
      !JOB_TITLE_KEYWORDS.some((kw) => cleanNameCandidate.toLowerCase().includes(kw));

    if (!resume.personalInfo.fullName && isPersonName) {
      resume.personalInfo.fullName = cleanNameCandidate;
      resume.title = `${cleanNameCandidate} - Resume`;
      continue;
    }

    // Check if line is a job title
    if (
      resume.personalInfo.fullName &&
      !resume.personalInfo.jobTitle &&
      line.length < 65 &&
      !line.includes("@") &&
      !line.includes("•") &&
      !line.includes(".com") &&
      !line.includes(".nl") &&
      !line.includes("github") &&
      !line.includes("linkedin") &&
      !/^\d/.test(line)
    ) {
      resume.personalInfo.jobTitle = line;
    }
  }

  // Fallback name if strict regex missed it
  if (!resume.personalInfo.fullName && lines.length > 0) {
    for (const line of lines.slice(0, 4)) {
      if (!line.includes("@") && !line.includes("http") && line.length < 40 && !SECTION_MATCHERS.some((s) => s.regex.test(line))) {
        resume.personalInfo.fullName = line;
        resume.title = `${line} - Resume`;
        break;
      }
    }
  }

  // --------------------------------------------------------------------------
  // 4. MAP SECTION BOUNDARIES
  // --------------------------------------------------------------------------
  interface DetectedSection {
    type: SectionMatcher["type"];
    customTitle?: string;
    lineIndex: number;
  }

  const detectedSections: DetectedSection[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const sec of SECTION_MATCHERS) {
      if (sec.regex.test(line)) {
        // Prevent duplicate sections of the exact same type at adjacent indices
        if (!detectedSections.some((ds) => ds.lineIndex === i)) {
          detectedSections.push({
            type: sec.type,
            customTitle: sec.customTitle,
            lineIndex: i,
          });
        }
        break;
      }
    }
  }

  detectedSections.sort((a, b) => a.lineIndex - b.lineIndex);

  const getSectionLines = (secType: SectionMatcher["type"]): string[] => {
    const matches = detectedSections.filter((s) => s.type === secType);
    if (matches.length === 0) return [];

    let combined: string[] = [];
    for (const match of matches) {
      const idx = detectedSections.indexOf(match);
      const startLine = match.lineIndex + 1;
      const endLine = idx + 1 < detectedSections.length ? detectedSections[idx + 1].lineIndex : lines.length;
      combined = combined.concat(lines.slice(startLine, endLine));
    }
    return combined;
  };

  // --------------------------------------------------------------------------
  // 5. PARSE SUMMARY
  // --------------------------------------------------------------------------
  const summaryLines = getSectionLines("summary");
  if (summaryLines.length > 0) {
    resume.summary = summaryLines.join(" ");
  }

  // --------------------------------------------------------------------------
  // 6. PARSE SKILLS
  // --------------------------------------------------------------------------
  const skillLines = getSectionLines("skills");
  if (skillLines.length > 0) {
    const skillsList: SkillItem[] = [];

    skillLines.forEach((sLine) => {
      // Formats: "Languages: Python, Go" or "Databases - PostgreSQL, Redis"
      const categoryMatch = sLine.match(/^([^:\-–—]+)[:\-–—]\s*(.+)$/);
      let cat = "Technical Skills";
      let content = sLine;

      if (categoryMatch && categoryMatch[1].length < 35) {
        cat = categoryMatch[1].trim();
        content = categoryMatch[2].trim();
        if (/^languages?$/i.test(cat)) {
          cat = "Programming Languages";
        }
      }

      if (content.includes("http") || content.includes("@") || content.length > 300) return;

      const tokens = content
        .split(/[,•|;·/]/)
        .map((t) => t.trim().replace(/^[•\-\*·▪▸]\s*/, ""))
        .filter((t) => t.length > 1 && t.length < 40 && !/^(and|etc|including|with|skills|kennis)\b/i.test(t));

      tokens.forEach((token) => {
        if (!skillsList.some((s) => s.name.toLowerCase() === token.toLowerCase())) {
          const resolvedCategory = cat === "Technical Skills" ? getCategoryForSkill(token) : cat;
          skillsList.push({
            id: `sk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: token,
            category: resolvedCategory,
            level: 5,
          });
        }
      });
    });

    if (skillsList.length > 0) {
      resume.skills = skillsList;
    }
  }

  // --------------------------------------------------------------------------
  // 7. PARSE EXPERIENCE / WERKERVARING
  // --------------------------------------------------------------------------
  const expLines = getSectionLines("experience");
  if (expLines.length > 0) {
    const expItems: ExperienceItem[] = [];
    let currentExp: ExperienceItem | null = null;

    for (let i = 0; i < expLines.length; i++) {
      const line = expLines[i];
      const hasDate = HAS_DATE_RANGE_REGEX.test(line);
      const isBullet = /^[•\-\*·▪▸]\s*/.test(line);

      // Check if line represents a job entry header (has date range, or next line has date range)
      const nextLine = i + 1 < expLines.length ? expLines[i + 1] : "";
      const isNextLineDate = HAS_DATE_RANGE_REGEX.test(nextLine);

      if (hasDate) {
        if (currentExp) expItems.push(currentExp);

        const dateMatch = line.match(DATE_RANGE_REGEX);
        const dateStr = dateMatch ? dateMatch[0] : "";
        const remaining = line
          .replace(DATE_RANGE_REGEX, "")
          .replace(/\((?:part-time|contract|remote|full-time|voltijd|deeltijd|stage)\)/i, "")
          .replace(/^[|•–—\s,]+|[|•–—\s,]+$/g, "")
          .trim();

        // Separate Role and Company from remaining text
        // Formats: "Senior Developer at Stripe", "Lead Engineer - Google", "Software Engineer // Acme Corp", "Acme Corp, Web Developer"
        const { role, company } = disambiguateRoleAndCompany(remaining);

        const { startDate, endDate, current } = parseDateRange(dateStr);

        currentExp = {
          id: `exp_${Date.now()}_${expItems.length}`,
          role: role || "Software Engineer",
          company: company || "",
          location: "",
          startDate,
          endDate,
          current,
          bullets: [],
        };
      } else if (isNextLineDate && !isBullet && line.length < 90) {
        // Line is Company or Role, and next line is Date
        if (currentExp) expItems.push(currentExp);

        const { role, company } = disambiguateRoleAndCompany(line);
        const dateMatch = nextLine.match(DATE_RANGE_REGEX);
        const dateStr = dateMatch ? dateMatch[0] : "";
        const { startDate, endDate, current } = parseDateRange(dateStr);

        // Check if next line also had location (e.g. "2021 - Present | Seattle, WA")
        const locPart = nextLine.replace(DATE_RANGE_REGEX, "").replace(/^[|\s,–—-]+|[|\s,–—-]+$/g, "").trim();

        currentExp = {
          id: `exp_${Date.now()}_${expItems.length}`,
          role: role || "Software Engineer",
          company: company || "",
          location: locPart || "",
          startDate,
          endDate,
          current,
          bullets: [],
        };
        i++; // skip next line as it was consumed for date
      } else if (currentExp) {
        // Line is part of the current experience item (company/location subtitle, or bullet description)
        if (!currentExp.company && (line.includes("//") || (!isBullet && line.length < 50 && !/^[a-z]/.test(line)))) {
          const parts = line.split("//").map((s) => s.trim());
          currentExp.company = parts[0] || currentExp.company;
          if (parts[1]) currentExp.location = parts[1];
        } else {
          const cleanLine = line.replace(/^[•\-\*·▪▸]\s*/, "").trim();
          const startsNewSentence =
            /^[A-Z]/.test(cleanLine) &&
            !/^(and|or|with|to|in|for|on|by|using|including|which|that|en|met|van|voor|waarbij)\b/i.test(cleanLine);

          if (isBullet || (startsNewSentence && cleanLine.length > 25)) {
            currentExp.bullets.push(cleanLine);
          } else if (currentExp.bullets.length > 0) {
            currentExp.bullets[currentExp.bullets.length - 1] += " " + cleanLine;
          } else {
            currentExp.bullets.push(cleanLine);
          }
        }
      }
    }

    if (currentExp) expItems.push(currentExp);
    if (expItems.length > 0) resume.experience = expItems;
  }

  // --------------------------------------------------------------------------
  // 8. PARSE EDUCATION & CERTIFICATIONS (Disambiguated)
  // --------------------------------------------------------------------------
  const eduLines = getSectionLines("education");
  const certLines = getSectionLines("certifications");
  const combinedEduAndCertLines = [...eduLines];

  const eduItems: EducationItem[] = [];
  const certItems: CertificationItem[] = [];
  let currentEdu: EducationItem | null = null;

  combinedEduAndCertLines.forEach((line) => {
    const isCert = CERT_KEYWORD_REGEX.test(line) && !DEGREE_REGEX.test(line);
    const isDegree = DEGREE_REGEX.test(line) && !isCert;
    const dateMatch = line.match(DATE_RANGE_REGEX);
    const dateStr = dateMatch ? dateMatch[0] : "";

    if (isDegree) {
      if (currentEdu) eduItems.push(currentEdu);
      const remaining = line.replace(DATE_RANGE_REGEX, "").replace(/^[–—\s,]+|[–—\s,]+$/g, "").trim();
      const { startDate, endDate } = parseDateRange(dateStr);

      const parts = remaining.split(/\s+at\s+|\s+[-–—]\s+|\s*,\s*/);
      const degree = parts[0] || line;
      const institution = parts[1] || "";

      currentEdu = {
        id: `edu_${Date.now()}_${eduItems.length}`,
        degree,
        institution,
        location: "",
        startDate,
        endDate,
      };
    } else if (isCert) {
      const name = line.replace(DATE_RANGE_REGEX, "").replace(/^[–—\s,]+|[–—\s,]+$/g, "").trim();
      certItems.push({
        id: `cert_${Date.now()}_${certItems.length}`,
        name: name || line,
        issuer: "",
        date: dateStr,
        url: "",
      });
    } else if (currentEdu && !currentEdu.institution && line.length < 75 && !/^[•\-\*]/.test(line)) {
      const parts = line.split("//").map((s) => s.trim());
      currentEdu.institution = parts[0];
      if (parts[1]) currentEdu.location = parts[1];
    } else if (certItems.length > 0 && !certItems[certItems.length - 1].issuer && line.length < 75) {
      const parts = line.split("//").map((s) => s.trim());
      certItems[certItems.length - 1].issuer = parts[0];
      if (parts[1]) certItems[certItems.length - 1].url = parts[1];
    }
  });

  if (currentEdu) eduItems.push(currentEdu);
  if (eduItems.length > 0) resume.education = eduItems;

  if (certLines.length > 0) {
    certLines.forEach((line) => {
      const dateMatch = line.match(DATE_RANGE_REGEX);
      const dateStr = dateMatch ? dateMatch[0] : "";
      const name = line.replace(DATE_RANGE_REGEX, "").replace(/^[–—\s,]+|[–—\s,]+$/g, "").trim();
      if (name.length > 2 && !certItems.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
        certItems.push({
          id: `cert_${Date.now()}_${certItems.length}`,
          name,
          issuer: "",
          date: dateStr,
          url: "",
        });
      }
    });
  }

  if (certItems.length > 0) resume.certifications = certItems;

  // --------------------------------------------------------------------------
  // 9. PARSE PROJECTS
  // --------------------------------------------------------------------------
  const projLines = getSectionLines("projects");
  if (projLines.length > 0) {
    const projects: ProjectItem[] = [];
    let currentProj: ProjectItem | null = null;

    projLines.forEach((line) => {
      const isHeader =
        (line.includes("–") || line.includes(" - ") || line.includes("—") || line.includes("//")) &&
        !line.startsWith("-") &&
        !line.startsWith("•");
      const isBullet = /^[•\-\*·▪▸]\s*/.test(line);

      if (isHeader && !isBullet && line.length < 90) {
        if (currentProj) projects.push(currentProj);
        const parts = line.split(/[-–—//]/).map((s) => s.trim());
        const name = parts[0] || "Project";
        const link = parts[1] && (parts[1].includes(".") || parts[1].startsWith("http")) ? parts[1] : "";

        currentProj = {
          id: `proj_${Date.now()}_${projects.length}`,
          name,
          description: "",
          techStack: [],
          link,
          github: "",
        };
      } else if (currentProj) {
        if (isBullet) {
          const cleanBullet = line.replace(/^[•\-\*·▪▸]\s*/, "").trim();
          currentProj.description += (currentProj.description ? "\n• " : "• ") + cleanBullet;
        } else {
          currentProj.description += (currentProj.description ? " " : "") + line;
        }
      }
    });

    if (currentProj) projects.push(currentProj);
    if (projects.length > 0) resume.projects = projects;
  }

  // --------------------------------------------------------------------------
  // 10. PARSE SPOKEN LANGUAGES
  // --------------------------------------------------------------------------
  const langLines = getSectionLines("languages");
  if (langLines.length > 0) {
    const parsedLanguages: LanguageItem[] = [];
    langLines.forEach((line) => {
      if (line.length > 80 || line.includes("@") || line.includes("http")) return;
      const parts = line.split(/[:\-\–\—\(\)]/).map((s) => s.trim()).filter(Boolean);
      if (parts.length >= 1) {
        const name = parts[0];
        const proficiency = parts[1] || "Professional Working (B2)";
        if (!parsedLanguages.some((l) => l.name.toLowerCase() === name.toLowerCase())) {
          parsedLanguages.push({
            id: `lang_${Date.now()}_${parsedLanguages.length}`,
            name,
            proficiency,
            visible: true,
          });
        }
      }
    });
    if (parsedLanguages.length > 0) {
      resume.languages = parsedLanguages;
      if (!resume.sectionOrder.includes("languages")) {
        resume.sectionOrder.push("languages");
      }
    }
  }

  // --------------------------------------------------------------------------
  // 11. PARSE CUSTOM SECTIONS (Awards, Volunteer, Publications)
  // --------------------------------------------------------------------------
  const customSectionTypes: SectionMatcher["type"][] = ["awards", "volunteer", "custom"];
  const customSections: CustomSection[] = [];

  for (const cType of customSectionTypes) {
    const secLines = getSectionLines(cType);
    if (secLines.length === 0) continue;

    const matchedMeta = detectedSections.find((ds) => ds.type === cType);
    const title = matchedMeta?.customTitle || (cType === "awards" ? "Honors & Awards" : "Additional Information");

    const items: { id: string; title: string; subtitle: string; date: string; description: string }[] = [];
    let currentItem: { id: string; title: string; subtitle: string; date: string; description: string } | null = null;

    secLines.forEach((line) => {
      const yearMatch = line.match(/(?:19|20)\d{2}/);
      const isHeader =
        line.includes("//") ||
        line.includes(":") ||
        line.includes("place") ||
        line.includes("MVP") ||
        line.includes("Winner") ||
        line.length < 50;

      if (isHeader) {
        if (currentItem) items.push(currentItem);
        const parts = line.split(/[//:]/).map((s) => s.trim());
        const itemTitle = parts[0] || line;
        const subtitle = parts[1] || "";
        const date = yearMatch ? yearMatch[0] : "";

        currentItem = {
          id: `cst_${Date.now()}_${items.length}`,
          title: itemTitle,
          subtitle,
          date,
          description: "",
        };
      } else if (currentItem) {
        currentItem.description += (currentItem.description ? " " : "") + line;
      }
    });

    if (currentItem) items.push(currentItem);

    if (items.length > 0) {
      customSections.push({
        id: `sec_${Date.now()}_${customSections.length}`,
        title,
        items,
      });
    }
  }

  if (customSections.length > 0) {
    resume.customSections = customSections;
    if (!resume.sectionOrder.includes("customSections")) {
      resume.sectionOrder.push("customSections");
    }
  }

  return resume;
}

// ----------------------------------------------------------------------------
// HELPER: DISAMBIGUATE ROLE AND COMPANY
// ----------------------------------------------------------------------------
function disambiguateRoleAndCompany(text: string): { role: string; company: string } {
  if (!text) return { role: "", company: "" };

  // Split by common separators: " at ", " @ ", " - ", " // ", ", "
  const delimiters = [/\s+at\s+/i, /\s+@\s+/, /\s*[-–—]\s*/, /\s*\/\/\s*/, /\s*\|\s*/, /\s*,\s*/];

  for (const delim of delimiters) {
    if (delim.test(text)) {
      const parts = text.split(delim).map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const part0 = parts[0];
        const part1 = parts[1];

        // Check which part contains job title keywords
        const p0IsTitle = JOB_TITLE_KEYWORDS.some((kw) => part0.toLowerCase().includes(kw));
        const p1IsTitle = JOB_TITLE_KEYWORDS.some((kw) => part1.toLowerCase().includes(kw));

        if (p0IsTitle && !p1IsTitle) {
          return { role: part0, company: part1 };
        } else if (p1IsTitle && !p0IsTitle) {
          return { role: part1, company: part0 };
        }

        // Default convention: Role usually comes first
        return { role: part0, company: part1 };
      }
    }
  }

  return { role: text, company: "" };
}

// ----------------------------------------------------------------------------
// HELPER: PARSE DATE RANGE (Start, End, Current)
// ----------------------------------------------------------------------------
function parseDateRange(dateStr: string): { startDate: string; endDate: string; current: boolean } {
  if (!dateStr) return { startDate: "", endDate: "", current: false };

  const isCurrent = new RegExp(PRESENT_TERMS, "i").test(dateStr);
  const parts = dateStr.split(new RegExp(DATE_CONNECTORS, "i")).map((p) => p.trim()).filter(Boolean);

  let startDate = parts[0] || "";
  let endDate = parts.length > 1 ? parts[1] : isCurrent ? "Present" : "";

  // Normalize Dutch "Heden" / "Nu" to "Present" for UI consistency
  if (new RegExp(PRESENT_TERMS, "i").test(endDate)) {
    endDate = "Present";
  }

  return { startDate, endDate, current: isCurrent };
}

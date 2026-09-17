# AGENTS.md — Agent & AI Guidelines for CV-Builder (ApexCV)

This document provides complete, high-density architectural context and operational guidelines so AI agents (Gemini, Antigravity, Claude, Cursor) do not need to scrape or re-explore the codebase on each invocation.

---

## 1. Project Overview

- **Project Name:** ApexCV / CV-Builder
- **Domain:** Modern resume and CV authoring platform with real-time preview, ATS compliance, drag-and-drop section reordering, PDF importing, and vector PDF printing.
- **Framework:** Next.js 14.2 (App Router)
- **Runtime:** Node.js 22+ (MANDATORY: relies on Node 22's built-in `node:sqlite` via `DatabaseSync`)
- **Default Port:** `3001` (`npm run dev -p 3001`)
- **Primary Styling:** Tailwind CSS 3.4 with custom typography and print styles
- **State Management:** React local state + debounced (800ms) REST API autosave to SQLite

---

## 2. Tech Stack & Dependencies

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14.2.23 (App Router) | Full-stack React framework |
| **Language** | TypeScript 5.7.2 | Strict typed interfaces (`lib/types.ts`) |
| **Styling** | Tailwind CSS 3.4, `tailwind-merge`, `clsx` | Utility-first UI + print media formatting |
| **Database** | `node:sqlite` (`DatabaseSync`) | Embedded SQLite database (zero external services) |
| **PDF Parsing** | `pdf-parse` (1.1.1) + custom regex parser | Text extraction & heuristic resume parsing |
| **PDF Export** | Browser native `@media print` (`window.print()`) | Crisp vector PDF export of `#cv-printable-sheet` |
| **Icons** | `lucide-react` | Clean icon system |
| **Testing** | `puppeteer-core` (25.11.0) | E2E browser automation & visual testing |

---

## 3. Directory Map & Component Responsibilities

```
cv-builder/
├── AGENTS.md                  # This file: AI agent operational reference
├── README.md                  # Human & developer documentation
├── Dockerfile                 # Multi-stage Node 22 Alpine container
├── docker-compose.yml         # Containerized production runtime
├── package.json               # Scripts & dependencies
├── tailwind.config.ts         # Tailwind palette, fonts & animations
├── cv_builder.db              # Default local SQLite database file
├── app/
│   ├── layout.tsx             # Root layout with Inter font & global styles
│   ├── globals.css            # Base styles & @media print stylesheet
│   ├── page.tsx               # Landing / Marketing page (ApexCV Showcase & Tiers)
│   ├── app/
│   │   ├── page.tsx           # Dashboard: list CVs, search, create modal, PDF import modal
│   │   └── [id]/
│   │       └── page.tsx       # Live CV Editor page (fetches CV by id, renders CvEditor)
│   └── api/
│       ├── auth/
│       │   └── claim/route.ts # POST: links guest CVs to a user ID/name in SQLite
│       └── resumes/
│           ├── route.ts       # GET (list all resumes), POST (create new resume)
│           ├── [id]/
│           │   ├── route.ts   # GET (fetch resume JSON), PUT (update), DELETE (remove)
│           │   └── duplicate/
│           │       └── route.ts # POST (clone resume with new ID and "(Copy)" title)
│           └── parse-pdf/
│               └── route.ts   # POST (multipart/form-data upload -> text parse -> ResumeData)
├── components/
│   ├── editor/
│   │   ├── CvEditor.tsx       # Core editor shell (state, tabs, autosave debounce, print)
│   │   ├── SectionList.tsx    # Drag-and-drop / arrow reordering for sections
│   │   ├── forms/             # Modular section form components
│   │   │   ├── PersonalInfoForm.tsx
│   │   │   ├── SummaryForm.tsx
│   │   │   ├── ExperienceForm.tsx
│   │   │   ├── EducationForm.tsx
│   │   │   ├── SkillsForm.tsx
│   │   │   ├── ProjectsForm.tsx
│   │   │   └── CertificationsForm.tsx
│   │   └── styling/
│   │       └── ThemeToolbar.tsx # Template selector, font picker, accent colors, spacing
│   └── preview/
│       ├── CvPreview.tsx      # Sheet container (#cv-printable-sheet), zoom, template switch
│       └── templates/         # 5 ATS & executive resume templates
│           ├── ModernTechTemplate.tsx   # id: "modern-tech" (Software & tech)
│           ├── ExecutiveTemplate.tsx    # id: "executive" (Serif, corporate leadership)
│           ├── CreativeTemplate.tsx     # id: "creative" (Header banner, badges)
│           ├── SidebarTemplate.tsx      # id: "sidebar" (Two-column layout)
│           └── AtsClassicTemplate.tsx   # id: "ats-classic" (Harvard style, 100% ATS)
├── lib/
│   ├── types.ts               # Core TypeScript data structures & types
│   ├── db.ts                  # SQLite initialization, queries, and upsert helpers
│   ├── sampleData.ts          # Default seed data (Alex Rivera) & emptyResumeData
│   └── pdfParser.ts           # Heuristic resume extractor from plain PDF text
└── scripts/
    ├── test-e2e.mjs           # Puppeteer E2E tests (landing, dashboard, editor, themes)
    └── test-pdf-import.mjs    # Puppeteer tests for PDF upload & parsing flow
```

---

## 4. Key Data Models (`lib/types.ts`)

### `ResumeData` (Core Document)
```typescript
export interface ResumeData {
  id: string;                      // e.g. "cv_1710000000_abcde"
  userId?: string;                 // optional owner identifier
  title: string;                   // resume document title
  personalInfo: PersonalInfo;      // fullName, jobTitle, email, phone, location, links, avatarUrl
  summary: string;                 // markdown/plain summary text
  experience: ExperienceItem[];    // role, company, location, startDate, endDate, current, bullets[]
  education: EducationItem[];      // degree, institution, location, startDate, endDate, gpa, honors
  skills: SkillItem[];             // name, category, level (1-5)
  projects: ProjectItem[];         // name, description, techStack[], link, github
  certifications: CertificationItem[]; // name, issuer, date, url
  customSections: CustomSection[]; // flexible additional sections
  sectionOrder: string[];          // e.g. ['summary', 'experience', 'education', 'skills', ...]
  themeConfig: ThemeConfig;        // templateId, fontFamily, fontSize, accentColor, spacing, etc.
  createdAt: string;               // ISO timestamp
  updatedAt: string;               // ISO timestamp
}
```

### `ThemeConfig`
- `templateId`: `"modern-tech"` | `"executive"` | `"creative"` | `"sidebar"` | `"ats-classic"`
- `fontFamily`: `"inter"` | `"merriweather"` | `"roboto-mono"` | `"playfair"` | `"plus-jakarta"`
- `spacing`: `"compact"` | `"standard"` | `"spacious"`
- `fontSize`: `"sm"` | `"base"` | `"lg"`
- `accentColor`: Hex color (e.g. `"#0284c7"`, `"#0f172a"`, `"#4f46e5"`)
- `showAvatar`: boolean
- `showIcons`: boolean

---

## 5. Database Architecture (`lib/db.ts`)

- Uses Node 22 built-in `node:sqlite` (`DatabaseSync`).
- Database location: `process.env.DB_PATH || path.join(process.cwd(), "cv_builder.db")`.
- Tables:
  1. `users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT, created_at TEXT NOT NULL)`
  2. `resumes (id TEXT PRIMARY KEY, user_id TEXT, title TEXT NOT NULL, data TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`
- On first startup, if `resumes` table is empty, seeds default resume from `lib/sampleData.ts`.

---

## 6. Developer & Testing Commands

```bash
# Run local dev server on port 3001
npm run dev

# Production build
npm run build

# Start production server on port 3001
npm run start

# Run ESLint
npm run lint

# Run automated Puppeteer E2E tests (server must be running on localhost:3001)
node scripts/test-e2e.mjs

# Run PDF import tests (server must be running on localhost:3001)
node scripts/test-pdf-import.mjs
```

---

## 7. Critical Architectural Rules & Agent Guidelines

1. **Client vs Server Isolation for SQLite:**
   - `lib/db.ts` uses `node:sqlite` which is a **Node.js runtime module**.
   - **NEVER** import `lib/db.ts` directly inside components marked with `"use client"`.
   - Client components must communicate with database via API routes (`/api/resumes/**`).

2. **Print & PDF Generation:**
   - Vector PDF generation uses native browser print (`window.print()`).
   - `#cv-printable-sheet` in `components/preview/CvPreview.tsx` is the sole printable element.
   - All navigation bars, controls, toolbars, and buttons must include the `no-print` CSS class (defined in `app/globals.css`).
   - Do NOT delete or rename `#cv-printable-sheet` or `.no-print`.

3. **Port 3001 Convention:**
   - Next.js is configured to run on port `3001` (to prevent conflicts with common 3000 services).
   - All tests, docker setups, and internal links assume `localhost:3001`.

4. **Section Reordering Logic:**
   - `resume.sectionOrder` is an array of section keys (`"summary"`, `"experience"`, `"education"`, `"skills"`, `"projects"`, `"certifications"`).
   - Templates dynamically loop through `sectionOrder` to determine rendering hierarchy.

5. **PDF Parser Extensibility (`lib/pdfParser.ts`):**
   - Employs regex matching for emails, phones, URLs, dates, and common resume section headers (e.g. `EXPERIENCE`, `EDUCATION`, `SKILLS`).
   - When improving parsing, keep fallback safety so partially matched documents still populate gracefully without crashing.

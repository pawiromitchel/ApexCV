# AGENTS.md — Agent & AI Guidelines for CV-Builder (ApexCV)

This document provides architectural context and operational guidelines.

---

## 1. Project Overview

- **Project Name:** ApexCV / CV-Builder
- **Domain:** Resume and CV authoring platform with real-time preview, drag-and-drop section reordering, PDF importing, and vector PDF printing.
- **Framework:** Next.js 14.2 (App Router)
- **Runtime:** Node.js 22+ (relies on Node 22's built-in `node:sqlite` via `DatabaseSync`)
- **Default Port:** `3001` (`npm run dev -p 3001`)
- **Primary Styling:** Tailwind CSS 3.4 with custom typography and print styles
- **State Management:** React local state + debounced REST API autosave to SQLite

---

## 2. Tech Stack & Dependencies

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14.2.23 (App Router) | Full-stack React framework |
| **Language** | TypeScript 5.7.2 | Strict typed interfaces (`lib/types.ts`) |
| **Styling** | Tailwind CSS 3.4, `tailwind-merge`, `clsx` | Utility-first UI + print media formatting |
| **Database** | `node:sqlite` (`DatabaseSync`) | Embedded SQLite database (zero external services) |
| **PDF Parsing** | `pdf-parse` (1.1.1) | Text extraction & heuristic resume parsing |
| **PDF Export** | Browser native `@media print` (`window.print()`) | Vector PDF export of `#cv-printable-sheet` |

---

## 3. Directory Map & Component Responsibilities

```
cv-builder/
├── AGENTS.md                  
├── README.md                  
├── app/
│   ├── page.tsx               # Landing / Marketing page
│   ├── app/
│   │   ├── page.tsx           # Dashboard
│   │   └── [id]/page.tsx      # Live CV Editor
│   ├── view/
│   │   └── [id]/page.tsx      # Public Shareable CV
│   └── api/                   # REST endpoints (/api/resumes, /api/auth)
├── components/
│   ├── ui/                    # Reusable UI components (Input, Textarea, Label, Button)
│   ├── editor/                # Core editor shell (CvEditor, SectionList, styling, forms)
│   │   └── forms/             # Forms for sections (PersonalInfo, Experience, etc.)
│   └── preview/               # Print-ready preview (CvPreview, templates)
├── lib/
│   ├── db.ts                  # SQLite initialization and queries
│   ├── types.ts               # Core TS data structures
│   └── utils.ts               # Utility functions (cn for tailwind classes)
└── scripts/                   # Puppeteer testing scripts
```

---

## 4. Key Data Models (`lib/types.ts`)

Refer to `lib/types.ts` for detailed structures of `ResumeData`, `ThemeConfig`, and section items (`ExperienceItem`, `EducationItem`, etc.). The core document uses an array of section keys (`sectionOrder`) to determine rendering hierarchy.

---

## 5. Database Architecture (`lib/db.ts`)

- Uses Node 22 built-in `node:sqlite`.
- Database location: `process.env.DB_PATH` or `cv_builder.db` at project root.
- Tables: `users` and `resumes`.
- Ownership lives in `resumes.user_id` (the anonymous device ID). Owner-facing reads go through `getOwnedResume`; public reads go through `getPublicResume` (share must be enabled, never returns the owner ID).

---

## 5b. UI System (theme, components, motion)

- **Theme tokens:** colours are CSS variables in `app/globals.css` (`:root` = light, `.dark` = dark) exposed as Tailwind colours: `bg-canvas`, `bg-surface`/`-2`/`-3`, `border-line`/`-strong`, `text-fg`/`-secondary`/`-muted`/`-subtle`, `bg-primary`/`text-primary-fg`, `success`, `warning`, `danger`. **Don't use raw `slate-*`/`sky-*` in app chrome**; they won't follow the theme. The CV templates (`components/preview/templates/`) are paper and intentionally use fixed colours.
- **Light/dark:** `components/theme/ThemeProvider.tsx` + the pre-paint script in `lib/themeScript.ts`. Use `<ThemeToggle />` / `<ThemeSelect />`.
- **Shared components** (`components/ui/`): `Button`/`IconButton`/`buttonVariants`, `Input`, `Textarea` (auto-grow), `Select`, `Field` (label + hint + error wiring), `Switch`, `Checkbox`, `SegmentedControl`, `Modal` (focus trap, Escape, bottom sheet on mobile), `Popover`/`Menu`, `Toast` (`useToast`, supports Undo actions), `Collapse`, `Badge`, `EmptyState`. Build new UI from these instead of one-off markup.
- **Editor building blocks** (`components/editor/`): `ItemCard` + `SectionHeader` for every repeatable section, `useItemAccordion` for open/focus state, `sections.ts` as the single source of section names/icons.
- **Motion:** use `motion/react` with the presets in `lib/motion.ts`. `MotionConfig reducedMotion="user"` is set globally. Above-the-fold landing content uses CSS keyframes (`animate-hero-in`) so it shows before hydration.
- **Click-to-edit:** templates tag elements with `data-edit-section` / `data-edit-item`; keep these when editing templates.

---

## 6. Critical Architectural Rules

1. **Client vs Server Isolation for SQLite:**
   - `lib/db.ts` uses `node:sqlite`. **NEVER** import it directly inside components marked with `"use client"`.
   - Client components must communicate with the database via API routes (`/api/resumes/**`).

2. **Print & PDF Generation:**
   - Uses native browser print. `#cv-printable-sheet` is the sole printable element.
   - All navigation bars, controls, toolbars, and buttons include the `no-print` CSS class.

3. **Port 3001 Convention:**
   - The application and E2E tests assume port `3001`.

---

## 7. Docker & Deployment Guidelines

The application is containerized using Docker and Docker Compose. It leverages Next.js `standalone` output for minimal image sizes.

### Important Docker Routing Rule
- **Never use `WORKDIR /app`** for a Next.js App Router project inside the Dockerfile. It causes internal path resolution failures in production builds (stripping `/app` prefixes and confusing `/app/app/page.tsx` with `/app/page.tsx`).
- Always use `WORKDIR /usr/src/app` or similar.

### How to Build & Deploy

To build and run the Docker container in the background, use the following commands:

```bash
# 1. Build the Docker image
docker compose build apexcv

# 2. Run the container in detached mode
docker compose up -d apexcv

# 3. Check logs if needed
docker compose logs -f apexcv
```

This will spin up the `cv-builder-apexcv` image and expose the app on port `3001` (or whatever is defined in `docker-compose.yml`).

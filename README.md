# ApexCV — High-Impact Resume & CV Builder

ApexCV is a modern, high-performance resume and CV authoring platform built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Node 22 `node:sqlite`**. It delivers split-screen live editing, five ATS-optimized templates, fluid drag-and-drop section reordering, PDF importing, and vector PDF exporting.

---

## Key Features

- **Live Split-Screen Editing:** Instantaneous real-time preview updates as you type with zero layout lag.
- **5 Curated Resume Templates:**
  - **Modern Tech / Minimalist:** Tailored for engineers, product managers, and designers with skill pills and metric bullet styling.
  - **Executive Classic:** Elegant serif typography and authoritative layout for directors, consultants, and leaders.
  - **Creative Grid:** Dynamic top banner, portfolio highlight cards, and modern badge accents.
  - **Compact Sidebar:** Dense 2-column layout for multi-disciplinary specialists.
  - **Harvard / 100% ATS:** Clean, conservative structure guaranteed to parse cleanly through Workday, Taleo, and Greenhouse.
- **Debounced SQLite Autosave:** Built with Node 22's native `DatabaseSync` (`node:sqlite`). Keystrokes are automatically debounced (800ms) and persisted locally with zero external database setup.
- **PDF Resume Import:** Upload an existing PDF resume to automatically extract contact info, work experience, education, and technical skills using heuristics.
- **Vector PDF Export:** Generates razor-sharp vector PDFs directly via browser print styles (`window.print()`), preserving crisp fonts and exact print margins.
- **Dynamic Section Reordering:** Reorder sections (Experience, Education, Skills, Projects, etc.) dynamically to tailor emphasis for different roles.
- **One-Click Duplication:** Clone any existing CV in 1 click to tailor keywords for specific job postings.
- **Anonymous Guest & Claim Flows:** Start building immediately without an account; optionally claim guest CVs under a profile name.

---

## Tech Stack

- **Framework:** [Next.js 14.2](https://nextjs.org/) (App Router)
- **UI & Styling:** [React 18](https://react.dev/), [Tailwind CSS 3.4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Database:** Node 22 `node:sqlite` (`DatabaseSync`)
- **PDF Parsing:** `pdf-parse`
- **Testing:** `puppeteer-core` for headless E2E verification

---

## Getting Started

### Prerequisites

- **Node.js 22.x or later** (required for built-in `node:sqlite` support)
- **npm** (v10+)

### 1. Installation

```bash
git clone <repository-url>
cd cv-builder
npm install
```

### 2. Run the Development Server

The application runs on port **3001** by default:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

- Landing page: `http://localhost:3001/`
- Dashboard: `http://localhost:3001/app`
- Live Editor: `http://localhost:3001/app/<resume-id>`

---

## Production & Docker

### Local Build & Start

```bash
npm run build
npm run start
```

### Docker Deployment

ApexCV includes a multi-stage Dockerfile and Docker Compose configuration:

```bash
# Build and run with Docker Compose
docker compose up -d

# Check running container
docker compose ps
```

The app will be accessible at [http://localhost:3001](http://localhost:3001) with database persistence mounted to the `cv_data` volume.

---

## Project Structure

```
cv-builder/
├── AGENTS.md                  # Comprehensive context guide for AI agents
├── README.md                  # Project documentation
├── Dockerfile                 # Multi-stage container build
├── docker-compose.yml         # Containerized production runtime
├── package.json               # NPM scripts and dependencies
├── cv_builder.db              # Local SQLite database file
├── app/
│   ├── page.tsx               # Marketing landing page
│   ├── app/
│   │   ├── page.tsx           # Dashboard (CV list, search, create, import)
│   │   └── [id]/page.tsx      # Editor wrapper (loads CV from SQLite)
│   └── api/
│       ├── resumes/           # CRUD endpoints for resumes
│       │   ├── [id]/          # GET, PUT, DELETE
│       │   ├── [id]/duplicate # Clone existing CV
│       │   └── parse-pdf/     # PDF file upload & parser
│       └── auth/claim/        # Associate guest resumes with user profile
├── components/
│   ├── editor/
│   │   ├── CvEditor.tsx       # Main editor with state & autosave
│   │   ├── SectionList.tsx    # Section ordering controls
│   │   ├── forms/             # Forms for Personal, Experience, Skills, etc.
│   │   └── styling/           # Theme, font, color, and spacing toolbar
│   └── preview/
│       ├── CvPreview.tsx      # Print-ready sheet wrapper
│       └── templates/         # 5 ATS & executive templates
├── lib/
│   ├── db.ts                  # SQLite schema & database helpers
│   ├── types.ts               # Shared TypeScript models
│   ├── sampleData.ts          # Default seed resume data
│   └── pdfParser.ts           # PDF text heuristic parser
└── scripts/
    ├── test-e2e.mjs           # Puppeteer E2E test script
    └── test-pdf-import.mjs    # PDF import verification script
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/resumes` | List all resumes (optional `?userId=...`) |
| `POST` | `/api/resumes` | Create a new resume (empty or seeded) |
| `GET` | `/api/resumes/:id` | Fetch full resume JSON by ID |
| `PUT` | `/api/resumes/:id` | Update / autosave resume JSON |
| `DELETE` | `/api/resumes/:id` | Delete resume |
| `POST` | `/api/resumes/:id/duplicate` | Duplicate resume with a new ID |
| `POST` | `/api/resumes/parse-pdf` | Upload multipart PDF and extract structured data |
| `POST` | `/api/auth/claim` | Link guest resumes to a named user |

---

## Automated Testing

Headless E2E tests are configured using `puppeteer-core`. Ensure the app is running on `http://localhost:3001` before launching tests:

```bash
# Start server in one terminal
npm run dev

# Run E2E test suite
node scripts/test-e2e.mjs

# Run PDF parsing test suite
node scripts/test-pdf-import.mjs
```

---

## AI Agent Integration

For AI coding agents (Gemini, Antigravity, Claude, Cursor), refer to [AGENTS.md](./AGENTS.md) for architectural constraints, database guidelines, and file index.

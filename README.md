# ApexCV

ApexCV is a modern resume and CV authoring platform built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Node 22 `node:sqlite`**. It features split-screen live editing, five ATS-optimized templates, drag-and-drop section reordering, PDF importing, and vector PDF exporting.

---

## Features

- **Live Split-Screen Editing:** Real-time preview updates alongside the editor.
- **5 ATS-Optimized Templates:** Includes Modern Tech, Executive, Creative, Sidebar, and ATS Classic.
- **Layout Controls:** Dynamically adjust Font Size (Small, Base, Large) and Page Margins (Compact, Standard, Spacious).
- **Rich Text Support:** Native markdown support (`**bold**`, `*italic*`, `[links](url)`) within bullet points.
- **Section Visibility:** Temporarily hide specific jobs or projects to tailor a CV to a specific role without deleting data.
- **A4 Page Boundaries:** Visual dashed-line indicators in the editor to prevent unexpected PDF page-breaks.
- **Public Share Links:** Generate read-only, shareable `/view/[id]` links to send directly to employers.
- **PDF Resume Import:** Extract contact info, work experience, education, and technical skills from existing PDF resumes.
- **Vector PDF Export:** High-quality, text-selectable PDF export via native browser print.
- **Debounced SQLite Autosave:** Built with Node 22 native `node:sqlite`.
- **Dynamic Section Reordering:** Drag and drop sections to rearrange.

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

## Docker Deployment

ApexCV is containerized using a multi-stage Node 22 Alpine image.

### Quick Start with Docker Compose

To build the image and start ApexCV in detached mode:

```bash
docker compose up -d --build
docker compose ps
```

### Data Persistence & SQLite Volume

The embedded SQLite database (`cv_builder.db`) is stored inside `/app/data` within the container, which is mounted to a named Docker volume `apexcv_data`:

- **Named Volume:** `apexcv_data`
- **Container Path:** `/app/data/cv_builder.db`

---

## Project Structure

```
cv-builder/
├── app/                  # Next.js app router pages and API
├── components/           # UI components, forms, and preview templates
├── lib/                  # Database, types, and utilities
├── scripts/              # Testing and automation scripts
├── package.json          # Dependencies and scripts
└── cv_builder.db         # Local SQLite database (created on first run)
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/resumes` | List all resumes |
| `POST` | `/api/resumes` | Create a new resume |
| `GET` | `/api/resumes/:id` | Fetch resume JSON by ID |
| `PUT` | `/api/resumes/:id` | Update resume JSON |
| `DELETE` | `/api/resumes/:id` | Delete resume |
| `POST` | `/api/resumes/:id/duplicate` | Duplicate resume |
| `POST` | `/api/resumes/parse-pdf` | Extract data from PDF |
| `POST` | `/api/auth/claim` | Link guest resumes to a user |

---

## Automated Testing

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

See [AGENTS.md](./AGENTS.md) for architectural constraints, database guidelines, and the file index.

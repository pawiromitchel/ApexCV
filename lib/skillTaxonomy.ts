/**
 * ApexCV - International Skill Taxonomy & Language Standards
 *
 * Implements standard international categorization separating
 * Programming Languages from Spoken Languages, and organizing
 * technical skills according to modern ATS & FAANG hiring standards.
 */

export const DEFAULT_SKILL_CATEGORIES = [
  "Leadership & Management",
  "Professional Skills",
  "Methodologies & Tools",
  "Programming Languages",
  "Frameworks & Libraries",
  "Cloud & DevOps",
  "Databases & Storage",
  "Architecture & APIs",
] as const;

export type DefaultSkillCategory = (typeof DEFAULT_SKILL_CATEGORIES)[number];

// Comprehensive lookup dictionary mapping skill names (case-insensitive) to their canonical category
export const SKILL_TAXONOMY_MAP: Record<string, DefaultSkillCategory> = {
  // Leadership & Management
  "project management": "Leadership & Management",
  "program management": "Leadership & Management",
  "product management": "Leadership & Management",
  "team leadership": "Leadership & Management",
  "strategic planning": "Leadership & Management",
  "stakeholder management": "Leadership & Management",
  "risk management": "Leadership & Management",
  "resource planning": "Leadership & Management",
  "budgeting & forecasting": "Leadership & Management",
  "technical mentorship": "Leadership & Management",
  "people management": "Leadership & Management",
  "product strategy": "Leadership & Management",
  "okrs & kpis": "Leadership & Management",

  // Professional Skills
  "cross-functional collaboration": "Professional Skills",
  "communication": "Professional Skills",
  "problem solving": "Professional Skills",
  "critical thinking": "Professional Skills",
  "negotiation": "Professional Skills",
  "conflict resolution": "Professional Skills",
  "public speaking": "Professional Skills",
  "client management": "Professional Skills",
  "time management": "Professional Skills",
  "decision making": "Professional Skills",
  "analytical thinking": "Professional Skills",

  // Programming Languages
  typescript: "Programming Languages",
  javascript: "Programming Languages",
  python: "Programming Languages",
  go: "Programming Languages",
  golang: "Programming Languages",
  rust: "Programming Languages",
  java: "Programming Languages",
  "c++": "Programming Languages",
  cpp: "Programming Languages",
  "c#": "Programming Languages",
  csharp: "Programming Languages",
  c: "Programming Languages",
  php: "Programming Languages",
  ruby: "Programming Languages",
  swift: "Programming Languages",
  kotlin: "Programming Languages",
  dart: "Programming Languages",
  sql: "Programming Languages",
  nosql: "Programming Languages",
  bash: "Programming Languages",
  shell: "Programming Languages",
  "html / css": "Programming Languages",
  html: "Programming Languages",
  css: "Programming Languages",
  r: "Programming Languages",
  scala: "Programming Languages",
  elixir: "Programming Languages",
  lua: "Programming Languages",

  // Frameworks & Libraries
  react: "Frameworks & Libraries",
  "react.js": "Frameworks & Libraries",
  "react native": "Frameworks & Libraries",
  "next.js": "Frameworks & Libraries",
  nextjs: "Frameworks & Libraries",
  "node.js": "Frameworks & Libraries",
  nodejs: "Frameworks & Libraries",
  "vue.js": "Frameworks & Libraries",
  vue: "Frameworks & Libraries",
  angular: "Frameworks & Libraries",
  svelte: "Frameworks & Libraries",
  "tailwind css": "Frameworks & Libraries",
  tailwind: "Frameworks & Libraries",
  express: "Frameworks & Libraries",
  "express.js": "Frameworks & Libraries",
  nestjs: "Frameworks & Libraries",
  django: "Frameworks & Libraries",
  flask: "Frameworks & Libraries",
  fastapi: "Frameworks & Libraries",
  "spring boot": "Frameworks & Libraries",
  spring: "Frameworks & Libraries",
  "ruby on rails": "Frameworks & Libraries",
  rails: "Frameworks & Libraries",
  laravel: "Frameworks & Libraries",

  // Cloud & DevOps
  docker: "Cloud & DevOps",
  kubernetes: "Cloud & DevOps",
  k8s: "Cloud & DevOps",
  aws: "Cloud & DevOps",
  "amazon web services": "Cloud & DevOps",
  "google cloud": "Cloud & DevOps",
  gcp: "Cloud & DevOps",
  azure: "Cloud & DevOps",
  "ci/cd pipelines": "Cloud & DevOps",
  "ci/cd": "Cloud & DevOps",
  "github actions": "Cloud & DevOps",
  "gitlab ci": "Cloud & DevOps",
  terraform: "Cloud & DevOps",
  ansible: "Cloud & DevOps",
  helm: "Cloud & DevOps",
  linux: "Cloud & DevOps",
  nginx: "Cloud & DevOps",
  prometheus: "Cloud & DevOps",
  grafana: "Cloud & DevOps",

  // Databases & Storage
  postgresql: "Databases & Storage",
  postgres: "Databases & Storage",
  redis: "Databases & Storage",
  mongodb: "Databases & Storage",
  mysql: "Databases & Storage",
  sqlite: "Databases & Storage",
  supabase: "Databases & Storage",
  elasticsearch: "Databases & Storage",
  dynamodb: "Databases & Storage",
  prisma: "Databases & Storage",
  typeorm: "Databases & Storage",
  cassandra: "Databases & Storage",

  // Architecture & APIs
  "rest apis": "Architecture & APIs",
  rest: "Architecture & APIs",
  graphql: "Architecture & APIs",
  microservices: "Architecture & APIs",
  "system architecture": "Architecture & APIs",
  "system design": "Architecture & APIs",
  "event-driven architecture": "Architecture & APIs",
  grpc: "Architecture & APIs",
  websockets: "Architecture & APIs",
  kafka: "Architecture & APIs",
  rabbitmq: "Architecture & APIs",

  // Methodologies & Tools
  "agile / scrum": "Methodologies & Tools",
  agile: "Methodologies & Tools",
  scrum: "Methodologies & Tools",
  kanban: "Methodologies & Tools",
  "code review": "Methodologies & Tools",
  "sprint planning": "Methodologies & Tools",
  tdd: "Methodologies & Tools",
  git: "Methodologies & Tools",
  jira: "Methodologies & Tools",
  confluence: "Methodologies & Tools",
  notion: "Methodologies & Tools",
  figma: "Methodologies & Tools",
};

/**
 * Resolves the canonical category for a given skill name.
 * If not in the taxonomy map, falls back to fallbackCategory or "Professional Skills".
 */
export function getCategoryForSkill(skillName: string, fallbackCategory?: string): string {
  const normalized = skillName.trim().toLowerCase();
  if (SKILL_TAXONOMY_MAP[normalized]) {
    return SKILL_TAXONOMY_MAP[normalized];
  }
  // Heuristic fallbacks for partial matches
  if (normalized.includes("manage") || normalized.includes("leader") || normalized.includes("strategy") || normalized.includes("planning")) {
    return "Leadership & Management";
  }
  if (normalized.includes("communication") || normalized.includes("collaborat") || normalized.includes("problem") || normalized.includes("interpersonal")) {
    return "Professional Skills";
  }
  if (normalized.includes("api") || normalized.includes("architecture")) {
    return "Architecture & APIs";
  }
  if (normalized.includes("cloud") || normalized.includes("devops") || normalized.includes("pipeline")) {
    return "Cloud & DevOps";
  }
  if (normalized.includes("sql") || normalized.includes("db") || normalized.includes("database")) {
    return "Databases & Storage";
  }
  return fallbackCategory || "Professional Skills";
}

/**
 * Curated Quick Skill Suggestions with their canonical category attached
 */
export interface CategorizedSuggestion {
  name: string;
  category: DefaultSkillCategory;
}

export const QUICK_SKILL_SUGGESTIONS: CategorizedSuggestion[] = [
  { name: "Project Management", category: "Leadership & Management" },
  { name: "Strategic Planning", category: "Leadership & Management" },
  { name: "Team Leadership", category: "Leadership & Management" },
  { name: "Stakeholder Management", category: "Leadership & Management" },
  { name: "Cross-Functional Collaboration", category: "Professional Skills" },
  { name: "Problem Solving", category: "Professional Skills" },
  { name: "Agile / Scrum", category: "Methodologies & Tools" },
  { name: "TypeScript", category: "Programming Languages" },
  { name: "Python", category: "Programming Languages" },
  { name: "React", category: "Frameworks & Libraries" },
  { name: "Next.js", category: "Frameworks & Libraries" },
  { name: "Docker", category: "Cloud & DevOps" },
  { name: "AWS", category: "Cloud & DevOps" },
  { name: "PostgreSQL", category: "Databases & Storage" },
  { name: "REST APIs", category: "Architecture & APIs" },
  { name: "System Architecture", category: "Architecture & APIs" },
];

/**
 * International Standard Spoken Language Proficiency Framework
 * (Combines CEFR standard with international descriptive scales)
 */
export const SPOKEN_LANGUAGE_PROFICIENCY_LEVELS = [
  "Native / Bilingual",
  "Full Professional (C2 / C1)",
  "Professional Working (B2)",
  "Limited Working / Intermediate (B1)",
  "Elementary (A2 / A1)",
] as const;

export type SpokenLanguageProficiency = (typeof SPOKEN_LANGUAGE_PROFICIENCY_LEVELS)[number];

export const QUICK_SPOKEN_LANGUAGES = [
  "English",
  "Spanish",
  "Dutch",
  "Russian",
  "German",
  "French",
  "Mandarin Chinese",
  "Japanese",
  "Portuguese",
  "Italian",
  "Arabic",
  "Hindi",
];

import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";
import { ResumeData, ResumeSummary } from "./types";
import { initialResumeData } from "./sampleData";

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    const dbPath = process.env.DB_PATH || path.join(process.cwd(), "cv_builder.db");
    const parentDir = path.dirname(dbPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    dbInstance = new DatabaseSync(dbPath);

    // Initialize tables
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS resumes (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        title TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Check if resumes table is empty; if so, seed sample resume
    const countRow = dbInstance.prepare("SELECT COUNT(*) as count FROM resumes").get() as { count: number };
    if (countRow && countRow.count === 0) {
      const insert = dbInstance.prepare(`
        INSERT INTO resumes (id, user_id, title, data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insert.run(
        initialResumeData.id,
        null,
        initialResumeData.title,
        JSON.stringify(initialResumeData),
        initialResumeData.createdAt,
        initialResumeData.updatedAt
      );
    }
  }
  return dbInstance;
}

export function listResumes(userId?: string): ResumeSummary[] {
  const db = getDb();
  let rows: any[];
  if (userId) {
    rows = db.prepare("SELECT id, user_id, title, data, created_at, updated_at FROM resumes WHERE user_id = ? ORDER BY updated_at DESC").all(userId);
  } else {
    rows = db.prepare("SELECT id, user_id, title, data, created_at, updated_at FROM resumes ORDER BY updated_at DESC").all();
  }

  return rows.map((r) => {
    try {
      const parsed: ResumeData = JSON.parse(r.data);
      return {
        id: r.id,
        userId: r.user_id,
        title: r.title,
        fullName: parsed.personalInfo?.fullName || "Unnamed",
        jobTitle: parsed.personalInfo?.jobTitle || "",
        templateId: parsed.themeConfig?.templateId || "modern-tech",
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    } catch {
      return {
        id: r.id,
        userId: r.user_id,
        title: r.title,
        fullName: "Unnamed",
        jobTitle: "",
        templateId: "modern-tech",
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    }
  });
}

export function getResumeById(id: string): ResumeData | null {
  const db = getDb();
  const row = db.prepare("SELECT data FROM resumes WHERE id = ?").get(id) as { data: string } | undefined;
  if (!row) return null;
  try {
    return JSON.parse(row.data) as ResumeData;
  } catch {
    return null;
  }
}

export function upsertResume(resume: ResumeData): boolean {
  const db = getDb();
  const now = new Date().toISOString();
  resume.updatedAt = now;
  if (!resume.createdAt) resume.createdAt = now;

  const existing = db.prepare("SELECT id FROM resumes WHERE id = ?").get(resume.id);
  if (existing) {
    const update = db.prepare(`
      UPDATE resumes
      SET title = ?, data = ?, updated_at = ?
      WHERE id = ?
    `);
    update.run(resume.title, JSON.stringify(resume), now, resume.id);
  } else {
    const insert = db.prepare(`
      INSERT INTO resumes (id, user_id, title, data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insert.run(resume.id, resume.userId || null, resume.title, JSON.stringify(resume), resume.createdAt, now);
  }
  return true;
}

export function duplicateResume(id: string, newTitle?: string): ResumeData | null {
  const original = getResumeById(id);
  if (!original) return null;

  const newId = `cv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const title = newTitle || `${original.title} (Copy)`;
  const now = new Date().toISOString();

  const duplicated: ResumeData = {
    ...original,
    id: newId,
    title,
    createdAt: now,
    updatedAt: now,
  };

  upsertResume(duplicated);
  return duplicated;
}

export function deleteResume(id: string): boolean {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM resumes WHERE id = ?");
  stmt.run(id);
  return true;
}

export function claimResumesForUser(userId: string, userName: string, resumeIds: string[]): boolean {
  const db = getDb();
  // upsert user
  const userExists = db.prepare("SELECT id FROM users WHERE id = ?").get(userId);
  if (!userExists) {
    db.prepare("INSERT INTO users (id, name, created_at) VALUES (?, ?, ?)").run(userId, userName, new Date().toISOString());
  } else {
    db.prepare("UPDATE users SET name = ? WHERE id = ?").run(userName, userId);
  }

  // update resumes
  for (const id of resumeIds) {
    db.prepare("UPDATE resumes SET user_id = ? WHERE id = ?").run(userId, id);
  }
  return true;
}

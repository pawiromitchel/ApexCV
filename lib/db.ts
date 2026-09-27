import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { ResumeData, ResumeSummary } from "./types";

const CUSTOM_URL_PATTERN = /^[a-zA-Z0-9_-]{3,64}$/;

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
        updated_at TEXT NOT NULL,
        custom_url TEXT,
        url_expires_at TEXT,
        share_enabled INTEGER NOT NULL DEFAULT 0,
        share_token TEXT
      );
    `);

    // Ensure columns exist for existing db instances
    try {
      dbInstance.exec("ALTER TABLE resumes ADD COLUMN custom_url TEXT;");
    } catch { /* ignore if already exists */ }
    try {
      dbInstance.exec("ALTER TABLE resumes ADD COLUMN url_expires_at TEXT;");
    } catch { /* ignore if already exists */ }
    try {
      dbInstance.exec("ALTER TABLE resumes ADD COLUMN share_enabled INTEGER NOT NULL DEFAULT 0;");
      // Sharing is now opt-in: keep links working only for resumes that explicitly set a custom URL
      dbInstance.exec("UPDATE resumes SET share_enabled = 1 WHERE custom_url IS NOT NULL;");
    } catch { /* ignore if already exists */ }
    try {
      dbInstance.exec("ALTER TABLE resumes ADD COLUMN share_token TEXT;");
    } catch { /* ignore if already exists */ }
    dbInstance.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_resumes_share_token ON resumes(share_token);");
    try {
      dbInstance.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_resumes_custom_url ON resumes(custom_url);");
    } catch { /* pre-existing duplicate custom URLs; availability is still checked on write */ }
  }
  return dbInstance;
}

export function listResumes(userId: string): ResumeSummary[] {
  const db = getDb();
  const rows: any[] = db
    .prepare("SELECT id, user_id, title, data, created_at, updated_at, share_enabled FROM resumes WHERE user_id = ? ORDER BY updated_at DESC")
    .all(userId);

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
        shareEnabled: r.share_enabled === 1,
        data: parsed,
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

/**
 * Returns the resume only if it belongs to `ownerId`. Use this for every
 * owner-facing read; unowned (legacy) rows are never returned.
 */
export function getOwnedResume(id: string, ownerId: string): ResumeData | null {
  const resume = getResumeById(id);
  if (!resume || !ownerId || resume.userId !== ownerId) return null;
  return resume;
}

function getResumeById(id: string): ResumeData | null {
  const db = getDb();
  const row = db.prepare("SELECT user_id, data FROM resumes WHERE id = ?").get(id) as { user_id: string | null; data: string } | undefined;
  if (!row) return null;
  try {
    const parsed = JSON.parse(row.data) as ResumeData;
    parsed.userId = row.user_id ?? undefined;
    return parsed;
  } catch {
    return null;
  }
}

export function upsertResume(resume: ResumeData, explicitUserId?: string): boolean {
  const db = getDb();
  const now = new Date().toISOString();
  resume.updatedAt = now;
  if (!resume.createdAt) resume.createdAt = now;
  const effectiveUserId = explicitUserId || resume.userId || null;
  if (effectiveUserId) resume.userId = effectiveUserId;

  const existing = db.prepare("SELECT id, user_id FROM resumes WHERE id = ?").get(resume.id) as { id: string; user_id: string | null } | undefined;
  if (existing) {
    // Security: only the owning device may overwrite; unowned legacy rows are read-only
    if (!effectiveUserId || existing.user_id !== effectiveUserId) {
      console.warn(`[Security] Denied overwrite of resume ${resume.id} owned by ${existing.user_id} by requester ${effectiveUserId}`);
      return false;
    }
    const update = db.prepare(`
      UPDATE resumes
      SET title = ?, data = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `);
    update.run(resume.title, serializeResume(resume), now, resume.id, effectiveUserId);
  } else {
    const insert = db.prepare(`
      INSERT INTO resumes (id, user_id, title, data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insert.run(resume.id, effectiveUserId, resume.title, serializeResume(resume), resume.createdAt, now);
  }
  return true;
}

// Ownership lives in the user_id column only; never persist it inside the document JSON
function serializeResume(resume: ResumeData): string {
  const { userId: _userId, ...rest } = resume;
  return JSON.stringify(rest);
}

export function claimUnassignedResumes(userId: string): number {
  const db = getDb();
  const countRow = db.prepare("SELECT COUNT(*) as count FROM resumes WHERE user_id IS NULL").get() as { count: number };
  if (countRow && countRow.count > 0) {
    db.prepare("UPDATE resumes SET user_id = ? WHERE user_id IS NULL").run(userId);
    return countRow.count;
  }
  return 0;
}

export function transferDeviceResumes(fromDeviceId: string, toDeviceId: string): number {
  const db = getDb();
  const countRow = db.prepare("SELECT COUNT(*) as count FROM resumes WHERE user_id = ?").get(fromDeviceId) as { count: number };
  if (countRow && countRow.count > 0) {
    db.prepare("UPDATE resumes SET user_id = ? WHERE user_id = ?").run(toDeviceId, fromDeviceId);
    return countRow.count;
  }
  return 0;
}

export function duplicateResume(id: string, ownerId: string, newTitle?: string): ResumeData | null {
  const original = getOwnedResume(id, ownerId);
  if (!original) return null;

  const newId = `cv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const title = newTitle || `${original.title} (Copy)`;
  const now = new Date().toISOString();

  const duplicated: ResumeData = {
    ...original,
    id: newId,
    userId: ownerId,
    title,
    createdAt: now,
    updatedAt: now,
  };

  upsertResume(duplicated, ownerId);
  return duplicated;
}

export function deleteResume(id: string, ownerId: string): boolean {
  const db = getDb();
  const result: any = db.prepare("DELETE FROM resumes WHERE id = ? AND user_id = ?").run(id, ownerId);
  return Number(result?.changes ?? 0) > 0;
}

/** Stores a display name for this device's workspace. Does not move any resumes. */
export function setDeviceDisplayName(deviceId: string, name: string): void {
  const db = getDb();
  const userExists = db.prepare("SELECT id FROM users WHERE id = ?").get(deviceId);
  if (!userExists) {
    db.prepare("INSERT INTO users (id, name, created_at) VALUES (?, ?, ?)").run(deviceId, name, new Date().toISOString());
  } else {
    db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, deviceId);
  }
}

export interface ShareSettings {
  enabled: boolean;
  shareToken: string | null;
  customUrl: string | null;
  urlExpiresAt: string | null;
}

/**
 * Public read of a shared resume by its share token or custom URL.
 * Returns null unless sharing is enabled and not expired. Never includes the owner ID.
 */
export function getPublicResume(identifier: string): ResumeData | null {
  const db = getDb();
  type Row = { data: string; url_expires_at: string | null };
  const sql = "SELECT data, url_expires_at FROM resumes WHERE share_enabled = 1 AND ";
  const row =
    (db.prepare(sql + "share_token = ?").get(identifier) as Row | undefined) ??
    (db.prepare(sql + "custom_url = ?").get(identifier) as Row | undefined);
  if (!row) return null;

  if (row.url_expires_at && new Date(row.url_expires_at) < new Date()) {
    return null; // Expired
  }

  try {
    const parsed = JSON.parse(row.data) as ResumeData;
    delete parsed.userId; // legacy rows stored the owner ID inside the JSON
    return parsed;
  } catch {
    return null;
  }
}

export function getResumeShareSettings(id: string, ownerId: string): ShareSettings | null {
  const db = getDb();
  const row = db
    .prepare("SELECT share_enabled, share_token, custom_url, url_expires_at FROM resumes WHERE id = ? AND user_id = ?")
    .get(id, ownerId) as
    | { share_enabled: number; share_token: string | null; custom_url: string | null; url_expires_at: string | null }
    | undefined;
  if (!row) return null;
  return {
    enabled: row.share_enabled === 1,
    shareToken: row.share_token,
    customUrl: row.custom_url,
    urlExpiresAt: row.url_expires_at,
  };
}

export function updateResumeShareSettings(
  id: string,
  ownerId: string,
  settings: { enabled: boolean; customUrl: string | null; expiresAt: string | null }
): { success: boolean; error?: string; status?: number; settings?: ShareSettings } {
  const db = getDb();
  const current = getResumeShareSettings(id, ownerId);
  if (!current) {
    return { success: false, error: "Resume not found", status: 404 };
  }

  const customUrl = settings.customUrl?.trim() || null;
  if (customUrl) {
    if (!CUSTOM_URL_PATTERN.test(customUrl)) {
      return { success: false, error: "Custom URL must be 3-64 letters, numbers, hyphens, or underscores", status: 400 };
    }
    if (!checkCustomUrlAvailable(customUrl, id)) {
      return { success: false, error: "Custom URL already in use", status: 409 };
    }
  }

  const shareToken = current.shareToken || crypto.randomBytes(16).toString("hex");

  try {
    db.prepare(
      "UPDATE resumes SET share_enabled = ?, share_token = ?, custom_url = ?, url_expires_at = ? WHERE id = ? AND user_id = ?"
    ).run(settings.enabled ? 1 : 0, shareToken, customUrl, settings.expiresAt, id, ownerId);
    return { success: true, settings: getResumeShareSettings(id, ownerId)! };
  } catch (e: any) {
    return { success: false, error: e.message, status: 500 };
  }
}

export function checkCustomUrlAvailable(customUrl: string, excludeId?: string): boolean {
  const db = getDb();
  if (!customUrl) return true;
  if (!CUSTOM_URL_PATTERN.test(customUrl)) return false;

  const existing = db
    .prepare("SELECT id FROM resumes WHERE (custom_url = ? OR share_token = ?) AND id != ?")
    .get(customUrl, customUrl, excludeId ?? "");
  return !existing;
}

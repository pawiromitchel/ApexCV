import { NextRequest, NextResponse } from "next/server";

export const DEVICE_ID_COOKIE = "apexcv_device_id";

// Device IDs are bearer secrets: only accept the unguessable format we generate
// ("usr_anon_" + 32 hex chars, or the legacy timestamp/random fallback).
const DEVICE_ID_PATTERN = /^usr_anon_[a-z0-9_]{20,64}$/;

export function isValidDeviceId(value: string | null | undefined): value is string {
  return !!value && DEVICE_ID_PATTERN.test(value);
}

/**
 * Server-side helper to extract the anonymous device identifier from
 * request headers or cookies.
 */
export function getDeviceIdFromRequest(req: NextRequest): string | null {
  // 1. Check custom header (sent by client fetchers)
  const headerId = req.headers.get("x-device-id")?.trim();
  if (isValidDeviceId(headerId)) {
    return headerId;
  }

  // 2. Check cookie
  const cookieId = req.cookies.get(DEVICE_ID_COOKIE)?.value?.trim();
  if (isValidDeviceId(cookieId)) {
    return cookieId;
  }

  return null;
}

/**
 * Server-side helper to get existing device ID or generate a new cryptographically random ID.
 */
export function getOrCreateDeviceId(req: NextRequest): { deviceId: string; isNew: boolean } {
  const existing = getDeviceIdFromRequest(req);
  if (existing) {
    return { deviceId: existing, isNew: false };
  }

  const newId = `usr_anon_${crypto.randomUUID().replace(/-/g, "")}`;
  return { deviceId: newId, isNew: true };
}

/**
 * Server-side helper to attach the device ID cookie to a NextResponse.
 */
export function attachDeviceIdCookie(response: NextResponse, deviceId: string): NextResponse {
  response.cookies.set({
    name: DEVICE_ID_COOKIE,
    value: deviceId,
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
    sameSite: "lax",
    httpOnly: false, // accessible to client for cross-check with localStorage
  });
  return response;
}

/**
 * Client-side helper to get or initialize the device ID from localStorage and cookies.
 */
export function getClientDeviceId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  // Check localStorage first
  let deviceId = localStorage.getItem(DEVICE_ID_COOKIE);
  if (!isValidDeviceId(deviceId)) {
    deviceId = null;
  }

  // If not in localStorage, check document.cookie
  if (!deviceId) {
    const match = document.cookie.match(new RegExp(`(?:^|; )${DEVICE_ID_COOKIE}=([^;]*)`));
    if (match && match[1]) {
      deviceId = decodeURIComponent(match[1]);
    }
  }

  if (!isValidDeviceId(deviceId)) {
    deviceId = null;
  }

  // If still not found, generate a fresh cryptographic UUID
  if (!deviceId) {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      deviceId = `usr_anon_${crypto.randomUUID().replace(/-/g, "")}`;
    } else {
      // randomUUID is unavailable on insecure (plain http) origins; getRandomValues is not
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      deviceId = `usr_anon_${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
    }
  }

  // Ensure both localStorage and document.cookie are synchronized
  try {
    localStorage.setItem(DEVICE_ID_COOKIE, deviceId);
    document.cookie = `${DEVICE_ID_COOKIE}=${encodeURIComponent(deviceId)}; path=/; max-age=315360000; SameSite=Lax`;
  } catch {
    // Ignore storage quota / incognito errors
  }

  return deviceId;
}

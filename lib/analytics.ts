// Thin wrapper over the self-hosted Umami tracker. Everything here is a no-op unless the
// tracker script is present (see components/analytics/Analytics.tsx), so dev and self-hosted
// copies of the app stay untracked by default. Never pass resume content as event data.

export type AnalyticsEvent =
  | { name: "resume_created"; data: { template: string; sample: boolean } }
  | { name: "pdf_imported"; data: { from: "dashboard" | "editor" } }
  | { name: "pdf_printed"; data: { from: "editor" | "public" } }
  | { name: "share_updated"; data: { enabled: boolean; custom_url: boolean } }
  | { name: "template_changed"; data: { template: string } };

declare global {
  interface Window {
    umami?: { track: (name: string, data?: Record<string, string | number | boolean>) => void };
  }
}

export function track<E extends AnalyticsEvent>(name: E["name"], data: Extract<E, { name: typeof name }>["data"]) {
  try {
    window.umami?.track(name, data);
  } catch {
    // analytics must never break the app
  }
}

// Umami's `data-before-send` hook: report dynamic ids as route patterns so resume ids and
// share slugs (capability URLs) never reach the analytics server.
export const analyticsBeforeSendScript = `
window.__apexBeforeSend = function (type, payload) {
  var scrub = function (u) {
    return typeof u === "string" ? u.replace(/\\/(app|view)\\/[^/?#]+/, "/$1/:id") : u;
  };
  if (payload) { payload.url = scrub(payload.url); payload.referrer = scrub(payload.referrer); }
  return payload;
};`;

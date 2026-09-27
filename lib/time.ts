const rtf = typeof Intl !== "undefined" ? new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }) : null;

/** "just now", "5 minutes ago", "yesterday", "3 weeks ago"… */
export function timeAgo(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  if (Math.abs(seconds) < 45) return "just now";
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["minute", 60],
    ["hour", 3600],
    ["day", 86400],
    ["week", 604800],
    ["month", 2629800],
    ["year", 31557600],
  ];
  let unit: Intl.RelativeTimeFormatUnit = "minute";
  let value = seconds / 60;
  for (const [u, secs] of units) {
    if (Math.abs(seconds) >= secs) {
      unit = u;
      value = seconds / secs;
    }
  }
  return rtf ? rtf.format(Math.round(value), unit) : date.toLocaleDateString();
}

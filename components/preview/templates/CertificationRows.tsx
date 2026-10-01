import { CertificationItem, FocusedTarget } from "@/lib/types";
import { formatMonthYear } from "@/lib/dateValidation";
import { normalizeUrl } from "@/lib/utils";
import { Award, ExternalLink } from "lucide-react";

/** One compact row per certification, shared by the templates that used to render half-width cards. */
export function CertificationRows({
  certifications,
  focusedTarget,
  accent,
  className = "",
}: {
  certifications: CertificationItem[];
  focusedTarget?: FocusedTarget | null;
  accent: string;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 text-xs ${className}`}>
      {certifications.map((cert) => (
        <div
          key={cert.id}
          data-edit-item={cert.id}
          className={`flex items-baseline gap-2 leading-snug ${focusedTarget?.itemId === cert.id ? "cv-focus" : ""}`}
        >
          <Award aria-hidden className="relative top-[2px] h-3.5 w-3.5 shrink-0 self-start" style={{ color: accent }} />
          <div className="min-w-0 flex-1">
            <span className="font-bold text-slate-900">{cert.name || cert.issuer}</span>
            {cert.name && cert.issuer && <span className="text-slate-600"> · {cert.issuer}</span>}
          </div>
          {cert.url && (
            <a
              href={normalizeUrl(cert.url)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-sky-600 hover:underline"
            >
              <ExternalLink className="h-2.5 w-2.5" />
              Verify
            </a>
          )}
          {cert.date && <span className="shrink-0 whitespace-nowrap text-[11px] text-slate-500">{formatMonthYear(cert.date)}</span>}
        </div>
      ))}
    </div>
  );
}

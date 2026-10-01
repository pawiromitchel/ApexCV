import React from "react";
import { ExperienceItem, FocusedTarget, PersonalInfo, SpacingScale } from "@/lib/types";
import { groupExperiences } from "@/lib/experienceHelper";
import { formatMonthYear } from "@/lib/dateValidation";
import { RichText } from "@/components/ui/RichText";

/** Per-template typography. Layout and alignment are owned by ExperienceEntries. */
export interface ExperienceStyle {
  accent: string;
  /** The CV's spacing setting; entries are always spaced further apart than roles within a company. */
  density?: SpacingScale;
  /** Job title of a standalone position. */
  role: string;
  /** Job title of a role inside a grouped company. */
  groupRole: string;
  /** Company line under a standalone title (coloured with the accent unless companyFirst). */
  company: string;
  /** Company heading of a group of roles. */
  groupCompany: string;
  date: string;
  location: string;
  bullets: string;
  /** ATS style: company on the first line, role in italics below. */
  companyFirst?: boolean;
  /** Draw a vertical timeline with a dot per role (Creative). */
  timeline?: boolean;
}

const GAPS: Record<SpacingScale, { entries: string; roles: string }> = {
  compact: { entries: "space-y-2.5", roles: "space-y-1.5" },
  standard: { entries: "space-y-4", roles: "space-y-2.5" },
  spacious: { entries: "space-y-5", roles: "space-y-3" },
};

function period(exp: ExperienceItem) {
  const start = formatMonthYear(exp.startDate);
  const end = exp.current ? "Present" : formatMonthYear(exp.endDate);
  if (!start && !end) return "";
  return `${start || "…"} – ${end || "…"}`;
}

function Bullets({ exp, focused, focusedTarget, className }: { exp: ExperienceItem; focused: boolean; focusedTarget?: FocusedTarget | null; className: string }) {
  const bullets = (exp.bullets || []).filter((b) => b.trim());
  if (bullets.length === 0) return null;
  return (
    // Markers hang inside the content edge so text and bullets line up across all entries
    <ul className={`mt-1 list-disc pl-[1.1em] marker:text-slate-400 ${className}`}>
      {bullets.map((b, i) => (
        <li key={i} className={`leading-normal ${focused && focusedTarget?.bulletIndex === i ? "cv-focus-bullet" : ""}`}>
          <RichText content={b} />
        </li>
      ))}
    </ul>
  );
}

/** Masks the timeline below the final dot so the line ends at the last role. */
function TimelineEnd() {
  return <span aria-hidden className="absolute -left-[16px] -bottom-1 top-[1.1em] w-[5px] bg-white" />;
}

function Dot({ accent, hollow }: { accent: string; hollow?: boolean }) {
  return (
    <span
      aria-hidden
      className="absolute -left-[17px] top-[0.4em] h-2 w-2 rounded-full ring-2 ring-white"
      style={hollow ? { backgroundColor: "white", boxShadow: `inset 0 0 0 2px ${accent}` } : { backgroundColor: accent }}
    />
  );
}

/**
 * Work experience list shared by every template. Consecutive roles at the same company are
 * grouped under one company heading; every title, date column and bullet list uses the same
 * left edge whether it is grouped or not.
 */
export function ExperienceEntries({
  experience,
  focusedTarget,
  style: s,
}: {
  experience: ExperienceItem[];
  focusedTarget?: FocusedTarget | null;
  style: ExperienceStyle;
}) {
  const groups = groupExperiences(experience);
  const gaps = GAPS[s.density ?? "standard"];

  return (
    <div className={`relative ${gaps.entries} ${s.timeline ? "pl-[18px]" : ""}`}>
      {s.timeline && <span aria-hidden className="absolute bottom-1 left-[4px] top-1.5 w-px bg-slate-200" />}

      {groups.map((group, gIdx) => {
        if (!group.isGrouped) {
          const exp = group.items[0];
          const focused = focusedTarget?.itemId === exp.id;
          const when = period(exp);
          return (
            <div key={exp.id} data-edit-item={exp.id} className={`relative ${focused ? "cv-focus" : ""}`}>
              {s.timeline && <Dot accent={s.accent} />}
              {s.companyFirst ? (
                <>
                  <Row left={<span className={s.groupCompany}>{exp.company}</span>} right={when && <span className={s.date}>{when}</span>} />
                  <Row left={<span className={s.role}>{exp.role}</span>} right={exp.location && <span className={s.location}>{exp.location}</span>} />
                </>
              ) : (
                <>
                  <Row left={<span className={s.role}>{exp.role}</span>} right={when && <span className={s.date}>{when}</span>} />
                  <Row
                    left={
                      <span className={s.company} style={{ color: s.accent }}>
                        {exp.company}
                      </span>
                    }
                    right={exp.location && <span className={s.location}>{exp.location}</span>}
                  />
                </>
              )}
              <Bullets exp={exp} focused={focused} focusedTarget={focusedTarget} className={s.bullets} />
              {s.timeline && gIdx === groups.length - 1 && <TimelineEnd />}
            </div>
          );
        }

        return (
          <div key={`group-${gIdx}`} className="relative">
            {s.timeline && <Dot accent={s.accent} hollow />}
            <Row
              left={
                <span>
                  <span className={s.groupCompany} style={s.companyFirst ? undefined : { color: s.accent }}>
                    {group.company}
                  </span>
                  {group.location && <span className={`${s.location} ml-1.5`}>· {group.location}</span>}
                </span>
              }
              right={group.overallDate && <span className={s.date}>{group.overallDate}</span>}
            />
            <div className={`mt-1.5 ${gaps.roles}`}>
              {group.items.map((exp, rIdx) => {
                const focused = focusedTarget?.itemId === exp.id;
                const when = period(exp);
                return (
                  <div key={exp.id} data-edit-item={exp.id} className={`relative ${focused ? "cv-focus" : ""}`}>
                    {s.timeline && <Dot accent={s.accent} />}
                    <Row left={<span className={s.groupRole}>{exp.role}</span>} right={when && <span className={s.date}>{when}</span>} />
                    <Bullets exp={exp} focused={focused} focusedTarget={focusedTarget} className={s.bullets} />
                    {s.timeline && gIdx === groups.length - 1 && rIdx === group.items.length - 1 && <TimelineEnd />}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Row({ left, right }: { left: React.ReactNode; right?: React.ReactNode }) {
  return (
    // text-xs sets the line box so rows sit tight regardless of the template base size
    <div className="flex items-baseline justify-between gap-3 text-xs leading-snug">
      <div className="min-w-0 flex-1">{left}</div>
      {right ? <div className="shrink-0 whitespace-nowrap text-right">{right}</div> : null}
    </div>
  );
}

const clean = (values: (string | undefined)[]) =>
  values.map((v) => (v || "").trim().replace(/^https?:\/\//, "").replace(/\/$/, "")).filter(Boolean);

/**
 * Contact details as two lines (where you are and how to reach you, then links), with URL
 * schemes stripped and empty fields dropped. Two fixed lines avoid separators stranded at a wrap.
 */
export function contactLines(p: PersonalInfo): string[][] {
  return [clean([p.location, p.phone, p.email]), clean([p.website, p.linkedin, p.github])].filter((l) => l.length > 0);
}

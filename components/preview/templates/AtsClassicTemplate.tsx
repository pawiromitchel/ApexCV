import { ExperienceEntries, contactLines } from "./ExperienceEntries";
import React from "react";
import { ResumeData, CustomSection, FocusedTarget } from "@/lib/types";
import { getSpacingStyles } from "@/lib/templateSpacing";
import { normalizeUrl, cleanUrl } from "@/lib/utils";
import { formatMonthYear } from "@/lib/dateValidation";
import { Award, ExternalLink } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
  focusedTarget?: FocusedTarget | null;
}

export function AtsClassicTemplate({ data, focusedTarget }: TemplateProps) {
  const {
    personalInfo,
    summary,
    experience,
    education,
    skills,
    languages,
    projects,
    certifications,
    customSections,
    sectionOrder,
    themeConfig,
  } = data;
  const spacing = getSpacingStyles(themeConfig?.spacing, themeConfig?.documentMargins);

  const getFontSizeClass = () => {
    switch (themeConfig?.fontSize) {
      case "sm": return "text-[0.7rem] sm:text-xs";
      case "lg": return "text-sm sm:text-base";
      case "base":
      default: return "text-xs sm:text-sm";
    }
  };

  // Group skills by category for clear ATS reading
  const skillsByCategory = skills.reduce((acc, skill) => {
    const cat = skill.category || "Technical Skills";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill.name);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className={`${spacing.containerPadding} ${getFontSizeClass()} text-slate-900 bg-white min-h-[var(--sheet-h,297mm)] font-serif leading-relaxed`}>
      {/* ATS Standard Centered Header */}
      <header data-edit-section="personal" className={`text-center border-b border-slate-900 ${spacing.headerMargin}`}>
        <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-950">
          {personalInfo.fullName || "YOUR FULL NAME"}
        </h1>
        {personalInfo.jobTitle && (
          <div className="text-xs font-semibold uppercase text-slate-700 mt-0.5 tracking-wide">
            {personalInfo.jobTitle}
          </div>
        )}

        <div className="mt-1.5 space-y-0.5 text-[11px] text-slate-800">
          {contactLines(personalInfo).map((line) => (
            <div key={line.join()} className="flex flex-wrap items-center justify-center gap-x-2">
              {line.map((part, i) => (
                <React.Fragment key={part}>
                  {i > 0 && <span aria-hidden>|</span>}
                  <span>{part}</span>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </header>

      {/* Content in standardized order */}
      <div className={spacing.sectionGap}>
        {sectionOrder.map((sectionKey) => {
          if (sectionKey === "summary" && summary) {
            return (
              <section key="summary" data-edit-section="summary">
                <h2 className={`font-bold text-xs uppercase tracking-wider border-b border-slate-900 pb-0.5 ${spacing.sectionHeaderMargin} text-slate-950`}>
                  Summary
                </h2>
                <p className="text-slate-800 text-justify text-[11.5px] leading-normal">
                  {summary}
                </p>
              </section>
            );
          }

          if (sectionKey === "experience" && experience?.length > 0) {
            const isSectionFocused = focusedTarget?.section === "experience";
            return (
              <section key="experience" data-edit-section="experience" className={`transition-all duration-300 rounded ${isSectionFocused && !focusedTarget?.itemId ? "cv-focus" : ""}`}>
                <h2 className={`font-bold text-xs uppercase tracking-wider border-b border-slate-900 pb-0.5 ${spacing.sectionHeaderMargin} text-slate-950`}>
                  Experience
                </h2>
                <div className={spacing.itemGap}>
                  <ExperienceEntries experience={experience} focusedTarget={focusedTarget} style={{ accent: "#0f172a", density: themeConfig?.spacing, companyFirst: true, role: "text-[11.5px] italic text-slate-800", groupRole: "text-[11.5px] font-semibold text-slate-900", company: "", groupCompany: "text-[12.5px] font-bold text-slate-950", date: "text-[11px] text-slate-800", location: "text-[11.5px] italic text-slate-800", bullets: "space-y-0.5 text-[11px] text-slate-800" }} />
                </div>
              </section>
            );
          }

          if (sectionKey === "education" && education?.length > 0) {
            const isSectionFocused = focusedTarget?.section === "education";
            return (
              <section key="education" data-edit-section="education" className={`transition-all duration-300 rounded ${isSectionFocused && !focusedTarget?.itemId ? "cv-focus" : ""}`}>
                <h2 className={`font-bold text-xs uppercase tracking-wider border-b border-slate-900 pb-0.5 ${spacing.sectionHeaderMargin} text-slate-950`}>
                  Education
                </h2>
                <div className={spacing.itemGap}>
                  {education.map((edu) => {
                    const isItemFocused = focusedTarget?.itemId === edu.id;
                    return (
                      <div key={edu.id} data-edit-item={edu.id} className={`transition-all duration-300 rounded ${isItemFocused ? "cv-focus" : ""}`}>
                        <div className="flex justify-between items-baseline gap-2 text-[12.5px] font-bold text-slate-950">
                          <span className="min-w-0 flex-1 truncate">{edu.institution}</span>
                          <span className="font-normal text-[11px] text-slate-800 whitespace-nowrap flex-shrink-0 ml-auto">
                            {formatMonthYear(edu.startDate)} – {formatMonthYear(edu.endDate)}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline italic text-slate-800 text-[11.5px] leading-snug">
                          <span className="min-w-0 flex-1 truncate">{edu.degree}</span>
                          {edu.location && <span className="whitespace-nowrap flex-shrink-0 ml-auto">{edu.location}</span>}
                        </div>
                        {(edu.gpa || edu.honors) && (
                          <div className="text-[11px] text-slate-700 mt-0.5">
                            {edu.honors} {edu.gpa && `• GPA: ${edu.gpa}`}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          if (sectionKey === "skills" && skills?.length > 0) {
            const isSectionFocused = focusedTarget?.section === "skills";
            return (
              <section key="skills" data-edit-section="skills" className={`transition-all duration-300 rounded ${isSectionFocused ? "cv-focus" : ""}`}>
                <h2 className="font-bold text-xs uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-1.5 text-slate-950">
                  Skills
                </h2>
                <div className="space-y-1 text-[11.5px]">
                  {Object.entries(skillsByCategory).map(([cat, list]) => (
                    <div key={cat} className="flex">
                      <span className="font-bold text-slate-900 w-44 flex-shrink-0">
                        {cat}:
                      </span>
                      <span className="text-slate-800">{list.join(", ")}</span>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === "projects" && projects?.length > 0) {
            const isSectionFocused = focusedTarget?.section === "projects";
            return (
              <section key="projects" data-edit-section="projects" className={`transition-all duration-300 rounded ${isSectionFocused && !focusedTarget?.itemId ? "cv-focus" : ""}`}>
                <h2 className={`font-bold text-xs uppercase tracking-wider border-b border-slate-900 pb-0.5 ${spacing.sectionHeaderMargin} text-slate-950`}>
                  Projects
                </h2>
                <div className="space-y-2">
                  {projects.map((proj) => {
                    const isItemFocused = focusedTarget?.itemId === proj.id;
                    return (
                      <div key={proj.id} data-edit-item={proj.id} className={`text-[11.5px] transition-all duration-300 rounded ${isItemFocused ? "cv-focus" : ""}`}>
                        <div className="flex justify-between items-baseline gap-2">
                          <div className="font-bold text-slate-950 min-w-0 flex-1 truncate">
                            {proj.name}
                            {proj.techStack?.length > 0 && (
                              <span className="font-normal text-slate-600 ml-1.5">
                                ({proj.techStack.join(", ")})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] whitespace-nowrap flex-shrink-0 ml-auto">
                            {proj.link && (
                              <a
                                href={normalizeUrl(proj.link)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-700 hover:text-slate-950 underline"
                                title={proj.link}
                              >
                                {cleanUrl(proj.link)}
                              </a>
                            )}
                            {proj.link && proj.github && <span>•</span>}
                            {proj.github && (
                              <a
                                href={normalizeUrl(proj.github)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-700 hover:text-slate-950 underline"
                                title={proj.github}
                              >
                                GitHub
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="text-slate-800 leading-snug">
                          {proj.description}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          if (sectionKey === "certifications" && certifications?.length > 0) {
            const isSectionFocused = focusedTarget?.section === "certifications";
            return (
              <section key="certifications" data-edit-section="certifications" className={`transition-all duration-300 rounded ${isSectionFocused && !focusedTarget?.itemId ? "cv-focus" : ""}`}>
                <h2 className={`font-bold text-xs uppercase tracking-wider border-b border-slate-900 pb-0.5 ${spacing.sectionHeaderMargin} text-slate-950`}>
                  Certifications
                </h2>
                <div className="space-y-1.5">
                  {certifications.map((c) => {
                    const isItemFocused = focusedTarget?.itemId === c.id;
                    return (
                      <div key={c.id} data-edit-item={c.id} className={`flex items-baseline justify-between gap-2 text-[11.5px] transition-all duration-300 rounded ${isItemFocused ? "cv-focus" : ""}`}>
                        <div className="min-w-0 flex-1 truncate">
                          <span className="font-semibold text-slate-900">{c.name || c.issuer}</span>
                          {c.name && c.issuer && <span className="text-slate-600"> — {c.issuer}</span>}
                        </div>
                        <div className="flex items-center gap-2 whitespace-nowrap flex-shrink-0 ml-auto text-[11px]">
                          {c.date && <span className="text-slate-600">{formatMonthYear(c.date)}</span>}
                          {c.url && (
                            <a
                              href={normalizeUrl(c.url)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-700 hover:text-slate-950 underline text-[10px]"
                            >
                              Verify
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          if (sectionKey === "languages" && languages && languages.length > 0) {
            return (
              <section key="languages" data-edit-section="languages">
                <h2 className={`font-bold text-xs uppercase tracking-wider border-b border-slate-900 pb-0.5 ${spacing.sectionHeaderMargin} text-slate-950`}>
                  Languages
                </h2>
                <div className="text-[11.5px] text-slate-800">
                  {languages.map((l, i) => (
                    <span key={l.id} data-edit-item={l.id}>
                      <span className="font-semibold text-slate-900">{l.name}</span>
                      {l.proficiency && <span className="text-slate-600"> ({l.proficiency})</span>}
                      {i < languages.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>
              </section>
            );
          }

          // Custom sections
          const renderCustomSection = (custom: CustomSection) => {
            if (!custom || !custom.items || custom.items.length === 0) return null;
            const isSectionFocused = focusedTarget?.section === custom.id || focusedTarget?.section === "customSections";
            return (
              <section key={custom.id} data-edit-section={custom.id} className={`transition-all duration-300 rounded ${isSectionFocused && !focusedTarget?.itemId ? "cv-focus" : ""}`}>
                <h2 className={`font-bold text-xs uppercase tracking-wider border-b border-slate-900 pb-0.5 ${spacing.sectionHeaderMargin} text-slate-950`}>
                  {custom.title}
                </h2>
                <div className={spacing.itemGap}>
                  {custom.items.map((item) => {
                    const isItemFocused = focusedTarget?.itemId === item.id;
                    return (
                      <div key={item.id} data-edit-item={item.id} className={`text-[11.5px] transition-all duration-300 rounded ${isItemFocused ? "cv-focus" : ""}`}>
                        <div className="flex justify-between items-baseline gap-2 font-bold text-slate-900">
                          <span className="min-w-0 flex-1 truncate">{item.title}</span>
                          {item.date && (
                            <span className="font-normal text-[11px] text-slate-700 whitespace-nowrap flex-shrink-0 ml-auto">
                              {formatMonthYear(item.date)}
                            </span>
                          )}
                        </div>
                        {item.subtitle && (
                          <div className="italic text-slate-800 text-[11px]">
                            {item.subtitle}
                          </div>
                        )}
                        {item.description && (
                          <div className="text-slate-800 leading-snug mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          };

          if (sectionKey === "customSections" || sectionKey === "custom") {
            if (!customSections || customSections.length === 0) return null;
            return (
              <React.Fragment key={sectionKey}>
                {customSections.map((custom) => renderCustomSection(custom))}
              </React.Fragment>
            );
          }

          const matchedCustom = customSections?.find((c) => c.id === sectionKey);
          if (matchedCustom) {
            return renderCustomSection(matchedCustom);
          }

          return null;
        })}
      </div>
    </div>
  );
}

import { CertificationRows } from "./CertificationRows";
import { ExperienceEntries, contactLines } from "./ExperienceEntries";
import React from "react";
import { ResumeData, CustomSection, FocusedTarget } from "@/lib/types";
import { getSpacingStyles } from "@/lib/templateSpacing";
import { normalizeUrl, cleanUrl } from "@/lib/utils";
import { formatMonthYear } from "@/lib/dateValidation";
import { Mail, Phone, MapPin, Globe, Linkedin, Github, ExternalLink, Award } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
  focusedTarget?: FocusedTarget | null;
}

export function ExecutiveTemplate({ data, focusedTarget }: TemplateProps) {
  const { personalInfo, summary, experience, education, skills, languages, projects, certifications, customSections, sectionOrder, themeConfig } = data;
  const accent = themeConfig.accentColor || "#1e3a8a"; // Navy default
  const spacing = getSpacingStyles(themeConfig?.spacing, themeConfig?.documentMargins);

  const getFontSizeClass = () => {
    switch (themeConfig?.fontSize) {
      case "sm": return "text-[0.8rem] sm:text-sm";
      case "lg": return "text-base sm:text-lg";
      case "base":
      default: return "text-sm sm:text-base";
    }
  };

  return (
    <div className={`${spacing.containerPadding} ${getFontSizeClass()} text-slate-900 leading-normal bg-white min-h-[var(--sheet-h,297mm)] font-serif`}>
      {/* Header */}
      <header data-edit-section="personal" className={`text-center ${spacing.headerMargin} border-b border-slate-900`}>
        <h1 className="text-2xl font-bold leading-tight tracking-tight uppercase text-slate-900">
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        <div
          className="text-sm font-semibold tracking-widest uppercase mt-1"
          style={{ color: accent }}
        >
          {personalInfo.jobTitle || "Executive Leadership"}
        </div>

        {/* Contact Strip */}
        <div className="mt-2 space-y-0.5 text-xs text-slate-700 font-sans">
          {contactLines(personalInfo).map((line) => (
            <div key={line.join()} className="flex flex-wrap items-center justify-center gap-x-3">
              {line.map((part, i) => (
                <React.Fragment key={part}>
                  {i > 0 && <span aria-hidden>•</span>}
                  <span>{part}</span>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </header>

      {/* Ordered Content */}
      <div className={spacing.sectionGap}>
        {sectionOrder.map((sectionKey) => {
          const isSectionFocused = focusedTarget?.section === sectionKey;

          if (sectionKey === "summary" && summary) {
            return (
              <section
                key="summary"
                data-edit-section="summary"
                className={`transition-all duration-300 rounded-lg ${
                  isSectionFocused ? "cv-focus-section" : ""
                }`}
              >
                <h2
                  className="text-xs font-bold uppercase tracking-wider pb-0.5 mb-2 border-b border-slate-300 font-sans"
                  style={{ color: accent }}
                >
                  Summary
                </h2>
                <p className="text-xs text-slate-800 leading-relaxed text-justify">
                  {summary}
                </p>
              </section>
            );
          }

          if (sectionKey === "experience" && experience?.length > 0) {
            return (
              <section
                key="experience"
                data-edit-section="experience"
                className={`transition-all duration-300 rounded-lg ${
                  isSectionFocused && !focusedTarget?.itemId ? "cv-focus-section" : ""
                }`}
              >
                <h2
                  className="text-xs font-bold uppercase tracking-wider pb-0.5 mb-2 border-b border-slate-300 font-sans"
                  style={{ color: accent }}
                >
                  Experience
                </h2>
                <div className="space-y-4">
                  <ExperienceEntries experience={experience} focusedTarget={focusedTarget} style={{ accent, density: themeConfig?.spacing, role: "text-sm font-bold text-slate-900", groupRole: "text-xs font-bold text-slate-900", company: "font-sans text-xs font-semibold", groupCompany: "font-sans text-sm font-semibold", date: "font-sans text-xs text-slate-600", location: "font-sans text-[11px] text-slate-500", bullets: "font-sans space-y-1 text-xs text-slate-800" }} />
                </div>
              </section>
            );
          }

          if (sectionKey === "education" && education?.length > 0) {
            return (
              <section
                key="education"
                data-edit-section="education"
                className={`transition-all duration-300 rounded-lg ${
                  isSectionFocused && !focusedTarget?.itemId ? "cv-focus-section" : ""
                }`}
              >
                <h2
                  className="text-xs font-bold uppercase tracking-wider pb-0.5 mb-2 border-b border-slate-300 font-sans"
                  style={{ color: accent }}
                >
                  Education
                </h2>
                <div className="space-y-2.5">
                  {education.map((edu) => {
                    const isItemFocused = focusedTarget?.itemId === edu.id;
                    return (
                      <div
                        key={edu.id}
                        data-edit-item={edu.id}
                        className={`text-xs transition-all duration-300 rounded-lg ${
                          isItemFocused ? "cv-focus" : ""
                        }`}
                      >
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="font-bold text-slate-900 min-w-0 flex-1 truncate">
                            {edu.degree}
                          </span>
                          <span className="text-xs font-sans text-slate-600 whitespace-nowrap flex-shrink-0 ml-auto">
                            {formatMonthYear(edu.startDate)} – {formatMonthYear(edu.endDate)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-700 font-sans gap-2">
                          <span className="font-medium min-w-0 truncate" style={{ color: accent }}>
                            {edu.institution}
                          </span>
                          {edu.location && <span className="text-slate-500 flex-shrink-0 text-[11px]">{edu.location}</span>}
                        </div>
                        {(edu.gpa || edu.honors) && (
                          <p className="text-slate-600 font-sans text-[11px] mt-0.5">
                            {edu.honors} {edu.gpa && `(GPA: ${edu.gpa})`}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          if (sectionKey === "skills" && skills?.length > 0) {
            return (
              <section
                key="skills"
                data-edit-section="skills"
                className={`transition-all duration-300 rounded-lg ${
                  isSectionFocused ? "cv-focus-section" : ""
                }`}
              >
                <h2
                  className="text-xs font-bold uppercase tracking-wider pb-0.5 mb-2 border-b border-slate-300 font-sans"
                  style={{ color: accent }}
                >
                  Skills
                </h2>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs font-sans text-slate-800">
                  {skills.map((s) => (
                    <div key={s.id} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                      <span>{s.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === "projects" && projects?.length > 0) {
            return (
              <section
                key="projects"
                data-edit-section="projects"
                className={`transition-all duration-300 rounded-lg ${
                  isSectionFocused && !focusedTarget?.itemId ? "cv-focus-section" : ""
                }`}
              >
                <h2
                  className="text-xs font-bold uppercase tracking-wider pb-0.5 mb-2 border-b border-slate-300 font-sans"
                  style={{ color: accent }}
                >
                  Projects
                </h2>
                <div className="space-y-2 text-xs">
                  {projects.map((proj) => {
                    const isItemFocused = focusedTarget?.itemId === proj.id;
                    return (
                      <div
                        key={proj.id}
                        data-edit-item={proj.id}
                        className={`p-2 rounded border border-slate-200/80 bg-slate-50/40 transition-all duration-300 ${
                          isItemFocused ? "cv-focus" : ""
                        }`}
                      >
                        <div className="flex justify-between items-baseline font-sans mb-0.5 gap-2 text-xs leading-snug">
                          <span className="font-bold text-slate-900 font-serif text-xs min-w-0 flex-1 truncate">
                            {proj.name}
                          </span>
                          <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
                            {proj.link && (
                              <a
                                href={normalizeUrl(proj.link)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-medium hover:underline"
                                style={{ color: accent }}
                                title={proj.link}
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>{cleanUrl(proj.link)}</span>
                              </a>
                            )}
                            {proj.github && (
                              <a
                                href={normalizeUrl(proj.github)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:underline"
                                title={proj.github}
                              >
                                <Github className="w-3 h-3" />
                                <span>Code</span>
                              </a>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-700 font-sans leading-relaxed">
                          {proj.description}
                        </p>
                        {proj.techStack?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 font-sans">
                            {proj.techStack.map((tech, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          if (sectionKey === "certifications" && certifications?.length > 0) {
            return (
              <section
                key="certifications"
                data-edit-section="certifications"
                className={`transition-all duration-300 rounded-lg ${
                  isSectionFocused && !focusedTarget?.itemId ? "cv-focus-section" : ""
                }`}
              >
                <h2
                  className="text-xs font-bold uppercase tracking-wider pb-0.5 mb-2 border-b border-slate-300 font-sans"
                  style={{ color: accent }}
                >
                  Certifications
                </h2>
                <CertificationRows certifications={certifications} focusedTarget={focusedTarget} accent={accent} className="font-sans" />
              </section>
            );
          }

          if (sectionKey === "languages" && languages && languages.length > 0) {
            return (
              <section
                key="languages"
                data-edit-section="languages"
                className={`transition-all duration-300 rounded-lg ${
                  isSectionFocused ? "cv-focus-section" : ""
                }`}
              >
                <h2
                  className="text-xs font-bold uppercase tracking-wider pb-0.5 mb-2 border-b border-slate-300 font-sans"
                  style={{ color: accent }}
                >
                  Languages
                </h2>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-sans">
                  {languages.map((l) => (
                    <div key={l.id} data-edit-item={l.id}>
                      <span className="font-semibold text-slate-900">{l.name}</span>
                      <span className="text-[11px] text-slate-600"> ({l.proficiency})</span>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Custom sections
          const renderCustomSection = (custom: CustomSection) => {
            if (!custom || !custom.items || custom.items.length === 0) return null;
            const isCustomFocused = focusedTarget?.section === custom.id;
            return (
              <section
                key={custom.id}
                data-edit-section={custom.id}
                className={`transition-all duration-300 rounded-lg ${
                  isCustomFocused && !focusedTarget?.itemId ? "cv-focus-section" : ""
                }`}
              >
                <h2
                  className={`text-xs font-bold uppercase tracking-wider pb-1 ${spacing.sectionHeaderMargin} border-b border-slate-300 font-sans`}
                  style={{ color: accent }}
                >
                  {custom.title}
                </h2>
                <div className={spacing.itemGap}>
                  {custom.items.map((item) => {
                    const isItemFocused = focusedTarget?.itemId === item.id;
                    return (
                      <div
                        key={item.id}
                        data-edit-item={item.id}
                        className={`text-xs transition-all duration-300 rounded-lg ${
                          isItemFocused ? "cv-focus" : ""
                        }`}
                      >
                        <div className="flex justify-between items-baseline font-sans gap-2">
                          <span className="font-bold text-slate-900 min-w-0 flex-1 truncate">
                            {item.title}
                          </span>
                          {item.date && (
                            <span className="text-[11px] text-slate-600 font-normal whitespace-nowrap flex-shrink-0 ml-auto">
                              {formatMonthYear(item.date)}
                            </span>
                          )}
                        </div>
                        {item.subtitle && (
                          <div className="text-slate-700 italic text-[11.5px] mt-0.5">
                            {item.subtitle}
                          </div>
                        )}
                        {item.description && (
                          <p className="text-slate-800 leading-relaxed font-sans mt-0.5">
                            {item.description}
                          </p>
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

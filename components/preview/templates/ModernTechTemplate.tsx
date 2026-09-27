import { ExperienceEntries } from "./ExperienceEntries";
import React from "react";
import { ResumeData, CustomSection, FocusedTarget } from "@/lib/types";
import { getSpacingStyles } from "@/lib/templateSpacing";
import { RichText } from "@/components/ui/RichText";
import { formatMonthYear } from "@/lib/dateValidation";
import { normalizeUrl, cleanUrl } from "@/lib/utils";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Calendar,
  ExternalLink,
  Award,
} from "lucide-react";

interface TemplateProps {
  data: ResumeData;
  focusedTarget?: FocusedTarget | null;
}

export function ModernTechTemplate({ data, focusedTarget }: TemplateProps) {
  const { personalInfo, summary, experience, education, skills, languages, projects, certifications, customSections, sectionOrder, themeConfig } = data;
  const accent = themeConfig.accentColor || "#0284c7";
  const spacing = getSpacingStyles(themeConfig?.spacing, themeConfig?.documentMargins);

  const getFontSizeClass = () => {
    switch (themeConfig?.fontSize) {
      case "sm": return "text-[0.8rem] sm:text-sm";
      case "lg": return "text-base sm:text-lg";
      case "base":
      default: return "text-sm sm:text-base";
    }
  };

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    const cat = skill.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  return (
    <div className={`${spacing.containerPadding} ${getFontSizeClass()} text-slate-900 leading-normal bg-white min-h-[var(--sheet-h,297mm)]`}>
      {/* Header */}
      <header data-edit-section="personal" className={`border-b ${spacing.headerMargin} border-slate-200`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {personalInfo.fullName || "Your Full Name"}
            </h1>
            <div
              className="text-base font-semibold mt-1 tracking-tight"
              style={{ color: accent }}
            >
              {personalInfo.jobTitle || "Your Professional Title"}
            </div>

            {/* Contact Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-600">
              {personalInfo.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" style={{ color: accent }} />
                  <span>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" style={{ color: accent }} />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" style={{ color: accent }} />
                  <span>{personalInfo.location}</span>
                </div>
              )}
              {personalInfo.website && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" style={{ color: accent }} />
                  <span>{personalInfo.website.replace(/^https?:\/\//, "")}</span>
                </div>
              )}
              {personalInfo.linkedin && (
                <div className="flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5" style={{ color: accent }} />
                  <span>{personalInfo.linkedin.replace(/^https?:\/\//, "")}</span>
                </div>
              )}
              {personalInfo.github && (
                <div className="flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5" style={{ color: accent }} />
                  <span>{personalInfo.github.replace(/^https?:\/\//, "")}</span>
                </div>
              )}
            </div>
          </div>

          {themeConfig.showAvatar && personalInfo.avatarUrl && (
            <div className="w-20 h-20 rounded-xl overflow-hidden ring-2 ring-slate-100 flex-shrink-0 shadow-sm">
              <img
                src={personalInfo.avatarUrl}
                alt={personalInfo.fullName}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </header>

      {/* Dynamic Sections ordered by sectionOrder */}
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
                <h2 className={`text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 ${spacing.sectionHeaderMargin}`}>
                  <span
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: accent }}
                  />
                  Professional Summary
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed">
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
                <h2 className={`text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 ${spacing.sectionHeaderMargin}`}>
                  <span
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: accent }}
                  />
                  Work Experience
                </h2>
                <div className={spacing.itemGap}>
                  <ExperienceEntries experience={experience} focusedTarget={focusedTarget} style={{ accent, density: themeConfig?.spacing, role: "text-sm font-bold text-slate-900", groupRole: "text-xs font-bold text-slate-900", company: "text-xs font-medium", groupCompany: "text-sm font-bold", date: "text-[11px] font-medium text-slate-500", location: "text-[11px] text-slate-500", bullets: "space-y-1 text-xs text-slate-700" }} />
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
                <h2 className={`text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 ${spacing.sectionHeaderMargin}`}>
                  <span
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: accent }}
                  />
                  Skills & Technologies
                </h2>
                <div className="space-y-2">
                  {Object.entries(skillsByCategory).map(([cat, skList]) => (
                    <div key={cat} className="flex items-start text-xs gap-2">
                      <span className="font-semibold text-slate-800 w-40 flex-shrink-0 pt-1 text-[11px] uppercase tracking-wide">
                        {cat}:
                      </span>
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {skList.map((s) => (
                          <span
                            key={s.id}
                            className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/80 text-slate-800 font-medium text-[11px]"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
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
                <h2 className={`text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 ${spacing.sectionHeaderMargin}`}>
                  <span
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: accent }}
                  />
                  Key Projects
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {projects.map((proj) => {
                    const isItemFocused = focusedTarget?.itemId === proj.id;
                    return (
                      <div
                        key={proj.id}
                        data-edit-item={proj.id}
                        className={`p-2.5 rounded-lg border border-slate-200/80 bg-slate-50/50 text-xs transition-all duration-300 ${
                          isItemFocused ? "cv-focus" : ""
                        }`}
                      >
                        <div className="flex justify-between items-baseline mb-1 gap-2 text-xs leading-snug">
                          <span className="font-bold text-slate-900 min-w-0 flex-1 truncate">
                            {proj.name}
                          </span>
                          <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
                            {proj.link && (
                              <a
                                href={normalizeUrl(proj.link)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-600 hover:text-sky-700 hover:underline"
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
                        <p className="text-slate-600 mb-2 leading-relaxed">
                          {proj.description}
                        </p>
                        {proj.techStack?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {proj.techStack.map((tech, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-slate-700"
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

          if (sectionKey === "education" && education?.length > 0) {
            return (
              <section
                key="education"
                data-edit-section="education"
                className={`transition-all duration-300 rounded-lg ${
                  isSectionFocused && !focusedTarget?.itemId ? "cv-focus-section" : ""
                }`}
              >
                <h2 className={`text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 ${spacing.sectionHeaderMargin}`}>
                  <span
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: accent }}
                  />
                  Education
                </h2>
                <div className={spacing.itemGap}>
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
                          <span className="font-bold text-slate-900 text-sm min-w-0 flex-1 truncate">
                            {edu.degree}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap flex-shrink-0 ml-auto">
                            {formatMonthYear(edu.startDate)} – {formatMonthYear(edu.endDate)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 gap-2">
                          <span style={{ color: accent }} className="font-medium min-w-0 truncate">
                            {edu.institution}
                          </span>
                          {edu.location && <span className="text-slate-500 text-[11px] flex-shrink-0">{edu.location}</span>}
                        </div>
                        {(edu.gpa || edu.honors) && (
                          <p className="text-slate-600 mt-0.5 text-[11px]">
                            {edu.gpa && <span>GPA: {edu.gpa} </span>}
                            {edu.honors && <span>• {edu.honors}</span>}
                          </p>
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
                <h2 className={`text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 ${spacing.sectionHeaderMargin}`}>
                  <span
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: accent }}
                  />
                  Certifications & Honors
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {certifications.map((cert) => {
                    const isItemFocused = focusedTarget?.itemId === cert.id;
                    return (
                      <div
                        key={cert.id}
                        data-edit-item={cert.id}
                        className={`p-2.5 rounded-lg border border-slate-200/80 bg-slate-50/40 flex items-start gap-2.5 transition-all duration-300 ${
                          isItemFocused ? "cv-focus" : ""
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-white shadow-xs mt-0.5"
                          style={{ backgroundColor: accent }}
                        >
                          <Award className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 leading-snug line-clamp-1">
                            {cert.name || cert.issuer}
                          </div>
                          {cert.name && cert.issuer && (
                            <div className="text-[11px] text-slate-600 font-medium line-clamp-1">
                              {cert.issuer}
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">
                              {formatMonthYear(cert.date)}
                            </span>
                            {cert.url && (
                              <a
                                href={normalizeUrl(cert.url)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-600 hover:underline ml-auto flex-shrink-0"
                              >
                                <ExternalLink className="w-2.5 h-2.5" />
                                <span>Verify</span>
                              </a>
                            )}
                          </div>
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
              <section
                key="languages"
                data-edit-section="languages"
                className={`transition-all duration-300 rounded-lg ${
                  isSectionFocused ? "cv-focus-section" : ""
                }`}
              >
                <h2 className={`text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 ${spacing.sectionHeaderMargin}`}>
                  <span
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: accent }}
                  />
                  Spoken Languages
                </h2>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                  {languages.map((l) => (
                    <div key={l.id} data-edit-item={l.id} className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-800">{l.name}</span>
                      <span className="text-[11px] text-slate-500 font-medium">({l.proficiency})</span>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Custom sections
          const renderCustomSection = (custom: CustomSection) => {
            if (!custom || !custom.items || custom.items.length === 0) return null;
            const isCustomSecFocused = isSectionFocused || focusedTarget?.section === custom.id;
            return (
              <section
                key={custom.id}
                data-edit-section={custom.id}
                className={`transition-all duration-300 rounded-lg ${
                  isCustomSecFocused && !focusedTarget?.itemId ? "cv-focus-section" : ""
                }`}
              >
                <h2 className={`text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 ${spacing.sectionHeaderMargin}`}>
                  <span
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: accent }}
                  />
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
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="font-bold text-slate-900 min-w-0 flex-1 truncate">
                            {item.title}
                          </span>
                          {item.date && (
                            <span className="text-[11px] text-slate-500 whitespace-nowrap flex-shrink-0 ml-auto">
                              {formatMonthYear(item.date)}
                            </span>
                          )}
                        </div>
                        {item.subtitle && (
                          <div className="text-slate-600 font-medium">
                            {item.subtitle}
                          </div>
                        )}
                        {item.description && (
                          <p className="text-slate-700 leading-relaxed mt-0.5">
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

          if (sectionKey.startsWith("sec_")) {
            const custom = customSections?.find((s) => s.id === sectionKey);
            if (custom) return renderCustomSection(custom);
          }

          return null;
        })}
      </div>
    </div>
  );
}

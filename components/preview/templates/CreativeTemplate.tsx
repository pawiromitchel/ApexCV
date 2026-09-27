import { ExperienceEntries } from "./ExperienceEntries";
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

export function CreativeTemplate({ data, focusedTarget }: TemplateProps) {
  const { personalInfo, summary, experience, education, skills, languages, projects, certifications, customSections, sectionOrder, themeConfig } = data;
  const accent = themeConfig.accentColor || "#ec4899"; // Pink / Vibrant default
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
    <div className={`text-slate-900 bg-white min-h-[var(--sheet-h,297mm)] overflow-hidden flex flex-col ${getFontSizeClass()}`}>
      {/* Top Graphic Accent Banner */}
      <div
        data-edit-section="personal"
        className="p-8 pb-7 text-white"
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, #0f172a 100%)`,
        }}
      >
        <div className="flex items-center gap-6">
          {themeConfig.showAvatar && personalInfo.avatarUrl ? (
            <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white/30 shadow-lg flex-shrink-0 bg-white/10">
              <img
                src={personalInfo.avatarUrl}
                alt={personalInfo.fullName}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl bg-white/20 text-white flex-shrink-0">
              {(personalInfo.fullName || "CV").substring(0, 2).toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
              {personalInfo.fullName || "Your Full Name"}
            </h1>
            <div className="text-sm font-semibold tracking-wide text-white/90 mt-1 uppercase">
              {personalInfo.jobTitle || "Creative Director & Designer"}
            </div>

            {/* Quick Contact */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-white/80">
              {personalInfo.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{personalInfo.location}</span>
                </div>
              )}
              {personalInfo.website && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{personalInfo.website.replace(/^https?:\/\//, "")}</span>
                </div>
              )}
              {personalInfo.linkedin && (
                <div className="flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>{personalInfo.linkedin.replace(/^https?:\/\//, "")}</span>
                </div>
              )}
              {personalInfo.github && (
                <div className="flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5" />
                  <span>{personalInfo.github.replace(/^https?:\/\//, "")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className={`${spacing.containerPadding} ${spacing.sectionGap} flex-1`}>
        {sectionOrder.map((sectionKey) => {
          const isSectionFocused = focusedTarget?.section === sectionKey;

          if (sectionKey === "summary" && summary) {
            return (
              <section
                key="summary"
                data-edit-section="summary"
                className={`transition-all duration-300 rounded-xl ${
                  isSectionFocused ? "cv-focus-section" : ""
                }`}
              >
                <h2
                  className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${spacing.sectionHeaderMargin}`}
                  style={{ color: accent }}
                >
                  <span className="w-3 h-0.5" style={{ backgroundColor: accent }} />
                  About Me
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
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
                className={`transition-all duration-300 rounded-xl ${
                  isSectionFocused && !focusedTarget?.itemId ? "cv-focus-section" : ""
                }`}
              >
                <h2
                  className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${spacing.sectionHeaderMargin}`}
                  style={{ color: accent }}
                >
                  <span className="w-3 h-0.5" style={{ backgroundColor: accent }} />
                  Experience
                </h2>
                <div className={spacing.itemGap}>
                  <ExperienceEntries experience={experience} focusedTarget={focusedTarget} style={{ accent, density: themeConfig?.spacing, role: "text-sm font-extrabold text-slate-900", groupRole: "text-xs font-bold text-slate-900", company: "text-xs font-bold", groupCompany: "text-sm font-extrabold", date: "text-[11px] font-semibold text-slate-500", location: "text-[11px] text-slate-400", bullets: "space-y-1 text-xs text-slate-600", timeline: true }} />
                </div>
              </section>
            );
          }

          if (sectionKey === "skills" && skills?.length > 0) {
            return (
              <section key="skills" data-edit-section="skills">
                <h2
                  className="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-2.5"
                  style={{ color: accent }}
                >
                  <span className="w-3 h-0.5" style={{ backgroundColor: accent }} />
                  Specialties & Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <div
                      key={s.id}
                      className="px-2.5 py-1 rounded-full text-xs font-bold shadow-sm"
                      style={{
                        backgroundColor: `${accent}15`,
                        color: accent,
                        border: `1px solid ${accent}30`,
                      }}
                    >
                      {s.name}
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
                className={`transition-all duration-300 rounded-xl ${
                  isSectionFocused && !focusedTarget?.itemId ? "cv-focus-section" : ""
                }`}
              >
                <h2
                  className="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-3"
                  style={{ color: accent }}
                >
                  <span className="w-3 h-0.5" style={{ backgroundColor: accent }} />
                  Featured Portfolio
                </h2>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {projects.map((proj) => {
                    const isItemFocused = focusedTarget?.itemId === proj.id;
                    return (
                      <div
                        key={proj.id}
                        data-edit-item={proj.id}
                        className={`p-3 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm transition-all duration-300 ${
                          isItemFocused ? "cv-focus" : ""
                        }`}
                      >
                        <div className="flex justify-between items-baseline font-bold text-slate-900 mb-1 gap-2 text-xs leading-snug">
                          <span className="text-slate-900 min-w-0 flex-1 truncate">{proj.name}</span>
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
                        <p className="text-slate-600 mb-2 leading-relaxed">
                          {proj.description}
                        </p>
                        {proj.techStack?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {proj.techStack.map((tech, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700"
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
                className={`transition-all duration-300 rounded-xl ${
                  isSectionFocused && !focusedTarget?.itemId ? "cv-focus-section" : ""
                }`}
              >
                <h2
                  className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${spacing.sectionHeaderMargin}`}
                  style={{ color: accent }}
                >
                  <span className="w-3 h-0.5" style={{ backgroundColor: accent }} />
                  Education
                </h2>
                <div className={spacing.itemGap}>
                  {education.map((edu) => {
                    const isItemFocused = focusedTarget?.itemId === edu.id;
                    return (
                      <div
                        key={edu.id}
                        data-edit-item={edu.id}
                        className={`text-xs transition-all duration-300 rounded-xl ${
                          isItemFocused ? "cv-focus" : ""
                        }`}
                      >
                        <div className="flex justify-between font-bold text-slate-900 gap-2">
                          <span className="min-w-0 flex-1 truncate">{edu.degree}</span>
                          <span className="text-slate-500 font-normal text-[11px] whitespace-nowrap flex-shrink-0 ml-auto">
                            {formatMonthYear(edu.startDate)} – {formatMonthYear(edu.endDate)}
                          </span>
                        </div>
                        <div className="text-slate-600 font-medium">
                          {edu.institution} {edu.location && `• ${edu.location}`}
                        </div>
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
                className={`transition-all duration-300 rounded-xl ${
                  isSectionFocused && !focusedTarget?.itemId ? "cv-focus-section" : ""
                }`}
              >
                <h2
                  className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${spacing.sectionHeaderMargin}`}
                  style={{ color: accent }}
                >
                  <span className="w-3 h-0.5" style={{ backgroundColor: accent }} />
                  Certifications & Honors
                </h2>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  {certifications.map((c) => {
                    const isItemFocused = focusedTarget?.itemId === c.id;
                    return (
                      <div
                        key={c.id}
                        data-edit-item={c.id}
                        className={`p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-start gap-2.5 transition-all duration-300 ${
                          isItemFocused ? "cv-focus" : ""
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white shadow-xs mt-0.5"
                          style={{ backgroundColor: accent }}
                        >
                          <Award className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 leading-snug line-clamp-1">{c.name || c.issuer}</div>
                          {c.name && c.issuer && (
                            <div className="text-[11px] text-slate-600 font-medium line-clamp-1">
                              {c.issuer}
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">
                              {formatMonthYear(c.date)}
                            </span>
                            {c.url && (
                              <a
                                href={normalizeUrl(c.url)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-0.5 text-[10px] font-bold hover:underline ml-auto flex-shrink-0"
                                style={{ color: accent }}
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
                className={`transition-all duration-300 rounded-xl ${
                  isSectionFocused ? "cv-focus-section" : ""
                }`}
              >
                <h2
                  className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${spacing.sectionHeaderMargin}`}
                  style={{ color: accent }}
                >
                  <span className="w-3 h-0.5" style={{ backgroundColor: accent }} />
                  Spoken Languages
                </h2>
                <div className="flex flex-wrap gap-2 text-xs">
                  {languages.map((l) => (
                    <div
                      key={l.id}
                      data-edit-item={l.id}
                      className="px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-center gap-1.5"
                    >
                      <span className="font-bold text-slate-900">{l.name}</span>
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
            const isCustomFocused = focusedTarget?.section === custom.id;
            return (
              <section
                key={custom.id}
                data-edit-section={custom.id}
                className={`transition-all duration-300 rounded-xl ${
                  isCustomFocused && !focusedTarget?.itemId ? "cv-focus-section" : ""
                }`}
              >
                <h2
                  className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${spacing.sectionHeaderMargin}`}
                  style={{ color: accent }}
                >
                  <span className="w-3 h-0.5" style={{ backgroundColor: accent }} />
                  {custom.title}
                </h2>
                <div className={spacing.itemGap}>
                  {custom.items.map((item) => {
                    const isItemFocused = focusedTarget?.itemId === item.id;
                    return (
                      <div
                        key={item.id}
                        data-edit-item={item.id}
                        className={`text-xs transition-all duration-300 rounded-xl ${
                          isItemFocused ? "cv-focus" : ""
                        }`}
                      >
                        <div className="flex justify-between items-baseline font-bold text-slate-900 gap-2">
                          <span className="min-w-0 flex-1 truncate">{item.title}</span>
                          {item.date && (
                            <span className="font-normal text-[11px] text-slate-500 whitespace-nowrap flex-shrink-0 ml-auto">
                              {formatMonthYear(item.date)}
                            </span>
                          )}
                        </div>
                        {item.subtitle && (
                          <div className="text-slate-600 font-medium text-[11.5px]">
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

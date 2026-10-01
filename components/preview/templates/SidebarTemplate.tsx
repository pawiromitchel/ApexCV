import { ExperienceEntries } from "./ExperienceEntries";
import React from "react";
import { ResumeData, CustomSection, FocusedTarget } from "@/lib/types";
import { getSpacingStyles } from "@/lib/templateSpacing";
import { RichText } from "@/components/ui/RichText";
import { formatMonthYear } from "@/lib/dateValidation";
import { normalizeUrl, cleanUrl } from "@/lib/utils";
import { Mail, Phone, MapPin, Globe, Linkedin, Github, ExternalLink, Award } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
  focusedTarget?: FocusedTarget | null;
}

export function SidebarTemplate({ data, focusedTarget }: TemplateProps) {
  const { personalInfo, summary, experience, education, skills, languages, projects, certifications, customSections, sectionOrder, themeConfig } = data;
  const accent = themeConfig.accentColor || "#0f766e"; // Teal default
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
    <div className={`flex bg-white text-slate-900 min-h-[var(--sheet-h,297mm)] ${getFontSizeClass()}`}>
      {/* Left Sidebar */}
      <aside className={`w-[34%] bg-slate-50 border-r border-slate-200 ${spacing.containerPadding} flex flex-col gap-4`}>
        {/* Avatar */}
        {themeConfig.showAvatar && personalInfo.avatarUrl ? (
          <div className="w-28 h-28 mx-auto rounded-full overflow-hidden ring-4 ring-white shadow-md">
            <img
              src={personalInfo.avatarUrl}
              alt={personalInfo.fullName}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-md" style={{ backgroundColor: accent }}>
            {(personalInfo.fullName || "CV").substring(0, 2).toUpperCase()}
          </div>
        )}

        {/* Contact Info */}
        <div data-edit-section="personal" className="space-y-2 text-xs">
          <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
            Contact
          </h3>
          {personalInfo.email && (
            <div className="flex items-center gap-2 text-slate-700 break-all">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} />
              <span>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-2 text-slate-700 break-all">
              <Globe className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} />
              <span>{personalInfo.website.replace(/^https?:\/\//, "")}</span>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center gap-2 text-slate-700 break-all">
              <Linkedin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} />
              <span>{personalInfo.linkedin.replace(/^https?:\/\//, "")}</span>
            </div>
          )}
          {personalInfo.github && (
            <div className="flex items-center gap-2 text-slate-700 break-all">
              <Github className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} />
              <span>{personalInfo.github.replace(/^https?:\/\//, "")}</span>
            </div>
          )}
        </div>

        {/* Skills in Sidebar */}
        {skills?.length > 0 && (
          <div data-edit-section="skills" className="space-y-2 text-xs">
            <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s.id}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-medium text-[11px]"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education in Sidebar */}
        {education?.length > 0 && (
          <div data-edit-section="education" className="space-y-2.5 text-xs">
            <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              Education
            </h3>
            {education.map((edu) => {
              const isItemFocused = focusedTarget?.itemId === edu.id;
              return (
                <div
                  key={edu.id}
                  data-edit-item={edu.id}
                  className={`space-y-0.5 rounded transition-all duration-300 ${
                    isItemFocused ? "cv-focus" : ""
                  }`}
                >
                  <div className="font-bold text-slate-900 leading-tight">
                    {edu.degree}
                  </div>
                  <div className="text-slate-600 font-medium">
                    {edu.institution}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {edu.startDate} – {edu.endDate}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Certifications in Sidebar */}
        {certifications?.length > 0 && (
          <div data-edit-section="certifications" className="space-y-2.5 text-xs">
            <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              Certifications
            </h3>
            {certifications.map((c) => {
              const isItemFocused = focusedTarget?.itemId === c.id;
              return (
                <div
                  key={c.id}
                  data-edit-item={c.id}
                  className={`space-y-0.5 rounded transition-all duration-300 ${
                    isItemFocused ? "cv-focus" : ""
                  }`}
                >
                  <div className="font-bold text-slate-900 leading-tight">
                    {c.name || c.issuer}
                  </div>
                  {(c.name && c.issuer) || c.date ? (
                    <div className="text-[11px] text-slate-500">
                      {c.name && c.issuer ? c.issuer : ""} {c.date ? `(${formatMonthYear(c.date)})` : ""}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {/* Spoken Languages in Sidebar */}
        {languages && languages.length > 0 && (
          <div data-edit-section="languages" className="space-y-1.5 text-xs">
            <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              Languages
            </h3>
            <div className="space-y-1">
              {languages.map((l) => (
                <div key={l.id} data-edit-item={l.id} className="flex justify-between items-baseline text-[11px]">
                  <span className="font-semibold text-slate-800">{l.name}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Right Area */}
      <main className={`w-[66%] ${spacing.containerPadding} ${spacing.sectionGap}`}>
        {/* Name & Title */}
        <header data-edit-section="personal" className={`border-b border-slate-200 ${spacing.headerMargin}`}>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {personalInfo.fullName || "Your Full Name"}
          </h1>
          <div
            className="text-sm font-semibold tracking-wide mt-1 uppercase"
            style={{ color: accent }}
          >
            {personalInfo.jobTitle || "Your Professional Title"}
          </div>
        </header>

        {/* Summary */}
        {summary && (
          <section
            data-edit-section="summary"
            className={`transition-all duration-300 rounded-lg ${
              focusedTarget?.section === "summary" ? "cv-focus-section" : ""
            }`}
          >
            <h2
              className={`text-xs font-bold uppercase tracking-wider ${spacing.sectionHeaderMargin}`}
              style={{ color: accent }}
            >
              Summary
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed">
              {summary}
            </p>
          </section>
        )}

        {/* Work Experience */}
        {experience?.length > 0 && (
          <section
            data-edit-section="experience"
            className={`transition-all duration-300 rounded-lg ${
              focusedTarget?.section === "experience" && !focusedTarget?.itemId ? "cv-focus-section" : ""
            }`}
          >
            <h2
              className={`text-xs font-bold uppercase tracking-wider ${spacing.sectionHeaderMargin}`}
              style={{ color: accent }}
            >
              Experience
            </h2>
            <div className={spacing.itemGap}>
              <ExperienceEntries experience={experience} focusedTarget={focusedTarget} style={{ accent, density: themeConfig?.spacing, role: "text-sm font-bold text-slate-900", groupRole: "text-xs font-bold text-slate-900", company: "text-xs font-semibold", groupCompany: "text-sm font-bold", date: "text-[11px] text-slate-500", location: "text-[11px] text-slate-400", bullets: "space-y-1 text-xs text-slate-700" }} />
            </div>
          </section>
        )}

        {/* Projects */}
        {projects?.length > 0 && (
          <section
            data-edit-section="projects"
            className={`transition-all duration-300 rounded-lg ${
              focusedTarget?.section === "projects" && !focusedTarget?.itemId ? "cv-focus-section" : ""
            }`}
          >
            <h2
              className={`text-xs font-bold uppercase tracking-wider ${spacing.sectionHeaderMargin}`}
              style={{ color: accent }}
            >
              Projects
            </h2>
            <div className={spacing.itemGap}>
              {projects.map((proj) => {
                const isItemFocused = focusedTarget?.itemId === proj.id;
                return (
                  <div
                    key={proj.id}
                    data-edit-item={proj.id}
                    className={`p-2.5 rounded border border-slate-200 transition-all duration-300 ${
                      isItemFocused ? "cv-focus" : ""
                    }`}
                  >
                    <div className="flex justify-between items-baseline mb-1 gap-2 text-xs leading-snug">
                      <span className="font-bold text-slate-900 text-xs min-w-0 flex-1 truncate">
                        {proj.name}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
                        {proj.link && (
                          <a
                            href={normalizeUrl(proj.link)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium hover:underline" style={{ color: accent }}
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
                    <p className="text-slate-600 mb-1.5 text-xs leading-relaxed">{proj.description}</p>
                    {proj.techStack?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {proj.techStack.map((tech, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1 py-0.5 rounded bg-slate-100 font-mono text-slate-600"
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
        )}

        {/* Custom Sections */}
        {customSections && customSections.length > 0 && (
          <div className={spacing.sectionGap}>
            {customSections.map((custom) => {
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
                    className={`text-xs font-bold uppercase tracking-wider ${spacing.sectionHeaderMargin}`}
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
                          <div className="flex justify-between items-baseline font-bold text-slate-900 gap-2">
                            <span className="min-w-0 flex-1 truncate">{item.title}</span>
                            {item.date && (
                              <span className="font-normal text-[11px] text-slate-500 whitespace-nowrap flex-shrink-0 ml-auto">
                                {formatMonthYear(item.date)}
                              </span>
                            )}
                          </div>
                          {item.subtitle && (
                            <div className="text-slate-600 font-medium text-[11px]">
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
            })}
          </div>
        )}
      </main>
    </div>
  );
}

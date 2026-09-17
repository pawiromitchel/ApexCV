"use client";

import React from "react";
import { ResumeData } from "@/lib/types";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Calendar,
  ExternalLink,
} from "lucide-react";

interface TemplateProps {
  data: ResumeData;
}

export function ModernTechTemplate({ data }: TemplateProps) {
  const { personalInfo, summary, experience, education, skills, projects, certifications, customSections, sectionOrder, themeConfig } = data;
  const accent = themeConfig.accentColor || "#0284c7";

  const spacingClass =
    themeConfig.spacing === "compact"
      ? "space-y-3"
      : themeConfig.spacing === "spacious"
      ? "space-y-6"
      : "space-y-4";

  const itemSpacingClass =
    themeConfig.spacing === "compact" ? "space-y-1.5" : "space-y-3";

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    const cat = skill.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  return (
    <div className="p-8 sm:p-10 text-slate-900 leading-normal bg-white min-h-[297mm]">
      {/* Header */}
      <header className="border-b pb-5 mb-5 border-slate-200">
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
      <div className={spacingClass}>
        {sectionOrder.map((sectionKey) => {
          if (sectionKey === "summary" && summary) {
            return (
              <section key="summary">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-2">
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
              <section key="experience">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
                  <span
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: accent }}
                  />
                  Work Experience
                </h2>
                <div className={itemSpacingClass}>
                  {experience.map((exp) => (
                    <div key={exp.id} className="text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-900 text-sm">
                          {exp.role}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 font-medium mb-1">
                        <span style={{ color: accent }}>{exp.company}</span>
                        {exp.location && <span>{exp.location}</span>}
                      </div>
                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul className="list-disc ml-4 space-y-1 text-slate-700 mt-1">
                          {exp.bullets.map((b, i) => (
                            <li key={i} className="pl-0.5 leading-relaxed">
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === "skills" && skills?.length > 0) {
            return (
              <section key="skills">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-2.5">
                  <span
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: accent }}
                  />
                  Skills & Technologies
                </h2>
                <div className="space-y-2">
                  {Object.entries(skillsByCategory).map(([cat, skList]) => (
                    <div key={cat} className="flex items-start text-xs gap-2">
                      <span className="font-semibold text-slate-800 w-28 flex-shrink-0 text-[11px] uppercase tracking-wide">
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
              <section key="projects">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
                  <span
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: accent }}
                  />
                  Key Projects
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-2.5 rounded-lg border border-slate-200/80 bg-slate-50/50 text-xs"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-900">
                          {proj.name}
                        </span>
                        {proj.link && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-500 hover:text-slate-800"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
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
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === "education" && education?.length > 0) {
            return (
              <section key="education">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-2.5">
                  <span
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: accent }}
                  />
                  Education
                </h2>
                <div className={itemSpacingClass}>
                  {education.map((edu) => (
                    <div key={edu.id} className="text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-900 text-sm">
                          {edu.degree}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {edu.startDate} – {edu.endDate}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span style={{ color: accent }} className="font-medium">
                          {edu.institution}
                        </span>
                        {edu.location && <span>{edu.location}</span>}
                      </div>
                      {(edu.gpa || edu.honors) && (
                        <p className="text-slate-600 mt-0.5 text-[11px]">
                          {edu.gpa && <span>GPA: {edu.gpa} </span>}
                          {edu.honors && <span>• {edu.honors}</span>}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === "certifications" && certifications?.length > 0) {
            return (
              <section key="certifications">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-2">
                  <span
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: accent }}
                  />
                  Certifications
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex justify-between items-center py-1 border-b border-slate-100"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">
                          {cert.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {cert.issuer}
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400">
                        {cert.date}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Custom sections
          const custom = customSections?.find((c) => c.id === sectionKey);
          if (custom && custom.items?.length > 0) {
            return (
              <section key={custom.id}>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-2">
                  <span
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: accent }}
                  />
                  {custom.title}
                </h2>
                <div className="space-y-2">
                  {custom.items.map((item) => (
                    <div key={item.id} className="text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-900">
                          {item.title}
                        </span>
                        {item.date && (
                          <span className="text-[11px] text-slate-500">
                            {item.date}
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
                  ))}
                </div>
              </section>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

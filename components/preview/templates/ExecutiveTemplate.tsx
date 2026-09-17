"use client";

import React from "react";
import { ResumeData } from "@/lib/types";
import { Mail, Phone, MapPin, Globe, Linkedin } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
}

export function ExecutiveTemplate({ data }: TemplateProps) {
  const { personalInfo, summary, experience, education, skills, projects, certifications, customSections, sectionOrder, themeConfig } = data;
  const accent = themeConfig.accentColor || "#1e3a8a"; // Navy default

  const spacingClass =
    themeConfig.spacing === "compact"
      ? "space-y-3.5"
      : themeConfig.spacing === "spacious"
      ? "space-y-6"
      : "space-y-4.5";

  return (
    <div className="p-8 sm:p-11 text-slate-900 leading-normal bg-white min-h-[297mm] font-serif">
      {/* Header */}
      <header className="text-center pb-4 mb-4 border-b-2 border-slate-900">
        <h1 className="text-3xl font-bold tracking-tight uppercase text-slate-900">
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        <div
          className="text-sm font-semibold tracking-widest uppercase mt-1"
          style={{ color: accent }}
        >
          {personalInfo.jobTitle || "Executive Leadership"}
        </div>

        {/* Contact Strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2.5 text-xs text-slate-700 font-sans">
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.location && personalInfo.phone && <span>•</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.phone && personalInfo.email && <span>•</span>}
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.linkedin && (
            <>
              <span>•</span>
              <span>{personalInfo.linkedin.replace(/^https?:\/\//, "")}</span>
            </>
          )}
          {personalInfo.website && (
            <>
              <span>•</span>
              <span>{personalInfo.website.replace(/^https?:\/\//, "")}</span>
            </>
          )}
        </div>
      </header>

      {/* Ordered Content */}
      <div className={spacingClass}>
        {sectionOrder.map((sectionKey) => {
          if (sectionKey === "summary" && summary) {
            return (
              <section key="summary">
                <h2
                  className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b border-slate-300 font-sans"
                  style={{ color: accent }}
                >
                  Executive Profile
                </h2>
                <p className="text-xs text-slate-800 leading-relaxed text-justify">
                  {summary}
                </p>
              </section>
            );
          }

          if (sectionKey === "experience" && experience?.length > 0) {
            return (
              <section key="experience">
                <h2
                  className="text-xs font-bold uppercase tracking-wider pb-1 mb-3 border-b border-slate-300 font-sans"
                  style={{ color: accent }}
                >
                  Professional Experience
                </h2>
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-900 text-sm">
                          {exp.role}
                        </span>
                        <span className="text-xs font-sans text-slate-600">
                          {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-700 font-sans font-semibold mb-1.5">
                        <span style={{ color: accent }}>{exp.company}</span>
                        {exp.location && <span className="font-normal text-slate-500">{exp.location}</span>}
                      </div>
                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul className="list-disc ml-4 space-y-1 text-slate-800 font-sans">
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

          if (sectionKey === "education" && education?.length > 0) {
            return (
              <section key="education">
                <h2
                  className="text-xs font-bold uppercase tracking-wider pb-1 mb-2.5 border-b border-slate-300 font-sans"
                  style={{ color: accent }}
                >
                  Education & Credentials
                </h2>
                <div className="space-y-2.5">
                  {education.map((edu) => (
                    <div key={edu.id} className="text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-900">
                          {edu.degree}
                        </span>
                        <span className="text-xs font-sans text-slate-600">
                          {edu.startDate} – {edu.endDate}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-700 font-sans">
                        <span className="font-medium" style={{ color: accent }}>
                          {edu.institution}
                        </span>
                        {edu.location && <span className="text-slate-500">{edu.location}</span>}
                      </div>
                      {(edu.gpa || edu.honors) && (
                        <p className="text-slate-600 font-sans text-[11px] mt-0.5">
                          {edu.honors} {edu.gpa && `(GPA: ${edu.gpa})`}
                        </p>
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
                <h2
                  className="text-xs font-bold uppercase tracking-wider pb-1 mb-2.5 border-b border-slate-300 font-sans"
                  style={{ color: accent }}
                >
                  Core Competencies & Expertise
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs font-sans text-slate-800">
                  {skills.map((s) => (
                    <div key={s.id} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                      <span>{s.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === "projects" && projects?.length > 0) {
            return (
              <section key="projects">
                <h2
                  className="text-xs font-bold uppercase tracking-wider pb-1 mb-2.5 border-b border-slate-300 font-sans"
                  style={{ color: accent }}
                >
                  Key Initiatives & Ventures
                </h2>
                <div className="space-y-2 text-xs">
                  {projects.map((proj) => (
                    <div key={proj.id}>
                      <div className="font-bold text-slate-900">
                        {proj.name}
                      </div>
                      <p className="text-slate-700 font-sans leading-relaxed">
                        {proj.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === "certifications" && certifications?.length > 0) {
            return (
              <section key="certifications">
                <h2
                  className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b border-slate-300 font-sans"
                  style={{ color: accent }}
                >
                  Certifications & Governance
                </h2>
                <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                  {certifications.map((c) => (
                    <div key={c.id}>
                      <div className="font-semibold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-600">{c.issuer} ({c.date})</div>
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

"use client";

import React from "react";
import { ResumeData } from "@/lib/types";

interface TemplateProps {
  data: ResumeData;
}

export function AtsClassicTemplate({ data }: TemplateProps) {
  const { personalInfo, summary, experience, education, skills, projects, certifications, customSections, sectionOrder } = data;

  // Group skills by category for clear ATS reading
  const skillsByCategory = skills.reduce((acc, skill) => {
    const cat = skill.category || "Technical Skills";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill.name);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="p-8 sm:p-10 text-slate-900 bg-white min-h-[297mm] font-serif leading-relaxed text-xs">
      {/* ATS Standard Centered Header */}
      <header className="text-center border-b border-slate-900 pb-3 mb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-950">
          {personalInfo.fullName || "YOUR FULL NAME"}
        </h1>
        {personalInfo.jobTitle && (
          <div className="text-xs font-semibold uppercase text-slate-700 mt-0.5 tracking-wide">
            {personalInfo.jobTitle}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 mt-1.5 text-[11px] text-slate-800">
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.location && personalInfo.phone && <span>|</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.phone && personalInfo.email && <span>|</span>}
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.linkedin && (
            <>
              <span>|</span>
              <span>{personalInfo.linkedin.replace(/^https?:\/\//, "")}</span>
            </>
          )}
          {personalInfo.github && (
            <>
              <span>|</span>
              <span>{personalInfo.github.replace(/^https?:\/\//, "")}</span>
            </>
          )}
        </div>
      </header>

      {/* Content in standardized order */}
      <div className="space-y-3.5">
        {sectionOrder.map((sectionKey) => {
          if (sectionKey === "summary" && summary) {
            return (
              <section key="summary">
                <h2 className="font-bold text-xs uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-1.5 text-slate-950">
                  Professional Summary
                </h2>
                <p className="text-slate-800 text-justify text-[11.5px] leading-normal">
                  {summary}
                </p>
              </section>
            );
          }

          if (sectionKey === "experience" && experience?.length > 0) {
            return (
              <section key="experience">
                <h2 className="font-bold text-xs uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-2 text-slate-950">
                  Professional Experience
                </h2>
                <div className="space-y-3">
                  {experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline font-bold text-slate-950">
                        <span>{exp.company}</span>
                        <span className="font-normal text-[11px] text-slate-800">
                          {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline italic text-slate-800 text-[11.5px] mb-1">
                        <span>{exp.role}</span>
                        {exp.location && <span>{exp.location}</span>}
                      </div>
                      {exp.bullets?.length > 0 && (
                        <ul className="list-disc ml-5 space-y-0.5 text-slate-800 text-[11px]">
                          {exp.bullets.map((b, i) => (
                            <li key={i} className="leading-snug">
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
                <h2 className="font-bold text-xs uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-2 text-slate-950">
                  Education
                </h2>
                <div className="space-y-2">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex justify-between items-baseline font-bold text-slate-950">
                        <span>{edu.institution}</span>
                        <span className="font-normal text-[11px] text-slate-800">
                          {edu.startDate} – {edu.endDate}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline italic text-slate-800 text-[11.5px]">
                        <span>{edu.degree}</span>
                        {edu.location && <span>{edu.location}</span>}
                      </div>
                      {(edu.gpa || edu.honors) && (
                        <div className="text-[11px] text-slate-700 mt-0.5">
                          {edu.honors} {edu.gpa && `• GPA: ${edu.gpa}`}
                        </div>
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
                <h2 className="font-bold text-xs uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-1.5 text-slate-950">
                  Skills & Competencies
                </h2>
                <div className="space-y-1 text-[11.5px]">
                  {Object.entries(skillsByCategory).map(([cat, list]) => (
                    <div key={cat} className="flex">
                      <span className="font-bold text-slate-900 w-36 flex-shrink-0">
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
            return (
              <section key="projects">
                <h2 className="font-bold text-xs uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-2 text-slate-950">
                  Key Projects
                </h2>
                <div className="space-y-2">
                  {projects.map((proj) => (
                    <div key={proj.id} className="text-[11.5px]">
                      <div className="font-bold text-slate-950">
                        {proj.name}
                        {proj.techStack?.length > 0 && (
                          <span className="font-normal text-slate-600 ml-1.5">
                            ({proj.techStack.join(", ")})
                          </span>
                        )}
                      </div>
                      <div className="text-slate-800 leading-snug">
                        {proj.description}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionKey === "certifications" && certifications?.length > 0) {
            return (
              <section key="certifications">
                <h2 className="font-bold text-xs uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-1.5 text-slate-950">
                  Certifications
                </h2>
                <ul className="list-disc ml-5 space-y-0.5 text-[11px] text-slate-800">
                  {certifications.map((c) => (
                    <li key={c.id}>
                      <span className="font-semibold">{c.name}</span> – {c.issuer} ({c.date})
                    </li>
                  ))}
                </ul>
              </section>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { ResumeData } from "@/lib/types";
import { Mail, Phone, MapPin, Globe, Linkedin, Github, ExternalLink } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
}

export function CreativeTemplate({ data }: TemplateProps) {
  const { personalInfo, summary, experience, education, skills, projects, certifications, customSections, sectionOrder, themeConfig } = data;
  const accent = themeConfig.accentColor || "#ec4899"; // Pink / Vibrant default

  return (
    <div className="text-slate-900 bg-white min-h-[297mm] overflow-hidden flex flex-col">
      {/* Top Graphic Accent Banner */}
      <div
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
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-8 space-y-5 flex-1">
        {sectionOrder.map((sectionKey) => {
          if (sectionKey === "summary" && summary) {
            return (
              <section key="summary">
                <h2
                  className="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-2"
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
              <section key="experience">
                <h2
                  className="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-3"
                  style={{ color: accent }}
                >
                  <span className="w-3 h-0.5" style={{ backgroundColor: accent }} />
                  Experience
                </h2>
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="text-xs relative pl-4 border-l-2 border-slate-200">
                      <div
                        className="absolute -left-[5px] top-1 w-2 h-2 rounded-full ring-2 ring-white"
                        style={{ backgroundColor: accent }}
                      />
                      <div className="flex justify-between items-baseline">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {exp.role}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                        </span>
                      </div>
                      <div className="font-bold text-xs mb-1" style={{ color: accent }}>
                        {exp.company} {exp.location && <span className="font-normal text-slate-400">({exp.location})</span>}
                      </div>
                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul className="list-disc ml-3.5 space-y-1 text-slate-600">
                          {exp.bullets.map((b, i) => (
                            <li key={i} className="leading-relaxed">
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
              <section key="projects">
                <h2
                  className="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-3"
                  style={{ color: accent }}
                >
                  <span className="w-3 h-0.5" style={{ backgroundColor: accent }} />
                  Featured Portfolio
                </h2>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-3 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm"
                    >
                      <div className="flex justify-between items-center font-bold text-slate-900 mb-1">
                        <span>{proj.name}</span>
                        {proj.link && (
                          <ExternalLink className="w-3 h-3 text-slate-400" />
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
                              className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700"
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
                <h2
                  className="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-2"
                  style={{ color: accent }}
                >
                  <span className="w-3 h-0.5" style={{ backgroundColor: accent }} />
                  Education
                </h2>
                <div className="space-y-2 text-xs">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{edu.degree}</span>
                        <span className="text-slate-500 font-normal">
                          {edu.startDate} – {edu.endDate}
                        </span>
                      </div>
                      <div className="text-slate-600 font-medium">
                        {edu.institution} {edu.location && `• ${edu.location}`}
                      </div>
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

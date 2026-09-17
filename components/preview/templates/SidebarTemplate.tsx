"use client";

import React from "react";
import { ResumeData } from "@/lib/types";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";

interface TemplateProps {
  data: ResumeData;
}

export function SidebarTemplate({ data }: TemplateProps) {
  const { personalInfo, summary, experience, education, skills, projects, certifications, customSections, sectionOrder, themeConfig } = data;
  const accent = themeConfig.accentColor || "#0f766e"; // Teal default

  return (
    <div className="flex bg-white text-slate-900 min-h-[297mm]">
      {/* Left Sidebar */}
      <aside className="w-[34%] bg-slate-50 border-r border-slate-200 p-6 flex flex-col gap-5">
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
        <div className="space-y-2 text-xs">
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
          <div className="space-y-2 text-xs">
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
          <div className="space-y-2.5 text-xs">
            <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              Education
            </h3>
            {education.map((edu) => (
              <div key={edu.id} className="space-y-0.5">
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
            ))}
          </div>
        )}

        {/* Certifications in Sidebar */}
        {certifications?.length > 0 && (
          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              Certifications
            </h3>
            {certifications.map((c) => (
              <div key={c.id}>
                <div className="font-semibold text-slate-900 leading-tight">
                  {c.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  {c.issuer} ({c.date})
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main Right Area */}
      <main className="w-[66%] p-7 space-y-5">
        {/* Name & Title */}
        <header className="border-b border-slate-200 pb-4">
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
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: accent }}
            >
              Profile Overview
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed">
              {summary}
            </p>
          </section>
        )}

        {/* Work Experience */}
        {experience?.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: accent }}
            >
              Experience
            </h2>
            <div className="space-y-3.5">
              {experience.map((exp) => (
                <div key={exp.id} className="text-xs">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span className="text-sm">{exp.role}</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-700 mb-1">
                    <span style={{ color: accent }}>{exp.company}</span>
                    {exp.location && <span className="text-slate-400 font-normal"> • {exp.location}</span>}
                  </div>
                  {exp.bullets?.length > 0 && (
                    <ul className="list-disc ml-3.5 space-y-1 text-slate-700">
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
        )}

        {/* Projects */}
        {projects?.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider mb-2.5"
              style={{ color: accent }}
            >
              Projects
            </h2>
            <div className="space-y-2.5 text-xs">
              {projects.map((proj) => (
                <div key={proj.id} className="p-2.5 rounded border border-slate-200">
                  <div className="font-bold text-slate-900">{proj.name}</div>
                  <p className="text-slate-600 my-1">{proj.description}</p>
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
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

"use client";

import React from "react";
import { EducationItem } from "@/lib/types";
import { Plus, Trash2, GraduationCap } from "lucide-react";

interface EducationFormProps {
  education: EducationItem[];
  onChange: (education: EducationItem[]) => void;
}

export function EducationForm({ education, onChange }: EducationFormProps) {
  const handleAddEducation = () => {
    const newItem: EducationItem = {
      id: `edu_${Date.now()}`,
      degree: "",
      institution: "",
      location: "",
      startDate: "",
      endDate: "",
      gpa: "",
      honors: "",
    };
    onChange([...education, newItem]);
  };

  const handleUpdate = (id: string, updated: Partial<EducationItem>) => {
    onChange(
      education.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const handleDelete = (id: string) => {
    onChange(education.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Education ({education.length})
          </h3>
          <p className="text-[11px] text-slate-500">
            Degrees, certifications, and academic background.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddEducation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 text-xs font-bold transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Education</span>
        </button>
      </div>

      {education.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
          <GraduationCap className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-400">No education entries yet</p>
          <button
            type="button"
            onClick={handleAddEducation}
            className="mt-3 text-xs font-bold text-sky-400 hover:underline"
          >
            + Add degree or school
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {education.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-200">
                  {item.degree || "Degree"}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Degree / Field of Study *
                  </label>
                  <input
                    type="text"
                    value={item.degree}
                    onChange={(e) => handleUpdate(item.id, { degree: e.target.value })}
                    placeholder="e.g. B.S. in Computer Science"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Institution / University *
                  </label>
                  <input
                    type="text"
                    value={item.institution}
                    onChange={(e) => handleUpdate(item.id, { institution: e.target.value })}
                    placeholder="e.g. Stanford University"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={item.location}
                    onChange={(e) => handleUpdate(item.id, { location: e.target.value })}
                    placeholder="Stanford, CA"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={item.startDate}
                    onChange={(e) => handleUpdate(item.id, { startDate: e.target.value })}
                    placeholder="2016"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Graduation Date
                  </label>
                  <input
                    type="text"
                    value={item.endDate}
                    onChange={(e) => handleUpdate(item.id, { endDate: e.target.value })}
                    placeholder="2020"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    GPA (Optional)
                  </label>
                  <input
                    type="text"
                    value={item.gpa || ""}
                    onChange={(e) => handleUpdate(item.id, { gpa: e.target.value })}
                    placeholder="3.9 / 4.0"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Honors & Activities
                  </label>
                  <input
                    type="text"
                    value={item.honors || ""}
                    onChange={(e) => handleUpdate(item.id, { honors: e.target.value })}
                    placeholder="Magna Cum Laude, Dean's List"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

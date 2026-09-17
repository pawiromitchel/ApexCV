"use client";

import React from "react";
import { ProjectItem } from "@/lib/types";
import { Plus, Trash2, FolderGit2, ExternalLink } from "lucide-react";

interface ProjectsFormProps {
  projects: ProjectItem[];
  onChange: (projects: ProjectItem[]) => void;
}

export function ProjectsForm({ projects, onChange }: ProjectsFormProps) {
  const handleAddProject = () => {
    const newItem: ProjectItem = {
      id: `proj_${Date.now()}`,
      name: "",
      description: "",
      techStack: [],
      link: "",
      github: "",
    };
    onChange([...projects, newItem]);
  };

  const handleUpdate = (id: string, updated: Partial<ProjectItem>) => {
    onChange(
      projects.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const handleDelete = (id: string) => {
    onChange(projects.filter((item) => item.id !== id));
  };

  const handleTechStackChange = (id: string, text: string) => {
    const arr = text.split(",").map((s) => s.trim()).filter(Boolean);
    handleUpdate(id, { techStack: arr });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Key Projects ({projects.length})
          </h3>
          <p className="text-[11px] text-slate-500">
            Open-source libraries, client work, apps, or business initiatives.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddProject}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 text-xs font-bold transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
          <FolderGit2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-400">No projects added yet</p>
          <button
            type="button"
            onClick={handleAddProject}
            className="mt-3 text-xs font-bold text-sky-400 hover:underline"
          >
            + Add project showcase
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-200">
                  {item.name || "Project Title"}
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
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdate(item.id, { name: e.target.value })}
                    placeholder="e.g. StreamCast Protocol"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Technologies (comma separated)
                  </label>
                  <input
                    type="text"
                    value={(item.techStack || []).join(", ")}
                    onChange={(e) => handleTechStackChange(item.id, e.target.value)}
                    placeholder="e.g. TypeScript, Next.js, Go, Docker"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Live Demo Link
                  </label>
                  <input
                    type="text"
                    value={item.link || ""}
                    onChange={(e) => handleUpdate(item.id, { link: e.target.value })}
                    placeholder="https://myproject.com"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Source Code / GitHub
                  </label>
                  <input
                    type="text"
                    value={item.github || ""}
                    onChange={(e) => handleUpdate(item.id, { github: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Description / Impact
                </label>
                <textarea
                  rows={2}
                  value={item.description}
                  onChange={(e) => handleUpdate(item.id, { description: e.target.value })}
                  placeholder="Explain the problem solved, architecture used, and quantifiable outcome..."
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

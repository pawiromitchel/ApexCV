"use client";

import React, { useState } from "react";
import { ExperienceItem } from "@/lib/types";
import { Plus, Trash2, ChevronDown, ChevronUp, Briefcase, PlusCircle, X } from "lucide-react";

interface ExperienceFormProps {
  experience: ExperienceItem[];
  onChange: (experience: ExperienceItem[]) => void;
}

export function ExperienceForm({ experience, onChange }: ExperienceFormProps) {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>(() => {
    // Open the first item by default
    return experience.length > 0 ? { [experience[0].id]: true } : {};
  });

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddExperience = () => {
    const newId = `exp_${Date.now()}`;
    const newItem: ExperienceItem = {
      id: newId,
      role: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      bullets: [""],
    };
    onChange([newItem, ...experience]);
    setOpenIds((prev) => ({ ...prev, [newId]: true }));
  };

  const handleUpdateItem = (id: string, updated: Partial<ExperienceItem>) => {
    onChange(
      experience.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(experience.filter((item) => item.id !== id));
  };

  // Bullet point handlers
  const handleAddBullet = (expId: string) => {
    onChange(
      experience.map((item) => {
        if (item.id !== expId) return item;
        return { ...item, bullets: [...(item.bullets || []), ""] };
      })
    );
  };

  const handleUpdateBullet = (expId: string, bulletIdx: number, text: string) => {
    onChange(
      experience.map((item) => {
        if (item.id !== expId) return item;
        const newBullets = [...(item.bullets || [])];
        newBullets[bulletIdx] = text;
        return { ...item, bullets: newBullets };
      })
    );
  };

  const handleDeleteBullet = (expId: string, bulletIdx: number) => {
    onChange(
      experience.map((item) => {
        if (item.id !== expId) return item;
        const newBullets = (item.bullets || []).filter((_, i) => i !== bulletIdx);
        return { ...item, bullets: newBullets };
      })
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Work Experience ({experience.length})
          </h3>
          <p className="text-[11px] text-slate-500">
            Detail your roles, key achievements, and impact.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddExperience}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Position</span>
        </button>
      </div>

      {experience.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
          <Briefcase className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-400">No work experience added yet</p>
          <button
            type="button"
            onClick={handleAddExperience}
            className="mt-3 text-xs font-bold text-sky-400 hover:underline"
          >
            + Add your first role
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {experience.map((item, index) => {
            const isOpen = openIds[item.id] ?? false;

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleOpen(item.id)}
                  className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-850 transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-6 h-6 rounded-lg bg-slate-800 text-sky-400 flex items-center justify-center text-[11px] font-bold">
                      {index + 1}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-200 truncate">
                        {item.role || "Untitled Position"}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {item.company || "Company"} • {item.startDate || "Start"} –{" "}
                        {item.current ? "Present" : item.endDate || "End"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      title="Delete Position"
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="text-slate-500">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Form Body */}
                {isOpen && (
                  <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950/40">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          Role / Title *
                        </label>
                        <input
                          type="text"
                          value={item.role}
                          onChange={(e) => handleUpdateItem(item.id, { role: e.target.value })}
                          placeholder="e.g. Lead Frontend Architect"
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          Company / Organization *
                        </label>
                        <input
                          type="text"
                          value={item.company}
                          onChange={(e) => handleUpdateItem(item.id, { company: e.target.value })}
                          placeholder="e.g. Stripe"
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
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
                          onChange={(e) => handleUpdateItem(item.id, { location: e.target.value })}
                          placeholder="e.g. San Francisco, CA"
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          Start Date
                        </label>
                        <input
                          type="text"
                          value={item.startDate}
                          onChange={(e) => handleUpdateItem(item.id, { startDate: e.target.value })}
                          placeholder="e.g. 2022-03"
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          End Date
                        </label>
                        <input
                          type="text"
                          disabled={item.current}
                          value={item.current ? "Present" : item.endDate}
                          onChange={(e) => handleUpdateItem(item.id, { endDate: e.target.value })}
                          placeholder="e.g. 2024-01"
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id={`current-${item.id}`}
                        checked={item.current}
                        onChange={(e) => handleUpdateItem(item.id, { current: e.target.checked })}
                        className="rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-900"
                      />
                      <label htmlFor={`current-${item.id}`} className="text-xs text-slate-300 select-none cursor-pointer">
                        I currently work here
                      </label>
                    </div>

                    {/* Bullet Points */}
                    <div className="pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Achievements & Responsibilities
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddBullet(item.id)}
                          className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                        >
                          <PlusCircle className="w-3 h-3" />
                          <span>Add Bullet</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(item.bullets || []).map((bullet, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-2">
                            <span className="text-slate-600 text-xs mt-2">•</span>
                            <textarea
                              rows={2}
                              value={bullet}
                              onChange={(e) => handleUpdateBullet(item.id, bIdx, e.target.value)}
                              placeholder="Action verb + Context + Quantifiable result (e.g. Led redesign of checkout funnel, increasing conversion by 22%)..."
                              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 leading-relaxed"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteBullet(item.id, bIdx)}
                              className="p-1 text-slate-500 hover:text-rose-400 mt-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

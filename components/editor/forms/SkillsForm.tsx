"use client";

import React, { useState } from "react";
import { SkillItem } from "@/lib/types";
import { Plus, X, Sparkles, PlusCircle } from "lucide-react";

interface SkillsFormProps {
  skills: SkillItem[];
  onChange: (skills: SkillItem[]) => void;
}

const quickSuggestions = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "Go",
  "PostgreSQL",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "Tailwind CSS",
  "GraphQL",
  "REST APIs",
  "System Architecture",
  "CI/CD Pipelines",
  "Agile / Scrum",
  "Team Leadership",
];

export function SkillsForm({ skills, onChange }: SkillsFormProps) {
  const [newSkillName, setNewSkillName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Technical Skills");

  // Get distinct categories
  const categories = Array.from(
    new Set([...skills.map((s) => s.category || "Technical Skills"), "Technical Skills", "Languages", "Tools & Cloud", "Soft Skills"])
  );

  const handleAddSkill = (nameToAdd?: string) => {
    const name = (nameToAdd || newSkillName).trim();
    if (!name) return;

    // Check if skill already exists
    if (skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setNewSkillName("");
      return;
    }

    const newSkill: SkillItem = {
      id: `sk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name,
      category: selectedCategory,
      level: 5,
    };

    onChange([...skills, newSkill]);
    if (!nameToAdd) setNewSkillName("");
  };

  const handleRemoveSkill = (id: string) => {
    onChange(skills.filter((s) => s.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // Group current skills
  const skillsByCategory = skills.reduce((acc, s) => {
    const cat = s.category || "Technical Skills";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {} as Record<string, SkillItem[]>);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
          Skills & Technologies ({skills.length})
        </h3>
        <p className="text-[11px] text-slate-500">
          Highlight your tech stack and core competencies. Group them into categories for maximum readability.
        </p>
      </div>

      {/* Add Skill Row */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type skill (e.g. Next.js, Rust, Kafka)..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => handleAddSkill()}
            className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 text-xs font-bold transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Quick Suggestions (click to add)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickSuggestions.map((suggestion) => {
              const alreadyAdded = skills.some(
                (s) => s.name.toLowerCase() === suggestion.toLowerCase()
              );
              if (alreadyAdded) return null;

              return (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleAddSkill(suggestion)}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  + {suggestion}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grouped Skills List */}
      <div className="space-y-4">
        {Object.entries(skillsByCategory).map(([category, items]) => (
          <div key={category} className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <div className="text-xs font-bold text-slate-300 mb-2.5 flex items-center justify-between">
              <span>{category}</span>
              <span className="text-[10px] font-mono text-slate-500">
                {items.length} skills
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {items.map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200"
                >
                  <span>{skill.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill.id)}
                    className="text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

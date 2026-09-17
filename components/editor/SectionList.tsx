"use client";

import React, { useState } from "react";
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Sparkles,
  FolderGit2,
  Award,
  Layers,
} from "lucide-react";

interface SectionListProps {
  sectionOrder: string[];
  activeSection: string;
  onSelectSection: (sectionKey: string) => void;
  onReorder: (newOrder: string[]) => void;
}

const sectionMeta: Record<string, { label: string; icon: any }> = {
  personal: { label: "Personal Info", icon: User },
  summary: { label: "Professional Summary", icon: FileText },
  experience: { label: "Work Experience", icon: Briefcase },
  education: { label: "Education", icon: GraduationCap },
  skills: { label: "Skills & Tech", icon: Sparkles },
  projects: { label: "Projects", icon: FolderGit2 },
  certifications: { label: "Certifications", icon: Award },
};

export function SectionList({
  sectionOrder,
  activeSection,
  onSelectSection,
  onReorder,
}: SectionListProps) {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const moveSection = (index: number, direction: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sectionOrder.length) return;

    const newOrder = [...sectionOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(newIndex, 0, moved);
    onReorder(newOrder);
  };

  const handleDragStart = (index: number) => {
    setDraggedIdx(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = (index: number) => {
    if (draggedIdx === null || draggedIdx === index) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }

    const newOrder = [...sectionOrder];
    const [moved] = newOrder.splice(draggedIdx, 1);
    newOrder.splice(index, 0, moved);

    setDraggedIdx(null);
    setDragOverIdx(null);
    onReorder(newOrder);
  };

  return (
    <div className="space-y-1.5">
      {/* Personal Info is always fixed at top as contact info, but can be edited */}
      <button
        type="button"
        onClick={() => onSelectSection("personal")}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
          activeSection === "personal"
            ? "bg-slate-800 text-emerald-400 ring-1 ring-emerald-500/30 shadow-md"
            : "text-slate-300 hover:bg-slate-900/80 hover:text-white"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <User className="w-4 h-4 text-emerald-400" />
          <span>Personal & Contact Info</span>
        </div>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
          Primary
        </span>
      </button>

      <div className="pt-2 pb-1 px-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
        <span>Reorderable Sections</span>
        <span className="text-[10px] font-normal lowercase text-slate-500">drag or click arrows</span>
      </div>

      {/* Dynamic Draggable Sections */}
      <div className="space-y-1">
        {sectionOrder.map((sectionKey, index) => {
          const meta = sectionMeta[sectionKey] || {
            label: sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1),
            icon: Layers,
          };
          const Icon = meta.icon;
          const isActive = activeSection === sectionKey;
          const isDragging = draggedIdx === index;
          const isOver = dragOverIdx === index;

          return (
            <div
              key={sectionKey}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => {
                setDraggedIdx(null);
                setDragOverIdx(null);
              }}
              onClick={() => onSelectSection(sectionKey)}
              className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                isActive
                  ? "bg-slate-800 text-sky-400 ring-1 ring-sky-500/30 shadow-sm"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              } ${isDragging ? "opacity-30 scale-95 border-dashed border-2 border-sky-400" : ""} ${
                isOver && !isDragging ? "border-t-2 border-sky-400" : ""
              }`}
            >
              {/* Left Grip Handle & Label */}
              <div className="flex items-center gap-2">
                <div
                  className="cursor-grab active:cursor-grabbing text-slate-600 group-hover:text-slate-400 p-0.5"
                  title="Drag to rearrange"
                >
                  <GripVertical className="w-3.5 h-3.5" />
                </div>
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-sky-400" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                <span className="font-semibold">{meta.label}</span>
              </div>

              {/* Up / Down Controls */}
              <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={(e) => moveSection(index, "up", e)}
                  title="Move section up"
                  className="p-1 rounded hover:bg-slate-700/60 disabled:opacity-20 text-slate-400 hover:text-white"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={index === sectionOrder.length - 1}
                  onClick={(e) => moveSection(index, "down", e)}
                  title="Move section down"
                  className="p-1 rounded hover:bg-slate-700/60 disabled:opacity-20 text-slate-400 hover:text-white"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { AnimatePresence } from "motion/react";
import { FolderGit2, Plus } from "lucide-react";
import { ProjectItem } from "@/lib/types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ItemCard, SectionHeader } from "../ItemCard";
import { useItemAccordion } from "../EditorContext";
import { moveItem, newId } from "./listUtils";

interface ProjectsFormProps {
  projects: ProjectItem[];
  onChange: (projects: ProjectItem[]) => void;
}

export function ProjectsForm({ projects, onChange }: ProjectsFormProps) {
  const accordion = useItemAccordion(projects);
  // Keep the raw comma-separated text so typing "React, " doesn't lose the trailing separator
  const [techDrafts, setTechDrafts] = useState<Record<string, string>>({});
  const update = (id: string, patch: Partial<ProjectItem>) =>
    onChange(projects.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const add = () => {
    const id = newId("proj");
    onChange([...projects, { id, name: "", description: "", techStack: [], link: "", github: "", visible: true }]);
    accordion.openAndFocus(id);
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Projects"
        description="Side projects, open source, or notable work samples."
        actions={
          <Button variant="outline" size="sm" onClick={add}>
            <Plus className="h-3.5 w-3.5" /> Add project
          </Button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderGit2 />}
          title="No projects yet"
          description="Great for showing initiative, especially early in your career."
          action={
            <Button variant="primary" onClick={add}>
              <Plus className="h-4 w-4" /> Add a project
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {projects.map((item, index) => (
              <ItemCard
                key={item.id}
                id={item.id}
                index={index}
                total={projects.length}
                noun="project"
                title={item.name || "Untitled project"}
                subtitle={item.techStack?.length ? item.techStack.join(", ") : "Add a description and tools"}
                hidden={item.visible === false}
                open={accordion.isOpen(item.id)}
                onToggle={() => accordion.toggle(item.id)}
                onMove={(dir) => onChange(moveItem(projects, index, dir))}
                onToggleHidden={() => update(item.id, { visible: item.visible === false })}
                onDelete={() => onChange(projects.filter((p) => p.id !== item.id))}
                focusRequested={accordion.focusId === item.id}
                onFocused={accordion.clearFocus}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Project name" required>
                    {(p) => <Input {...p} value={item.name} onChange={(e) => update(item.id, { name: e.target.value })} placeholder="e.g. Budget planner app" />}
                  </Field>
                  <Field label="Tools & technologies" hint="Separate with commas">
                    {(p) => (
                      <Input
                        {...p}
                        value={techDrafts[item.id] ?? (item.techStack || []).join(", ")}
                        onChange={(e) => {
                          setTechDrafts((d) => ({ ...d, [item.id]: e.target.value }));
                          update(item.id, { techStack: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) });
                        }}
                        placeholder="Figma, React, Supabase"
                      />
                    )}
                  </Field>
                </div>
                <Field label="What it does and the result">
                  {(p) => (
                    <Textarea
                      {...p}
                      rows={3}
                      value={item.description}
                      onChange={(e) => update(item.id, { description: e.target.value })}
                      placeholder="The problem, what you built, and the outcome (users, speed, revenue…)"
                    />
                  )}
                </Field>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Live link">
                    {(p) => <Input {...p} type="url" value={item.link || ""} onChange={(e) => update(item.id, { link: e.target.value })} placeholder="https://… (optional)" />}
                  </Field>
                  <Field label="Source code">
                    {(p) => <Input {...p} type="url" value={item.github || ""} onChange={(e) => update(item.id, { github: e.target.value })} placeholder="https://github.com/… (optional)" />}
                  </Field>
                </div>
              </ItemCard>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

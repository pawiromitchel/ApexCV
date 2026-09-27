"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Plus, Sparkles, X } from "lucide-react";
import { SkillItem } from "@/lib/types";
import { DEFAULT_SKILL_CATEGORIES, QUICK_SKILL_SUGGESTIONS, getCategoryForSkill } from "@/lib/skillTaxonomy";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Menu, MenuItem, MenuLabel, MenuSeparator } from "@/components/ui/Popover";
import { spring } from "@/lib/motion";
import { SectionHeader } from "../ItemCard";
import { newId } from "./listUtils";

interface SkillsFormProps {
  skills: SkillItem[];
  onChange: (skills: SkillItem[]) => void;
}

const DEFAULT_CATEGORY = "Professional Skills";
const normalizeCategory = (c?: string) => (!c ? DEFAULT_CATEGORY : c === "Languages" ? "Programming Languages" : c);

export function SkillsForm({ skills, onChange }: SkillsFormProps) {
  const [draft, setDraft] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [categoryTouched, setCategoryTouched] = useState(false);

  const categories = Array.from(new Set([...DEFAULT_SKILL_CATEGORIES, ...skills.map((s) => normalizeCategory(s.category))]));

  const add = (name: string, forcedCategory?: string) => {
    const clean = name.trim();
    if (!clean || skills.some((s) => s.name.toLowerCase() === clean.toLowerCase())) return false;
    onChange([...skills, { id: newId("sk"), name: clean, category: forcedCategory || category, level: 5 }]);
    return true;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow pasting "Figma, Sketch, Miro" in one go
    const parts = draft.split(",").map((p) => p.trim()).filter(Boolean);
    const next = [...skills];
    for (const part of parts) {
      if (next.some((s) => s.name.toLowerCase() === part.toLowerCase())) continue;
      next.push({ id: newId("sk"), name: part, category: categoryTouched ? category : getCategoryForSkill(part) || category, level: 5 });
    }
    if (next.length !== skills.length) onChange(next);
    setDraft("");
    setCategoryTouched(false);
  };

  const grouped = skills.reduce<Record<string, SkillItem[]>>((acc, s) => {
    const c = normalizeCategory(s.category);
    (acc[c] ||= []).push(s);
    return acc;
  }, {});

  const suggestions = QUICK_SKILL_SUGGESTIONS.filter((s) => !skills.some((k) => k.name.toLowerCase() === s.name.toLowerCase())).slice(0, 12);

  return (
    <div className="space-y-5">
      <SectionHeader title="Skills" description="Tools, methods, and strengths that match the roles you want." />

      <form onSubmit={submit} className="space-y-3 rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            aria-label="Skill name"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (!categoryTouched && e.target.value.trim().length >= 3) {
                const auto = getCategoryForSkill(e.target.value);
                if (auto) setCategory(auto);
              }
            }}
            placeholder="Add a skill, or several separated by commas"
            className="flex-1"
          />
          <div className="flex gap-2">
            <Select
              aria-label="Category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCategoryTouched(true);
              }}
              className="min-w-0 flex-1 sm:w-48 sm:flex-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Button type="submit" variant="primary" disabled={!draft.trim()}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div>
            <p className="mb-1.5 flex items-center gap-1 text-xs text-fg-subtle">
              <Sparkles className="h-3 w-3" /> Suggestions
            </p>
            <div className="flex flex-wrap gap-1.5">
              <AnimatePresence initial={false}>
                {suggestions.map((s) => (
                  <motion.button
                    key={s.name}
                    layout
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => add(s.name, s.category)}
                    title={`Add to ${s.category}`}
                    className="inline-flex h-7 items-center gap-1 rounded-full border border-line bg-surface px-2.5 text-[13px] text-fg-secondary transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <Plus className="h-3 w-3" /> {s.name}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </form>

      {skills.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong px-4 py-6 text-center text-[13px] text-fg-muted">
          Your skills will appear here, grouped by category.
        </p>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {Object.entries(grouped).map(([cat, items]) => (
              <motion.div
                key={cat}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={spring.smooth}
                className="rounded-2xl border border-line bg-surface p-4"
              >
                <div className="mb-2.5 flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-fg">{cat}</p>
                  <span className="text-xs tabular-nums text-fg-subtle">{items.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <AnimatePresence initial={false}>
                    {items.map((skill) => (
                      <motion.span
                        key={skill.id}
                        layout
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={spring.snappy}
                        className="inline-flex h-8 items-center rounded-lg bg-surface-2 text-[13px] text-fg"
                      >
                        <Menu
                          ariaLabel={`Options for ${skill.name}`}
                          trigger={(props) => (
                            <button {...props} type="button" className="h-full rounded-l-lg pl-2.5 pr-1.5 hover:text-primary" title="Move to another category">
                              {skill.name}
                            </button>
                          )}
                        >
                          <MenuLabel>Move to</MenuLabel>
                          {categories.map((c) => (
                            <MenuItem
                              key={c}
                              icon={normalizeCategory(skill.category) === c ? <Check /> : <span />}
                              onSelect={() => onChange(skills.map((s) => (s.id === skill.id ? { ...s, category: c } : s)))}
                            >
                              {c}
                            </MenuItem>
                          ))}
                          <MenuSeparator />
                          <MenuItem destructive icon={<X />} onSelect={() => onChange(skills.filter((s) => s.id !== skill.id))}>
                            Remove
                          </MenuItem>
                        </Menu>
                        <button
                          type="button"
                          aria-label={`Remove ${skill.name}`}
                          onClick={() => onChange(skills.filter((s) => s.id !== skill.id))}
                          className="flex h-full items-center rounded-r-lg pl-0.5 pr-2 text-fg-subtle transition-colors hover:text-danger"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

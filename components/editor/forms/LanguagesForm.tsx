"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Globe, Plus } from "lucide-react";
import { LanguageItem } from "@/lib/types";
import { SPOKEN_LANGUAGE_PROFICIENCY_LEVELS, QUICK_SPOKEN_LANGUAGES } from "@/lib/skillTaxonomy";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ItemCard, SectionHeader } from "../ItemCard";
import { useItemAccordion } from "../EditorContext";
import { moveItem, newId } from "./listUtils";

interface LanguagesFormProps {
  languages: LanguageItem[];
  onChange: (languages: LanguageItem[]) => void;
}

export function LanguagesForm({ languages = [], onChange }: LanguagesFormProps) {
  const accordion = useItemAccordion(languages);
  const update = (id: string, patch: Partial<LanguageItem>) =>
    onChange(languages.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const add = (name = "", proficiency = SPOKEN_LANGUAGE_PROFICIENCY_LEVELS[1]) => {
    const id = newId("lang");
    onChange([...languages, { id, name, proficiency, visible: true }]);
    if (!name) accordion.openAndFocus(id);
  };

  const suggestions = QUICK_SPOKEN_LANGUAGES.filter(
    (n) => !languages.some((l) => l.name.trim().toLowerCase() === n.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Languages"
        description="Spoken languages and how well you use them at work."
        actions={
          <Button variant="outline" size="sm" onClick={() => add()}>
            <Plus className="h-3.5 w-3.5" /> Add language
          </Button>
        }
      />

      {suggestions.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-fg-subtle">Quick add</p>
          <div className="flex flex-wrap gap-1.5">
            <AnimatePresence initial={false}>
              {suggestions.map((name) => (
                <motion.button
                  key={name}
                  layout
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => add(name)}
                  className="inline-flex h-7 items-center gap-1 rounded-full border border-line bg-surface px-2.5 text-[13px] text-fg-secondary transition-colors hover:border-primary/50 hover:text-primary"
                >
                  <Plus className="h-3 w-3" /> {name}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {languages.length === 0 ? (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-line-strong px-4 py-5 text-[13px] text-fg-muted">
          <Globe className="h-4 w-4 shrink-0" /> Pick a language above or add your own.
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {languages.map((item, index) => (
              <ItemCard
                key={item.id}
                id={item.id}
                index={index}
                total={languages.length}
                noun="language"
                title={item.name || "Untitled language"}
                subtitle={item.proficiency}
                hidden={item.visible === false}
                open={accordion.isOpen(item.id)}
                onToggle={() => accordion.toggle(item.id)}
                onMove={(dir) => onChange(moveItem(languages, index, dir))}
                onToggleHidden={() => update(item.id, { visible: item.visible === false })}
                onDelete={() => onChange(languages.filter((l) => l.id !== item.id))}
                focusRequested={accordion.focusId === item.id}
                onFocused={accordion.clearFocus}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Language" required>
                    {(p) => <Input {...p} value={item.name} onChange={(e) => update(item.id, { name: e.target.value })} placeholder="e.g. Dutch" />}
                  </Field>
                  <Field label="Level">
                    {(p) => (
                      <Select {...p} value={item.proficiency} onChange={(e) => update(item.id, { proficiency: e.target.value })}>
                        {SPOKEN_LANGUAGE_PROFICIENCY_LEVELS.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </Select>
                    )}
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

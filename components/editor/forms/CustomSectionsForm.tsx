"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronUp, Layers, Plus, Trash2 } from "lucide-react";
import { CustomSection, CustomSectionItem } from "@/lib/types";
import { formatMonthYear } from "@/lib/dateValidation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Field } from "@/components/ui/Field";
import { Button, IconButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { MonthYearPicker } from "@/components/ui/MonthYearPicker";
import { spring } from "@/lib/motion";
import { ItemCard, SectionHeader } from "../ItemCard";
import { useItemAccordion } from "../EditorContext";
import { moveItem, newId } from "./listUtils";

interface CustomSectionsFormProps {
  customSections: CustomSection[];
  onChange: (sections: CustomSection[]) => void;
}

const emptyItem = (): CustomSectionItem => ({ id: newId("item"), title: "", subtitle: "", date: "", description: "", visible: true });

export function CustomSectionsForm({ customSections, onChange }: CustomSectionsFormProps) {
  const allItems = customSections.flatMap((s) => s.items || []);
  const accordion = useItemAccordion(allItems);

  const updateSection = (id: string, patch: Partial<CustomSection>) =>
    onChange(customSections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const updateItems = (sectionId: string, fn: (items: CustomSectionItem[]) => CustomSectionItem[]) =>
    onChange(customSections.map((s) => (s.id === sectionId ? { ...s, items: fn(s.items || []) } : s)));

  const addSection = () => {
    const item = emptyItem();
    onChange([...customSections, { id: `sec_${Date.now()}`, title: "New section", items: [item], visible: true }]);
    accordion.openAndFocus(item.id);
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Custom sections"
        description="Volunteering, publications, awards, interests: anything that doesn’t fit elsewhere."
        actions={
          <Button variant="outline" size="sm" onClick={addSection}>
            <Plus className="h-3.5 w-3.5" /> Add section
          </Button>
        }
      />

      {customSections.length === 0 ? (
        <EmptyState
          icon={<Layers />}
          title="No custom sections"
          action={
            <Button variant="primary" onClick={addSection}>
              <Plus className="h-4 w-4" /> Create a section
            </Button>
          }
        />
      ) : (
        <AnimatePresence initial={false}>
          {customSections.map((section, sIdx) => (
            <motion.section
              key={section.id}
              layout="position"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={spring.smooth}
              className="space-y-3 rounded-2xl border border-line bg-surface-2/40 p-3 sm:p-4"
            >
              <div className="flex items-end gap-2">
                <Field label="Section title" className="flex-1">
                  {(p) => (
                    <Input
                      {...p}
                      value={section.title}
                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                      placeholder="e.g. Volunteering"
                      className="font-semibold"
                    />
                  )}
                </Field>
                <div className="flex pb-0.5">
                  {customSections.length > 1 && (
                    <>
                      <IconButton label="Move section up" disabled={sIdx === 0} onClick={() => onChange(moveItem(customSections, sIdx, -1))}>
                        <ChevronUp className="h-4 w-4" />
                      </IconButton>
                      <IconButton label="Move section down" disabled={sIdx === customSections.length - 1} onClick={() => onChange(moveItem(customSections, sIdx, 1))}>
                        <ChevronDown className="h-4 w-4" />
                      </IconButton>
                    </>
                  )}
                  <IconButton
                    label={`Delete section ${section.title}`}
                    onClick={() => onChange(customSections.filter((s) => s.id !== section.id))}
                    className="hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>

              <div className="space-y-2.5">
                <AnimatePresence initial={false}>
                  {(section.items || []).map((item, index) => (
                    <ItemCard
                      key={item.id}
                      id={item.id}
                      index={index}
                      total={section.items.length}
                      noun="entry"
                      title={item.title || "Untitled entry"}
                      subtitle={[item.subtitle, formatMonthYear(item.date)].filter(Boolean).join(" · ") || undefined}
                      hidden={item.visible === false}
                      open={accordion.isOpen(item.id)}
                      onToggle={() => accordion.toggle(item.id)}
                      onMove={(dir) => updateItems(section.id, (items) => moveItem(items, index, dir))}
                      onToggleHidden={() => updateItems(section.id, (items) => items.map((i) => (i.id === item.id ? { ...i, visible: i.visible === false } : i)))}
                      onDelete={() => updateItems(section.id, (items) => items.filter((i) => i.id !== item.id))}
                      focusRequested={accordion.focusId === item.id}
                      focusField={accordion.focusField}
                  onFocused={accordion.clearFocus}
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Title">
                          {(p) => (
                            <Input {...p} value={item.title} onChange={(e) => updateItems(section.id, (items) => items.map((i) => (i.id === item.id ? { ...i, title: e.target.value } : i)))} placeholder="e.g. Mentor" />
                          )}
                        </Field>
                        <Field label="Organisation or detail">
                          {(p) => (
                            <Input {...p} value={item.subtitle} onChange={(e) => updateItems(section.id, (items) => items.map((i) => (i.id === item.id ? { ...i, subtitle: e.target.value } : i)))} placeholder="e.g. Code Club" />
                          )}
                        </Field>
                      </div>
                      <Field label="Date">
                        {(p) => (
                          <MonthYearPicker id={p.id} label="Date" value={item.date} onChange={(v) => updateItems(section.id, (items) => items.map((i) => (i.id === item.id ? { ...i, date: v } : i)))} className="sm:max-w-xs" />
                        )}
                      </Field>
                      <Field label="Description">
                        {(p) => (
                          <Textarea {...p} rows={3} value={item.description} onChange={(e) => updateItems(section.id, (items) => items.map((i) => (i.id === item.id ? { ...i, description: e.target.value } : i)))} placeholder="Optional details" />
                        )}
                      </Field>
                    </ItemCard>
                  ))}
                </AnimatePresence>
                <Button
                  variant="dashed"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const item = emptyItem();
                    updateItems(section.id, (items) => [...items, item]);
                    accordion.openAndFocus(item.id);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> Add entry
                </Button>
              </div>
            </motion.section>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

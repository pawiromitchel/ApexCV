"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpDown, Briefcase, Link2, Plus, X } from "lucide-react";
import { ExperienceItem } from "@/lib/types";
import { isLinkedToPrevious } from "@/lib/experienceHelper";
import { validateDateRange, formatMonthYear, compareDatesDescending } from "@/lib/dateValidation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Field } from "@/components/ui/Field";
import { Button, IconButton } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { MonthYearPicker } from "@/components/ui/MonthYearPicker";
import { ItemCard, SectionHeader } from "../ItemCard";
import { useItemAccordion } from "../EditorContext";
import { moveItem } from "./listUtils";

interface ExperienceFormProps {
  experience: ExperienceItem[];
  onChange: (experience: ExperienceItem[]) => void;
}

export function ExperienceForm({ experience, onChange }: ExperienceFormProps) {
  const accordion = useItemAccordion(experience);

  const update = (id: string, patch: Partial<ExperienceItem>) =>
    onChange(experience.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const updateBullets = (id: string, fn: (bullets: string[]) => string[]) =>
    onChange(experience.map((item) => (item.id === id ? { ...item, bullets: fn([...(item.bullets || [])]) } : item)));

  const add = () => {
    const id = `exp_${Date.now()}`;
    onChange([
      ...experience,
      { id, role: "", company: "", location: "", startDate: "", endDate: "", current: false, bullets: [""], visible: true },
    ]);
    accordion.openAndFocus(id);
  };

  const sortByDate = () =>
    onChange(
      [...experience].sort((a, b) => {
        const endCmp = compareDatesDescending(a.endDate, a.current, b.endDate, b.current);
        return endCmp !== 0 ? endCmp : compareDatesDescending(a.startDate, false, b.startDate, false);
      })
    );

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Experience"
        description="Most recent first. Focus on results, not duties."
        actions={
          <>
            {experience.length > 1 && (
              <Button variant="ghost" size="sm" onClick={sortByDate} title="Sort by date, most recent first">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Sort
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={add}>
              <Plus className="h-3.5 w-3.5" />
              Add position
            </Button>
          </>
        }
      />

      {experience.length === 0 ? (
        <EmptyState
          icon={<Briefcase />}
          title="No experience yet"
          description="Add jobs, internships, freelance work, or volunteering."
          action={
            <Button variant="primary" onClick={add}>
              <Plus className="h-4 w-4" /> Add your first position
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {experience.map((item, index) => {
              const linked = isLinkedToPrevious(experience, index);
              const dates = validateDateRange(item.startDate, item.endDate, item.current);
              const start = formatMonthYear(item.startDate);
              const end = item.current ? "Present" : formatMonthYear(item.endDate);
              const period = start || end ? `${start || "…"} – ${end || "…"}` : null;

              return (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  index={index}
                  total={experience.length}
                  noun="position"
                  title={item.role || "Untitled position"}
                  subtitle={[item.company, period].filter(Boolean).join(" · ") || "Add company and dates"}
                  leading={linked ? <Link2 className="h-3.5 w-3.5" /> : undefined}
                  hidden={item.visible === false}
                  open={accordion.isOpen(item.id)}
                  onToggle={() => accordion.toggle(item.id)}
                  onMove={(dir) => onChange(moveItem(experience, index, dir))}
                  onToggleHidden={() => update(item.id, { visible: item.visible === false })}
                  onDelete={() => onChange(experience.filter((e) => e.id !== item.id))}
                  focusRequested={accordion.focusId === item.id}
                  focusField={accordion.focusField}
                  onFocused={accordion.clearFocus}
                >
                  {linked && (
                    <p className="flex items-center gap-1.5 rounded-lg bg-primary/5 px-2.5 py-1.5 text-[13px] text-primary">
                      <Link2 className="h-3.5 w-3.5" /> Grouped with your previous role at {item.company} on the CV
                    </p>
                  )}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Job title" required>
                      {(p) => <Input {...p} value={item.role} onChange={(e) => update(item.id, { role: e.target.value })} placeholder="e.g. Product Designer" />}
                    </Field>
                    <Field label="Company" required>
                      {(p) => <Input {...p} value={item.company} onChange={(e) => update(item.id, { company: e.target.value })} placeholder="e.g. Stripe" />}
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Start date">
                      {(p) => <MonthYearPicker id={p.id} label="Start date" value={item.startDate} onChange={(v) => update(item.id, { startDate: v })} />}
                    </Field>
                    <Field label="End date" error={!dates.isValid ? dates.message : undefined}>
                      {(p) =>
                        item.current ? (
                          <div className="flex h-9 items-center rounded-xl bg-surface-2 px-3 text-sm font-medium text-fg-secondary">Present</div>
                        ) : (
                          <MonthYearPicker id={p.id} label="End date" value={item.endDate} onChange={(v) => update(item.id, { endDate: v })} />
                        )
                      }
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2">
                    <Field label="Location">
                      {(p) => <Input {...p} value={item.location} onChange={(e) => update(item.id, { location: e.target.value })} placeholder="e.g. Remote or Berlin, DE" />}
                    </Field>
                    <Checkbox
                      className="h-9"
                      checked={item.current}
                      onCheckedChange={(current) => update(item.id, { current })}
                      label="I currently work here"
                    />
                  </div>

                  <div className="space-y-2 border-t border-line pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-medium text-fg-secondary">Achievements</p>
                      <Button variant="ghost" size="sm" onClick={() => updateBullets(item.id, (b) => [...b, ""])} className="text-primary hover:text-primary">
                        <Plus className="h-3.5 w-3.5" /> Add bullet
                      </Button>
                    </div>
                    <p className="text-xs text-fg-subtle">Start with a verb, add a number: “Cut onboarding time by 40% by…”</p>
                    <ul className="space-y-2">
                      <AnimatePresence initial={false}>
                        {(item.bullets || []).map((bullet, bIdx) => (
                          <motion.li
                            key={bIdx}
                            layout="position"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            data-bullet-index={bIdx}
                            className="flex items-start gap-2"
                          >
                            <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-fg-subtle" aria-hidden />
                            <Textarea
                              rows={1}
                              value={bullet}
                              aria-label={`Achievement ${bIdx + 1}`}
                              onChange={(e) => updateBullets(item.id, (b) => b.map((x, i) => (i === bIdx ? e.target.value : x)))}
                              onKeyDown={(e) => {
                                // Enter adds the next bullet; Shift+Enter keeps a line break
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  updateBullets(item.id, (b) => {
                                    b.splice(bIdx + 1, 0, "");
                                    return b;
                                  });
                                  window.setTimeout(() => {
                                    const next = (e.target as HTMLElement).closest("ul")?.querySelectorAll("textarea")[bIdx + 1];
                                    next?.focus();
                                  }, 30);
                                }
                              }}
                              placeholder="Led the redesign of checkout, lifting conversion by 18%"
                              className="min-h-[38px]"
                            />
                            <IconButton
                              label={`Remove achievement ${bIdx + 1}`}
                              onClick={() => updateBullets(item.id, (b) => b.filter((_, i) => i !== bIdx))}
                              className="mt-[3px] hover:bg-danger/10 hover:text-danger"
                            >
                              <X className="h-4 w-4" />
                            </IconButton>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  </div>
                </ItemCard>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

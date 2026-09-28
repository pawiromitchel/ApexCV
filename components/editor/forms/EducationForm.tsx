"use client";

import React from "react";
import { AnimatePresence } from "motion/react";
import { GraduationCap, Plus } from "lucide-react";
import { EducationItem } from "@/lib/types";
import { validateEducationDates, formatMonthYear } from "@/lib/dateValidation";
import { Input } from "@/components/ui/Input";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { MonthYearPicker } from "@/components/ui/MonthYearPicker";
import { ItemCard, SectionHeader } from "../ItemCard";
import { useItemAccordion } from "../EditorContext";
import { moveItem, newId } from "./listUtils";

interface EducationFormProps {
  education: EducationItem[];
  onChange: (education: EducationItem[]) => void;
}

export function EducationForm({ education, onChange }: EducationFormProps) {
  const accordion = useItemAccordion(education);
  const update = (id: string, patch: Partial<EducationItem>) =>
    onChange(education.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const add = () => {
    const id = newId("edu");
    onChange([...education, { id, degree: "", institution: "", location: "", startDate: "", endDate: "", gpa: "", honors: "", visible: true }]);
    accordion.openAndFocus(id);
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Education"
        description="Degrees, diplomas, bootcamps, and relevant courses."
        actions={
          <Button variant="outline" size="sm" onClick={add}>
            <Plus className="h-3.5 w-3.5" /> Add education
          </Button>
        }
      />

      {education.length === 0 ? (
        <EmptyState
          icon={<GraduationCap />}
          title="No education yet"
          description="Add your highest or most relevant qualification first."
          action={
            <Button variant="primary" onClick={add}>
              <Plus className="h-4 w-4" /> Add education
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {education.map((item, index) => {
              const dates = validateEducationDates(item.startDate, item.endDate);
              const end = formatMonthYear(item.endDate);
              return (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  index={index}
                  total={education.length}
                  noun="education entry"
                  title={item.degree || "Untitled degree"}
                  subtitle={[item.institution, end].filter(Boolean).join(" · ") || "Add school and dates"}
                  hidden={item.visible === false}
                  open={accordion.isOpen(item.id)}
                  onToggle={() => accordion.toggle(item.id)}
                  onMove={(dir) => onChange(moveItem(education, index, dir))}
                  onToggleHidden={() => update(item.id, { visible: item.visible === false })}
                  onDelete={() => onChange(education.filter((e) => e.id !== item.id))}
                  focusRequested={accordion.focusId === item.id}
                  focusField={accordion.focusField}
                  onFocused={accordion.clearFocus}
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Degree or field of study" required>
                      {(p) => <Input {...p} value={item.degree} onChange={(e) => update(item.id, { degree: e.target.value })} placeholder="e.g. BSc Computer Science" />}
                    </Field>
                    <Field label="School" required>
                      {(p) => <Input {...p} value={item.institution} onChange={(e) => update(item.id, { institution: e.target.value })} placeholder="e.g. University of Amsterdam" />}
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Start date">
                      {(p) => <MonthYearPicker id={p.id} label="Start date" value={item.startDate} onChange={(v) => update(item.id, { startDate: v })} />}
                    </Field>
                    <Field label="Graduation date" error={!dates.isValid ? dates.message : undefined}>
                      {(p) => <MonthYearPicker id={p.id} label="Graduation date" value={item.endDate} onChange={(v) => update(item.id, { endDate: v })} />}
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Field label="Location">
                      {(p) => <Input {...p} value={item.location} onChange={(e) => update(item.id, { location: e.target.value })} placeholder="City" />}
                    </Field>
                    <Field label="Grade / GPA">
                      {(p) => <Input {...p} value={item.gpa || ""} onChange={(e) => update(item.id, { gpa: e.target.value })} placeholder="Optional" />}
                    </Field>
                    <Field label="Honours">
                      {(p) => <Input {...p} value={item.honors || ""} onChange={(e) => update(item.id, { honors: e.target.value })} placeholder="Optional" />}
                    </Field>
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

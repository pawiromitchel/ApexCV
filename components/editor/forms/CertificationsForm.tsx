"use client";

import React from "react";
import { AnimatePresence } from "motion/react";
import { Award, Plus } from "lucide-react";
import { CertificationItem } from "@/lib/types";
import { validateCertificationYear, formatMonthYear } from "@/lib/dateValidation";
import { Input } from "@/components/ui/Input";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { MonthYearPicker } from "@/components/ui/MonthYearPicker";
import { ItemCard, SectionHeader } from "../ItemCard";
import { useItemAccordion } from "../EditorContext";
import { moveItem, newId } from "./listUtils";

interface CertificationsFormProps {
  certifications: CertificationItem[];
  onChange: (certifications: CertificationItem[]) => void;
}

export function CertificationsForm({ certifications, onChange }: CertificationsFormProps) {
  const accordion = useItemAccordion(certifications);
  const update = (id: string, patch: Partial<CertificationItem>) =>
    onChange(certifications.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const add = () => {
    const id = newId("cert");
    onChange([...certifications, { id, name: "", issuer: "", date: "", url: "", visible: true }]);
    accordion.openAndFocus(id);
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Certifications"
        description="Licences, certificates, and awards."
        actions={
          <Button variant="outline" size="sm" onClick={add}>
            <Plus className="h-3.5 w-3.5" /> Add certification
          </Button>
        }
      />

      {certifications.length === 0 ? (
        <EmptyState
          icon={<Award />}
          title="No certifications yet"
          action={
            <Button variant="primary" onClick={add}>
              <Plus className="h-4 w-4" /> Add a certification
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {certifications.map((item, index) => {
              const dateCheck = item.date ? validateCertificationYear(item.date) : { isValid: true, message: "" };
              return (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  index={index}
                  total={certifications.length}
                  noun="certification"
                  title={item.name || "Untitled certification"}
                  subtitle={[item.issuer, formatMonthYear(item.date)].filter(Boolean).join(" · ") || "Add issuer and date"}
                  hidden={item.visible === false}
                  open={accordion.isOpen(item.id)}
                  onToggle={() => accordion.toggle(item.id)}
                  onMove={(dir) => onChange(moveItem(certifications, index, dir))}
                  onToggleHidden={() => update(item.id, { visible: item.visible === false })}
                  onDelete={() => onChange(certifications.filter((c) => c.id !== item.id))}
                  focusRequested={accordion.focusId === item.id}
                  focusField={accordion.focusField}
                  onFocused={accordion.clearFocus}
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Name" required error={!item.name?.trim() && item.issuer?.trim() ? "Needed for it to appear on your CV" : undefined}>
                      {(p) => <Input {...p} value={item.name} onChange={(e) => update(item.id, { name: e.target.value })} placeholder="e.g. Google UX Design Certificate" />}
                    </Field>
                    <Field label="Issued by">
                      {(p) => <Input {...p} value={item.issuer} onChange={(e) => update(item.id, { issuer: e.target.value })} placeholder="e.g. Coursera" />}
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Date" error={!dateCheck.isValid ? dateCheck.message : undefined}>
                      {(p) => <MonthYearPicker id={p.id} label="Date" value={item.date} onChange={(v) => update(item.id, { date: v })} />}
                    </Field>
                    <Field label="Verification link">
                      {(p) => <Input {...p} type="url" value={item.url || ""} onChange={(e) => update(item.id, { url: e.target.value })} placeholder="https://… (optional)" />}
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

"use client";

import React from "react";
import { Reorder, useDragControls } from "motion/react";
import { ChevronDown, ChevronUp, Eye, EyeOff, GripVertical, ListOrdered, Lock } from "lucide-react";
import { ResumeData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Button, IconButton } from "@/components/ui/Button";
import { sectionIcon, sectionLabel, SECTION_META } from "./sections";

interface OrganizeModalProps {
  open: boolean;
  onClose: () => void;
  data: ResumeData;
  onReorder: (order: string[]) => void;
  onToggleHidden: (key: string) => void;
  onSelect: (key: string) => void;
}

export function OrganizeModal({ open, onClose, data, onReorder, onToggleHidden, onSelect }: OrganizeModalProps) {
  const order = data.sectionOrder;
  const move = (index: number, dir: -1 | 1) => {
    const next = [...order];
    const [item] = next.splice(index, 1);
    next.splice(index + dir, 0, item);
    onReorder(next);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<ListOrdered />}
      title="Organise sections"
      description="Drag to reorder how sections appear on your CV. Hidden sections keep their content."
      footer={
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-line px-3 py-2.5 text-sm text-fg-muted">
          <Lock className="h-4 w-4 text-fg-subtle" />
          <span className="flex-1">{SECTION_META.personal.label}</span>
          <span className="text-xs text-fg-subtle">Always at the top</span>
        </div>

        <Reorder.Group axis="y" values={order} onReorder={onReorder} className="space-y-1.5">
          {order.map((key, index) => (
            <OrganizeRow
              key={key}
              sectionKey={key}
              label={sectionLabel(key, data)}
              index={index}
              total={order.length}
              hidden={!!data.hiddenSections?.includes(key)}
              onMove={(dir) => move(index, dir)}
              onToggleHidden={() => onToggleHidden(key)}
              onSelect={() => {
                onSelect(key);
                onClose();
              }}
            />
          ))}
        </Reorder.Group>
      </div>
    </Modal>
  );
}

function OrganizeRow({
  sectionKey,
  label,
  index,
  total,
  hidden,
  onMove,
  onToggleHidden,
  onSelect,
}: {
  sectionKey: string;
  label: string;
  index: number;
  total: number;
  hidden: boolean;
  onMove: (dir: -1 | 1) => void;
  onToggleHidden: () => void;
  onSelect: () => void;
}) {
  const controls = useDragControls();
  const Icon = sectionIcon(sectionKey);

  return (
    <Reorder.Item
      value={sectionKey}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ scale: 1.02, boxShadow: "0 12px 32px -8px rgba(0,0,0,0.3)", zIndex: 10 }}
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      className={cn(
        "relative flex items-center gap-2 rounded-xl border border-line bg-surface px-2 py-1.5",
        hidden && "bg-surface-2/60"
      )}
    >
      <button
        type="button"
        aria-label={`Drag to reorder ${label}`}
        onPointerDown={(e) => controls.start(e)}
        className="flex h-8 w-6 cursor-grab touch-none items-center justify-center rounded-md text-fg-subtle hover:text-fg-muted active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onSelect}
        className={cn("flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-1 py-1 text-left text-sm font-medium hover:text-primary", hidden ? "text-fg-subtle" : "text-fg")}
      >
        <Icon className="h-4 w-4 shrink-0 text-fg-muted" />
        <span className={cn("truncate", hidden && "line-through")}>{label}</span>
      </button>
      <div className="flex shrink-0 items-center">
        <IconButton label={hidden ? "Show section" : "Hide section"} onClick={onToggleHidden}>
          {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </IconButton>
        <IconButton label="Move section up" disabled={index === 0} onClick={() => onMove(-1)}>
          <ChevronUp className="h-4 w-4" />
        </IconButton>
        <IconButton label="Move section down" disabled={index === total - 1} onClick={() => onMove(1)}>
          <ChevronDown className="h-4 w-4" />
        </IconButton>
      </div>
    </Reorder.Item>
  );
}

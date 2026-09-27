"use client";

import React from "react";
import { parseYearMonth } from "@/lib/dateValidation";
import { Select } from "./Select";
import { cn } from "@/lib/utils";

interface MonthYearPickerProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  className?: string;
  /** Accessible label prefix, e.g. "Start date". */
  label?: string;
  id?: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1970 + 6 }, (_, i) => currentYear + 5 - i);

export function MonthYearPicker({ value, onChange, disabled = false, className, label = "Date", id }: MonthYearPickerProps) {
  const parsed = parseYearMonth(value);
  const selectedYear = parsed ? String(parsed.year) : "";
  // A bare year ("2021") has no month; parseYearMonth reports it as January
  const yearOnly = /^\d{4}$/.test((value || "").trim());
  const selectedMonth = parsed && !yearOnly ? String(parsed.month).padStart(2, "0") : "";

  return (
    <div className={cn("grid grid-cols-[1fr_1.15fr] gap-1.5", className)}>
      <Select
        id={id}
        aria-label={`${label} month`}
        disabled={disabled}
        value={selectedMonth}
        onChange={(e) => {
          const month = e.target.value;
          if (!month) return onChange(selectedYear);
          onChange(`${selectedYear || currentYear}-${month}`);
        }}
      >
        <option value="">Month</option>
        {MONTHS.map((m, i) => (
          <option key={m} value={String(i + 1).padStart(2, "0")}>
            {m}
          </option>
        ))}
      </Select>
      <Select
        aria-label={`${label} year`}
        disabled={disabled}
        value={selectedYear}
        onChange={(e) => {
          const year = e.target.value;
          if (!year) return onChange("");
          onChange(selectedMonth ? `${year}-${selectedMonth}` : year);
        }}
      >
        <option value="">Year</option>
        {YEARS.map((yr) => (
          <option key={yr} value={String(yr)}>
            {yr}
          </option>
        ))}
      </Select>
    </div>
  );
}

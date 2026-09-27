/**
 * ApexCV - Date Validation Helpers
 * Validates chronological consistency for education, experience, and certification dates.
 */

export interface DateValidationResult {
  isValid: boolean;
  message?: string;
  isFuture?: boolean;
  isReversed?: boolean;
}

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Extracts a numeric year and month from diverse date formats:
 * - "2023" -> { year: 2023, month: 1 }
 * - "2023-09" -> { year: 2023, month: 9 }
 * - "09/2023" -> { year: 2023, month: 9 }
 * - "Sep 2023" -> { year: 2023, month: 9 }
 */
export function parseYearMonth(dateStr: string): { year: number; month: number } | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // 1. Direct 4-digit year e.g. "2023"
  const pureYearMatch = trimmed.match(/^(\d{4})$/);
  if (pureYearMatch) {
    return { year: parseInt(pureYearMatch[1], 10), month: 1 };
  }

  // 2. YYYY-MM or YYYY/MM e.g. "2023-09"
  const yyyyMmMatch = trimmed.match(/^(\d{4})[-/](0?[1-9]|1[0-2])$/);
  if (yyyyMmMatch) {
    return { year: parseInt(yyyyMmMatch[1], 10), month: parseInt(yyyyMmMatch[2], 10) };
  }

  // 3. MM/YYYY or MM-YYYY e.g. "09/2023"
  const mmYyyyMatch = trimmed.match(/^(0?[1-9]|1[0-2])[-/](\d{4})$/);
  if (mmYyyyMatch) {
    return { year: parseInt(mmYyyyMatch[2], 10), month: parseInt(mmYyyyMatch[1], 10) };
  }

  // 4. Word month + year e.g. "September 2023" or "Sep 2023"
  const monthNames = [
    "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec"
  ];
  const wordMonthMatch = trimmed.match(/([a-zA-Z]{3,})\.?\s+(\d{4})/i);
  if (wordMonthMatch) {
    const monthPrefix = wordMonthMatch[1].toLowerCase().slice(0, 3);
    const mIdx = monthNames.indexOf(monthPrefix);
    return {
      year: parseInt(wordMonthMatch[2], 10),
      month: mIdx >= 0 ? mIdx + 1 : 1,
    };
  }

  // 5. Fallback: extract any 4-digit number between 1900 and 2100
  const anyYearMatch = trimmed.match(/\b(19\d{2}|20\d{2})\b/);
  if (anyYearMatch) {
    return { year: parseInt(anyYearMatch[1], 10), month: 1 };
  }

  return null;
}

/**
 * Validates a date range between start and end date
 */
export function validateDateRange(
  startDateStr: string,
  endDateStr: string,
  isCurrent?: boolean
): DateValidationResult {
  const start = parseYearMonth(startDateStr);
  const end = parseYearMonth(endDateStr);

  // 1. Check if start date is in the future
  if (start && start.year > CURRENT_YEAR + 1) {
    return {
      isValid: false,
      isFuture: true,
      message: `Start date (${start.year}) cannot be in the future.`,
    };
  }

  // If currently active position, end date validation is bypassed
  if (isCurrent) {
    return { isValid: true };
  }

  // 2. Check if end date is earlier than start date
  if (start && end) {
    if (end.year < start.year || (end.year === start.year && end.month < start.month)) {
      return {
        isValid: false,
        isReversed: true,
        message: `End date cannot be earlier than start date (${startDateStr} — ${endDateStr}).`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Validates a certification received year (cannot be in the future)
 */
export function validateCertificationYear(dateStr: string): DateValidationResult {
  if (!dateStr || !dateStr.trim()) return { isValid: true };
  const parsed = parseYearMonth(dateStr);
  if (!parsed) return { isValid: true };

  if (parsed.year > CURRENT_YEAR) {
    return {
      isValid: false,
      isFuture: true,
      message: `Year received (${parsed.year}) cannot be in the future.`,
    };
  }

  return { isValid: true };
}

/**
 * Validates education dates (graduation cannot be before start date, start cannot be far future)
 */
export function validateEducationDates(
  startDateStr: string,
  gradDateStr: string
): DateValidationResult {
  const start = parseYearMonth(startDateStr);
  const grad = parseYearMonth(gradDateStr);

  if (start && start.year > CURRENT_YEAR + 1) {
    return {
      isValid: false,
      isFuture: true,
      message: `Start date (${start.year}) cannot be in the future.`,
    };
  }

  if (start && grad) {
    if (grad.year < start.year || (grad.year === start.year && grad.month < start.month)) {
      return {
        isValid: false,
        isReversed: true,
        message: `Graduation date cannot be earlier than start date (${startDateStr} — ${gradDateStr}).`,
      };
    }
  }

  if (grad && grad.year > CURRENT_YEAR + 8) {
    return {
      isValid: false,
      isFuture: true,
      message: `Graduation date (${grad.year}) seems unusually far in the future.`,
    };
  }

  return { isValid: true };
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

/**
 * Normalizes any date string (e.g. "2023-08", "08/2023", "Aug 2023", "2023") into "MMM YYYY" or "YYYY".
 * Returns raw string if unable to parse.
 */
export function formatMonthYear(dateStr: string): string {
  if (!dateStr || !dateStr.trim()) return "";
  const trimmed = dateStr.trim();
  if (trimmed.toLowerCase() === "present") return "Present";

  const parsed = parseYearMonth(trimmed);
  if (!parsed) return trimmed;

  // Check if user specifically only entered a 4 digit year
  if (/^\d{4}$/.test(trimmed)) {
    return `${parsed.year}`;
  }

  const monthName = MONTH_NAMES[parsed.month - 1] || "";
  return `${monthName} ${parsed.year}`;
}

/**
 * Compare two dates for descending (reverse-chronological) sort.
 * Treats "present" or current items as the most recent (infinity).
 */
export function compareDatesDescending(
  dateA?: string,
  isCurrentA?: boolean,
  dateB?: string,
  isCurrentB?: boolean
): number {
  if (isCurrentA && !isCurrentB) return -1;
  if (!isCurrentA && isCurrentB) return 1;

  const parsedA = dateA ? parseYearMonth(dateA) : null;
  const parsedB = dateB ? parseYearMonth(dateB) : null;

  if (!parsedA && !parsedB) return 0;
  if (!parsedA) return 1;
  if (!parsedB) return -1;

  const valueA = parsedA.year * 100 + parsedA.month;
  const valueB = parsedB.year * 100 + parsedB.month;

  return valueB - valueA;
}

import { ExperienceItem } from "./types";
import { formatMonthYear, parseYearMonth } from "./dateValidation";

export interface ExperienceGroup {
  company: string;
  location?: string;
  overallDate?: string;
  items: ExperienceItem[];
  isGrouped: boolean;
}

/**
 * Groups consecutive experience entries that belong to the same company.
 * Case-insensitive comparison with whitespace trimmed.
 */
export function groupExperiences(experiences: ExperienceItem[]): ExperienceGroup[] {
  if (!experiences || experiences.length === 0) return [];

  const groups: ExperienceGroup[] = [];

  for (const exp of experiences) {
    const rawCompany = (exp.company || "").trim();
    const normalizedCompany = rawCompany.toLowerCase();
    const lastGroup = groups[groups.length - 1];
    const lastGroupNormalized = lastGroup ? lastGroup.company.trim().toLowerCase() : null;

    if (
      lastGroup &&
      normalizedCompany &&
      lastGroupNormalized === normalizedCompany
    ) {
      lastGroup.items.push(exp);
      if (!lastGroup.location && exp.location) {
        lastGroup.location = exp.location;
      }
    } else {
      groups.push({
        company: rawCompany || "Company",
        location: exp.location,
        items: [exp],
        isGrouped: false,
      });
    }
  }

  // Calculate overall date range for grouped roles (total cumulative tenure)
  for (const group of groups) {
    if (group.items.length > 1) {
      group.isGrouped = true;

      const hasCurrent = group.items.some((item) => item.current);
      
      // Calculate earliest start date across all items in group
      let earliestDateStr: string = "";
      let minVal = Infinity;
      for (const item of group.items) {
        const startVal = item.startDate ? parseYearMonth(item.startDate) : null;
        if (startVal) {
          const num = startVal.year * 100 + startVal.month;
          if (num < minVal) {
            minVal = num;
            earliestDateStr = item.startDate;
          }
        } else if (!earliestDateStr && item.startDate) {
          earliestDateStr = item.startDate;
        }
      }

      // Calculate latest end date across all items in group
      let latestDateStr: string = "";
      let maxVal = -Infinity;
      if (!hasCurrent) {
        for (const item of group.items) {
          const candidate = item.endDate || item.startDate;
          const endVal = candidate ? parseYearMonth(candidate) : null;
          if (endVal) {
            const num = endVal.year * 100 + endVal.month;
            if (num > maxVal) {
              maxVal = num;
              latestDateStr = candidate;
            }
          } else if (!latestDateStr && candidate) {
            latestDateStr = candidate;
          }
        }
      }

      const earliestStart = formatMonthYear(earliestDateStr || group.items[group.items.length - 1].startDate || "");
      const latestEnd = hasCurrent ? "Present" : formatMonthYear(latestDateStr || group.items[0].endDate || group.items[0].startDate || "");

      if (earliestStart && latestEnd) {
        group.overallDate =
          earliestStart === latestEnd
            ? earliestStart
            : `${earliestStart} – ${latestEnd}`;
      } else if (latestEnd) {
        group.overallDate = latestEnd;
      } else if (earliestStart) {
        group.overallDate = earliestStart;
      }
    }
  }

  return groups;
}

/**
 * Checks if the item at index has the same company as the previous item.
 */
export function isLinkedToPrevious(
  experiences: ExperienceItem[],
  index: number
): boolean {
  if (index <= 0 || index >= experiences.length) return false;
  const currentCompany = (experiences[index].company || "").trim().toLowerCase();
  const prevCompany = (experiences[index - 1].company || "").trim().toLowerCase();
  return Boolean(currentCompany && prevCompany && currentCompany === prevCompany);
}

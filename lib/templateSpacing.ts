import { SpacingScale } from "./types";

export interface SpacingStyles {
  containerPadding: string;
  sectionGap: string;
  itemGap: string;
  headerMargin: string;
  sectionHeaderMargin: string;
}

export function getSpacingStyles(
  spacing: SpacingScale = "standard",
  documentMargins: SpacingScale = "standard"
): SpacingStyles {
  const getContainerPadding = () => {
    switch (documentMargins) {
      case "compact": return "p-6 sm:p-7";
      case "spacious": return "p-10 sm:p-12";
      case "standard": default: return "p-8 sm:p-10";
    }
  };

  switch (spacing) {
    case "compact":
      return {
        containerPadding: getContainerPadding(),
        sectionGap: "space-y-4",
        itemGap: "space-y-1.5",
        headerMargin: "pb-3.5 mb-3.5",
        sectionHeaderMargin: "mb-2",
      };
    case "spacious":
      return {
        containerPadding: getContainerPadding(),
        sectionGap: "space-y-8",
        itemGap: "space-y-4",
        headerMargin: "pb-6 mb-6",
        sectionHeaderMargin: "mb-4",
      };
    case "standard":
    default:
      return {
        containerPadding: getContainerPadding(),
        sectionGap: "space-y-6",
        itemGap: "space-y-3",
        headerMargin: "pb-5 mb-5",
        sectionHeaderMargin: "mb-3",
      };
  }
}

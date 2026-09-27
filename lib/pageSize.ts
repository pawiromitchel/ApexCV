import { PageSize } from "./types";

/** Physical paper sizes. Pixel values are CSS px at 96 dpi. */
export const PAGE_SIZES: Record<PageSize, { label: string; width: string; height: string; widthPx: number; heightPx: number; css: string }> = {
  a4: { label: "A4", width: "210mm", height: "297mm", widthPx: 793.7, heightPx: 1122.5, css: "A4" },
  letter: { label: "US Letter", width: "8.5in", height: "11in", widthPx: 816, heightPx: 1056, css: "letter" },
};

export function pageSizeOf(size?: PageSize) {
  return PAGE_SIZES[size ?? "a4"];
}

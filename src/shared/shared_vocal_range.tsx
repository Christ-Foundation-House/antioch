import { typeSharedFilters } from "./shared_types";

export const shared_vocal_range = [
  { value: "dont_know", label: "Don't Know" },
  { value: "e2-e4", label: "Bass (E2-E4)" },
  { value: "a2-a4", label: "Baritone (A2-A4)" },
  { value: "c3-c5", label: "Tenor (C3-C5)" },
  { value: "f3-f5", label: "Alto (F3-F5)" },
  { value: "c", label: "Mezzo soprano (c)" },
  { value: "c4-c6", label: "Soprano (C4-C6)" },
];
export function shared_vocal_range_returnLabel(value: string) {
  const item = shared_vocal_range.find((i) => i.value === value);
  return item ? item.label : null;
}

export const shared_vocal_range_filters: typeSharedFilters[] = [];
shared_vocal_range.map((item) => {
  shared_vocal_range_filters.push({
    text: item.label,
    value: item.value,
  });
});

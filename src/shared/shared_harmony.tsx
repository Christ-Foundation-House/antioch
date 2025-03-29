import { typeSharedFilters } from "./shared_types";

export const shared_harmony = [
  { value: "dont_know", label: "Don't Know" },
  { value: "soprano", label: "Soprano" },
  { value: "alto", label: "Alto" },
  { value: "tenor", label: "Tenor" },
  { value: "bass", label: "Bass" },
];
export function shared_harmony_returnLabel(value: string) {
  const item = shared_harmony.find((i) => i.value === value);
  return item ? item.label : null;
}

export const shared_harmony_options = shared_harmony;
export const shared_harmony_filters: typeSharedFilters[] = [];
shared_harmony.map((item) => {
  shared_harmony_filters.push({
    text: item.label,
    value: item.value,
  });
});

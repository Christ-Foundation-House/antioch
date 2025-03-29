import { typeSharedFilters } from "./shared_types";

export const shared_frequency = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "sometimes", label: "Sometimes" },
  { value: "rarely", label: "Rarely" },
  { value: "never", label: "Never" },
];
export function shared_frequency_returnLabel(value: string) {
  const item = shared_frequency.find((i) => i.value === value);
  return item ? item.label : null;
}
export const shared_frequency_options = shared_frequency;
export const shared_frequency_filters: typeSharedFilters[] = [];
shared_frequency.map((item) => {
  shared_frequency_filters.push({
    text: item.label,
    value: item.value,
  });
});

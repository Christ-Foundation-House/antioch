import { typeSharedFilters } from "./shared_types";

export const shared_marital_status = [
  { value: "single", label: "Single" },
  { value: "in_relationship", label: "In a relationship" },
  { value: "engaged", label: "Engaged" },
  { value: "married", label: "Married" },
  { value: "other", label: "Other" },
];
export function shared_marital_status_returnLabel(value: string) {
  const item = shared_marital_status.find((i) => i.value === value);
  return item ? item.label : null;
}
export const shared_marital_status_options = shared_marital_status;
export const shared_marital_status_filters: typeSharedFilters[] = [];
shared_marital_status.map((item) => {
  shared_marital_status_filters.push({
    text: item.label,
    value: item.value,
  });
});

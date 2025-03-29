import { typeSharedFilters } from "./shared_types";

export interface typeSharedOccupation {
  value: "student" | "worker" | "business" | "visiting" | "other";
  label: string;
}
export const shared_occupation: typeSharedOccupation[] = [
  { value: "student", label: "Studying" },
  { value: "worker", label: "Working" },
  { value: "business", label: "Business" },
  { value: "visiting", label: "Visiting" },
  // { value: "other", label: "Other" },
];
export function shared_occupation_returnLabel(value: string) {
  const item = shared_occupation.find((i) => i.value === value);
  return item ? item.label : null;
}
export const shared_occupation_options = shared_occupation;
export const shared_occupation_filters: typeSharedFilters[] = [];
shared_occupation.map((item) => {
  shared_occupation_filters.push({
    text: item.label,
    value: item.value,
  });
});

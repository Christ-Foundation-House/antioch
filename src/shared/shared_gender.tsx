import { typeSharedFilters } from "./shared_types";

export const shared_gender = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];
export function shared_gender_returnLabel(value: string) {
  const item = shared_gender.find((i) => i.value === value);
  return item ? item.label : null;
}
export const shared_gender_options = shared_gender;
export const shared_gender_filters: typeSharedFilters[] = [];
shared_gender.map((item) => {
  shared_gender_filters.push({
    text: item.label,
    value: item.value,
  });
});

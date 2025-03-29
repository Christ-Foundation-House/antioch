import { typeSharedFilters } from "./shared_types";

export const shared_study_level = [
  { value: "bachelors", label: "Bachelors" },
  { value: "masters", label: "Masters" },
  { value: "phd", label: "PhD" },
  { value: "post_doc", label: "Post Doc" },
  // { value: "other", label: "Other" },
];
export function shared_study_level_returnLabel(value: string) {
  const item = shared_study_level.find((i) => i.value === value);
  return item ? item.label : null;
}
export const shared_study_level_options = shared_study_level;
export const shared_study_level_filters: typeSharedFilters[] = [];
shared_study_level.map((item) => {
  shared_study_level_filters.push({
    text: item.label,
    value: item.value,
  });
});

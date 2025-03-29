import { typeSharedFilters } from "./shared_types";

export const shared_bible_study_group = [
  { value: "none", label: "None" },
  { value: "ligong", label: "Wuhan University Of Technology" },
  { value: "huashi", label: "Central China Normal University" },
  { value: "virology", label: "Wuhan Institute Of Virology" },
  { value: "wust_qingshan", label: "WUST Qingshan Campus" },
  { value: "textile", label: "Wuhan Textile University" },
  { value: "hust", label: "Huazhong University Of Science And Technology" },
  { value: "botanical", label: "Wuhan Botanical Garden" },
  { value: "tongji", label: "Tongji Medical College" },
  { value: "online", label: "Online Bible Study" },
  // { value: "other", label: "Other" },
];
export function shared_bible_study_group_returnLabel(value: string) {
  const item = shared_bible_study_group.find((i) => i.value === value);
  return item ? item.label : null;
}
export const shared_bible_study_group_options = shared_bible_study_group;
export const shared_bible_study_group_filters: typeSharedFilters[] = [];
shared_bible_study_group.map((item) => {
  shared_bible_study_group_filters.push({
    text: item.label,
    value: item.value,
  });
});

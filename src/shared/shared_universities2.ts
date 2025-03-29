import { typeSharedFilters, typeSharedOptions } from "./shared_types";

interface TypeSharedUniversity {
  value: string;
  label: string;
}

export const shared_universities2: TypeSharedUniversity[] = [
  // { value: "other", label: "Other" },
  {
    value: "beijing_university_of_chinese_medicine",
    label: "Beijing University Of Chinese Medicine",
  },
  {
    value: "china_university_of_geosciences",
    label: "China University Of Geosciences",
  },
  {
    value: "central_china_normal_university",
    label: "Central China Normal University",
  },
  {
    value: "hubei_university",
    label: "Hubei University",
  },
  {
    value: "hubei_university_of_economics",
    label: "Hubei University Of Economics",
  },
  {
    value: "hubei_university_of_technology",
    label: "Hubei University Of Technology",
  },
  {
    value: "huazhong_university_of_science_and_technology",
    label: "Huazhong University Of Science And Technology",
  },
  { value: "jiangsu_university", label: "Jiangsu University" },
  { value: "jianghan_university", label: "Jianghan University" },
  {
    value: "naval_university_of_engineering",
    label: "Naval University Of Engineering",
  },
  { value: "wuhan_botanical_garden", label: "Wuhan Botanical Garden" },
  {
    value: "wuhan_institute_of_virology",
    label: "Wuhan Institute Of Virology",
  },
  { value: "wuhan_university", label: "Wuhan University" },
  {
    value: "wuhan_university_of_technology",
    label: "Wuhan University Of Technology (Ligong)",
  },
  {
    value: "wuhan_university_of_science_and_technology",
    label: "Wuhan University Of Science And Technology (WUST)",
  },
  { value: "wuhan_textile_university", label: "Wuhan Textile University" },
  {
    value: "wuchang_university_of_technology",
    label: "Wuchang University Of Technology",
  },
  { value: "yangtze_normal_university", label: "Yangtze Normal University" },
  {
    value: "zhongnan_university_of_economics_and_law",
    label: "Zhongnan University Of Economics And Law",
  },
  { value: "tongji_medical_college", label: "Tongji Medical College" },
];

export function shared_universities2_returnLabel(value: string) {
  const item = shared_universities2.find((i) => i.value === value);
  return item ? item.label : null;
}

export const shared_universities2_options: typeSharedOptions[] =
  shared_universities2;

export const shared_universities2_filters: typeSharedFilters[] = [];
shared_universities2.map((item) => {
  shared_universities2_filters.push({
    text: item.label,
    value: item.value,
  });
});

export default shared_universities2;

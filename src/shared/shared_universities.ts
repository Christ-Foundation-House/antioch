import { typeSharedFilters, typeSharedOptions } from "./shared_types";

interface type_shared_university {
  name: string;
}
export const shared_universities: type_shared_university[] = [
  { name: "Other" },
  { name: "Beijing University Of Chinese Medicine" },

  { name: "China University Of Geosciences" },
  { name: "Central China Normal University" },

  { name: "Hubei University Of Economics" },
  { name: "Hubei University Of Technology" },
  { name: "Huazhong University Of Science And Technology" },

  { name: "Jiangsu University" },
  { name: "Jianghan University" },

  { name: "Naval University Of Engineering" },

  { name: "Wuhan Botanical Garden" },
  { name: "Wuhan Institute Of Virology" },
  // { name: "Wuhan Medical Campus" },
  { name: "Wuhan University" },
  { name: "Wuhan University Of Technology" },
  { name: "Wuhan University Of Science And Technology" },
  { name: "Wuhan Textile University" },
  { name: "Wuchang University Of Technology" },

  { name: "Yangtze Normal University" },

  { name: "Zhongnan University Of Economics And Law" },

  { name: "Tongji Medical College" },
];
// interface type_shared_universities_options {
//   label: string;
//   value: string;
// }
export const shared_universities_options: typeSharedOptions[] = [];
shared_universities.map((u) => {
  let university = {
    label: u.name,
    value: u.name,
  };
  shared_universities_options.push(university);
});

export const shared_universities_filters: typeSharedFilters[] = [];
shared_universities.map((u) => {
  let item = {
    text: u.name,
    value: u.name,
  };
  shared_universities_filters.push(item);
});

export default shared_universities;

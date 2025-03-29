import React from "react";
import WorshipRegistration from "@/forms/WorshipRegistration";
import { typeSharedFilters, typeSharedOptions } from "./shared_types";

interface TypeSharedMinistries {
  value: string;
  label: string;
  form_registration?: React.FC;
}

export const shared_ministries: TypeSharedMinistries[] = [
  { value: "sof", label: "Sons Of Faith(SOF)" },
  { value: "doz", label: "Daughters of Zion(DOZ)" },
  { value: "prayer", label: "Prayer" },
  { value: "media", label: "Media" },
  { value: "literature_translation", label: "Literature & Translation" },
  { value: "evangelism", label: "Evangelism" },
  { value: "bible_study", label: "Bible Study" },
  { value: "artistic", label: "Artistic" },
  { value: "organizing", label: "Organizing" },
  {
    value: "worship",
    label: "Worship",
    form_registration: WorshipRegistration,
  },
  { value: "academic", label: "Academic" },
  { value: "children", label: "Children" },
  { value: "discipleship", label: "Discipleship" },
  { value: "mc", label: "MCs" },
  { value: "preachers", label: "Preachers" },
];

export function shared_ministries_returnLabel(value: string) {
  const item = shared_ministries.find((i) => i.value === value);
  return item ? item.label : null;
}

export const shared_ministries_options: typeSharedOptions[] =
  shared_ministries.map((item) => ({
    value: item.value,
    label: item.label,
  }));

export const shared_ministries_filters: typeSharedFilters[] =
  shared_ministries.map((item) => ({
    text: item.label,
    value: item.value,
  }));

export default shared_ministries;

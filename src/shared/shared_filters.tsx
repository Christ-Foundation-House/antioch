import { typeSharedFilters } from "./shared_types";

export const shared_filters_booleans: typeSharedFilters[] = [
  {
    text: "Yes",
    value: JSON.stringify(true),
  },
  {
    text: "No",
    value: JSON.stringify(false),
  },
  {
    text: "Not Set",
    value: JSON.stringify(null),
  },
];

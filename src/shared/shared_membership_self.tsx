import { typeSharedFilters } from "./shared_types";

export const shared_membership_self = [
  { value: "yes", label: "Yes - I am a member" },
  { value: "yes_joining", label: "Yes - I am joining" },
  { value: "no_visiting", label: "No - Visiting" },
  { value: "no_considering", label: "No - But considering" },
  { value: "no_thank_you", label: "No - Thank you" },
];
export function shared_gender_returnLabel(value: string) {
  const item = shared_membership_self.find((i) => i.value === value);
  return item ? item.label : null;
}
export const shared_membership_self_options = shared_membership_self;
export const shared_membership_self_filters: typeSharedFilters[] = [];
shared_membership_self.map((item) => {
  shared_membership_self_filters.push({
    text: item.label,
    value: item.value,
  });
});

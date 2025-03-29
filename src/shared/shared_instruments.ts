import { typeSharedFilters } from "./shared_types";

export const shared_instruments = [
  { value: "accordion", label: "Accordion" },
  { value: "banjo", label: "Banjo" },
  { value: "bassguitar", label: "Bass Guitar" },
  { value: "cello", label: "Cello" },
  { value: "clarinet", label: "Clarinet" },
  { value: "drums", label: "Drums" },
  { value: "flute", label: "Flute" },
  { value: "guitar", label: "Guitar" },
  { value: "harmonica", label: "Harmonica" },
  { value: "harp", label: "Harp" },
  { value: "keyboard", label: "Keyboard" },
  { value: "mandolin", label: "Mandolin" },
  { value: "oboe", label: "Oboe" },
  { value: "piano", label: "Piano" },
  { value: "saxophone", label: "Saxophone" },
  { value: "trombone", label: "Trombone" },
  { value: "trumpet", label: "Trumpet" },
  { value: "ukulele", label: "Ukulele" },
  { value: "violin", label: "Violin" },
  { value: "xylophone", label: "Xylophone" },
];
export const shared_instruments_levels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function shared_instruments_returnLabel(value: string) {
  const item = shared_instruments.find((i) => i.value === value);
  return item ? item.label : null;
}

export const shared_instruments_filters: typeSharedFilters[] = [];
shared_instruments.map((item) => {
  shared_instruments_filters.push({
    text: item.label,
    value: item.value,
  });
});

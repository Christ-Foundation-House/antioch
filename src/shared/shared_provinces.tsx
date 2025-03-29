import { typeSharedFilters } from "./shared_types";

export const shared_provinces = [
  { value: "anhui", label: "Anhui" },
  { value: "beijing", label: "Beijing" },
  { value: "chongqing", label: "Chongqing" },
  { value: "fujian", label: "Fujian" },
  { value: "gansu", label: "Gansu" },
  { value: "guangdong", label: "Guangdong" },
  { value: "guangxi", label: "Guangxi" },
  { value: "guizhou", label: "Guizhou" },
  { value: "hainan", label: "Hainan" },
  { value: "hebei", label: "Hebei" },
  { value: "heilongjiang", label: "Heilongjiang" },
  { value: "henan", label: "Henan" },
  { value: "hongkong", label: "Hong Kong" },
  { value: "hubei", label: "Hubei" },
  { value: "hunan", label: "Hunan" },
  { value: "jiangsu", label: "Jiangsu" },
  { value: "jiangxi", label: "Jiangxi" },
  { value: "jilin", label: "Jilin" },
  { value: "liaoning", label: "Liaoning" },
  { value: "macau", label: "Macau" },
  { value: "ningxia", label: "Ningxia" },
  { value: "qinghai", label: "Qinghai" },
  { value: "shaanxi", label: "Shaanxi" },
  { value: "shandong", label: "Shandong" },
  { value: "shanghai", label: "Shanghai" },
  { value: "shanxi", label: "Shanxi" },
  { value: "sichuan", label: "Sichuan" },
  { value: "tianjin", label: "Tianjin" },
  { value: "xinjiang", label: "Xinjiang" },
  { value: "xizang", label: "Tibet" },
  { value: "yunnan", label: "Yunnan" },
  { value: "zhejiang", label: "Zhejiang" },
];

export function china_provinces_returnLabel(value: string) {
  const item = shared_provinces.find((i) => i.value === value);
  return item ? item.label : null;
}

export const shared_provinces_options = shared_provinces;

export const shared_provinces_filters: typeSharedFilters[] = [];
shared_provinces.map((item) => {
  shared_provinces_filters.push({
    text: item.label,
    value: item.value,
  });
});

import { TypeStorageItem } from "@/shared/shared_types";

export const StorageReadItem = (itemName: TypeStorageItem) => {
  try {
    const itemValue =
      typeof localStorage !== "undefined"
        ? localStorage.getItem(itemName)
        : null;
    if (itemValue === null) {
      return null;
    }
    const JsonData: [] = JSON.parse(itemValue);
    return JsonData ?? null;
  } catch (error) {
    console.log(error);
  }
  return null;
};
export const storageWriteItem = (itemName: TypeStorageItem, itemValue: any) => {
  try {
    const stringItem = JSON.stringify(itemValue);
    localStorage.setItem(itemName, stringItem);
  } catch (error) {
    console.log(error);
  }
};

export const StorageRemoveItem = (itemName: TypeStorageItem) => {
  try {
    localStorage.removeItem(itemName);
  } catch (error) {
    console.log(error);
  }
};

export const StorageWriteItem = storageWriteItem;

import { shared_countries_returnName } from "@/shared/shared_countries";
import { shared_universities2_returnLabel } from "@/shared/shared_universities2";
import { wicf_member, wicf_member_worship } from "@prisma/client";
export function tools_textToSentenceCase(str: string) {
  if (!str || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
export function tools_textToSentenceCaseSpan(str: string) {
  return <span>{tools_textToSentenceCase(str)}</span>;
}
export function tools_returnBooleanSpan(boolean) {
  return (
    <span>{boolean === true ? "Yes" : boolean == false ? "No" : null}</span>
  );
}
export function tools_valuesToJson(
  type: string,
  values: any[],
  isOneObject?: boolean,
): [] | {} {
  switch (type) {
    case "worship":
      let newArray: wicf_member_worship[] = [];
      let array: any[] = [];
      if (values && isOneObject === true) {
        array.push(values);
      } else {
        array = values ?? [];
      }
      if (!array) {
        return [];
      }

      console.log("pre-parsedValues", array);
      array.map((item: wicf_member_worship) => {
        console.log("pre-parsedValues-item", item);
        const newItem = {
          ...item,
          vocal_range: item.vocal_range ? JSON.parse(item.vocal_range) : [],
          confortable_harmony: item.confortable_harmony
            ? JSON.parse(item.confortable_harmony)
            : [],
          instruments_able_to_play: item.instruments_able_to_play
            ? JSON.parse(item.instruments_able_to_play)
            : [],
          instruments_able_to_play_level:
            item.instruments_able_to_play_level !== null
              ? JSON.parse(item.instruments_able_to_play_level)
              : {},
        };
        newArray.push(newItem);
      });
      return isOneObject ? newArray[0] : newArray;
    default:
      return values;
  }
}
export interface args_tools_valuesToString {
  type: "worship" | "wicf_members";
  values: any[];
  isOneObject?: boolean;
}
export function tools_valuesToString({
  type,
  values,
  isOneObject,
}: args_tools_valuesToString): [] | {} {
  let array: any[] = [];
  if (values && isOneObject === true) {
    array.push(values);
    // values[0] = array;
  } else {
    array = values ?? [];
  }
  switch (type) {
    case "worship":
      let newArray: wicf_member_worship[] = [];
      if (!array) {
        return [];
      }
      console.log("pre-stringValues", array);
      array.map((item: wicf_member_worship) => {
        console.log("pre-parsedValues-item", item);
        const newItem = {
          ...item,
          vocal_range: item.vocal_range
            ? JSON.stringify(item.vocal_range)
            : "[]",
          confortable_harmony: item.confortable_harmony
            ? JSON.stringify(item.confortable_harmony)
            : "[]",
          instruments_able_to_play: item.instruments_able_to_play
            ? JSON.stringify(item.instruments_able_to_play)
            : "[]",
          instruments_able_to_play_level: item.instruments_able_to_play_level
            ? JSON.stringify(item.instruments_able_to_play_level)
            : "{}",
        };
        newArray.push(newItem);
      });
      return isOneObject ? newArray[0] : newArray;
    case "wicf_members":
      let wicf_members: wicf_member[] = [];
      if (!array) {
        return [];
      }
      array.map((item: wicf_member) => {
        const newItem: wicf_member = {
          ...item,
          nationality: item?.nationality
            ? shared_countries_returnName(item.nationality) ?? item?.nationality
            : item.nationality,
          university: item?.university
            ? shared_universities2_returnLabel(item.university) ??
              item.university
            : item.university,
        };
        wicf_members.push(newItem);
      });
      return isOneObject ? wicf_members[0] : wicf_members;
      break;
    default:
      return isOneObject ? values : array;
  }
}

import { leadership_position_type } from "@prisma/client";
import { typeSharedFilters } from "./shared_types";

export const leadershipPositionLabels: Record<
  leadership_position_type,
  string
> = {
  [leadership_position_type.PRESIDENT]: "President",
  [leadership_position_type.SECRETARY]: "Secretary",
  [leadership_position_type.TREASURER]: "Treasurer",
  [leadership_position_type.LEADER_OF_MEN_MINISTRY]: "Leader of Men Ministry",
  [leadership_position_type.LEADER_OF_WOMEN_MINISTRY]:
    "Leader of Women Ministry",
  [leadership_position_type.LEADER_OF_MEDIA_MINISTRY]:
    "Leader of Media Ministry",
  [leadership_position_type.LEADER_OF_PRAYER_MINISTRY]:
    "Leader of Prayer Ministry",
  [leadership_position_type.LEADER_OF_WORSHIP_MINISTRY]:
    "Leader of Worship Ministry",
  [leadership_position_type.LEADER_OF_EVANGELISM_MINISTRY]:
    "Leader of Evangelism Ministry",
  [leadership_position_type.LEADER_OF_DISCIPLESHIP_MINISTRY]:
    "Leader of Discipleship Ministry",
  [leadership_position_type.LEADER_OF_BIBLE_STUDY_MINISTRY]:
    "Leader of Bible Study Ministry",
  [leadership_position_type.LEADER_OF_ORGANIZING_MINISTRY]:
    "Leader of Organizing Ministry",
};

export const shared_leadership_positions = Object.values(
  leadership_position_type,
);

export const shared_leadership_positions_options =
  shared_leadership_positions.map((position) => ({
    label: leadershipPositionLabels[position],
    value: position,
  }));

// console.log(shared_leadership_positions);
export const shared_leadership_positions_returnLabels =
  shared_leadership_positions_options.map((position) => position.label);
export const shared_leadership_positions_filters: typeSharedFilters[] =
  shared_leadership_positions_options.map((item) => ({
    text: item.label,
    value: item.value,
  }));

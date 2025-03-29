/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import {
  Button,
  Space,
  Table,
  Card,
  Form,
  Select,
  Tag,
  Col,
  Row,
  // Statistic,
  Input,
  Descriptions,
  // Search,
} from "antd";
const { Search } = Input;
import { useState } from "react";
import shared_ministries from "@/shared/shared_ministries";
import {
  shared_countries_options,
  shared_countries_returnName,
} from "@/shared/shared_countries";
import {
  shared_vocal_range_returnLabel,
  shared_vocal_range_filters,
} from "@/shared/shared_vocal_range";
import {
  shared_instruments_returnLabel,
  shared_instruments_filters,
} from "@/shared/shared_instruments";
import {
  shared_universities_options,
  shared_universities_filters,
} from "@/shared/shared_universities";
import {
  tools_textToSentenceCase,
  tools_returnBooleanSpan,
  tools_textToSentenceCaseSpan,
  tools_valuesToJson,
  tools_valuesToString,
} from "@/scripts/tools";
import { shared_marital_status_filters } from "@/shared/shared_marital_status";
import { shared_filters_booleans } from "@/shared/shared_filters";
import { toast } from "react-toastify";
import { Excel } from "antd-table-saveas-excel";
// import Image from "next/image";
import {
  shared_frequency_filters,
  shared_frequency_returnLabel,
} from "@/shared/shared_frequency";
import moment from "moment";
import {
  shared_harmony_returnLabel,
  shared_harmony_filters,
} from "@/shared/shared_harmony";
import LayoutDashboard from "@/layouts/layoutDashboard";
import { permissionReturnRedirectionOrProps } from "@/utils/permission";
import { getSession } from "next-auth/react";
import { TypeSession } from "@/shared/shared_types";

// const dataTemplate = [
//   {
//     key: "1",
//     name: "John Brown",
//     age: 32,
//     address: "New York No. 1 Lake Park",
//   },
//   {
//     key: "2",
//     name: "Jim Green",
//     age: 42,
//     address: "London No. 1 Lake Park",
//   },
//   {
//     key: "3",
//     name: "Joe Black",
//     age: 32,
//     address: "Sydney No. 1 Lake Park",
//   },
//   {
//     key: "4",
//     name: "Jim Red",
//     age: 32,
//     address: "London No. 2 Lake Park",
//   },
// ];
export interface TypeFilterInfo {
  name: "Joe";
  value: "Joe";
}
interface propsPage {
  k: string;
  isOpen: boolean;
}
function Page(props: propsPage) {
  const [form] = Form.useForm();
  const [filteredInfo, setFilteredInfo] = useState<any>();
  const [sortedInfo, setSortedInfo] = useState<any>({});
  const [ministry, setMinistry] = useState("all");
  const [data, setData] = useState<any[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [dataCount, setDataCount] = useState<number>();
  const [dataCurrent, setDataCurrent] = useState<any[]>([]);
  const [searchProperty, setSearchProperty] = useState("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [k, setK] = useState(props.k);
  const [isOpen, setIsOpen] = useState(props.isOpen);
  const columnsTemplate = {
    init: [
      {
        title: "Id",
        dataIndex: "id",
        key: "id",
      },
      {
        title: "First Name",
        dataIndex: "first_name",
        key: "first_name",
      },
      {
        title: "Last Name",
        dataIndex: "last_name",
        key: "last_name",
        width: "120px",
      },
      {
        title: "Nationality",
        dataIndex: "nationality",
        key: "nationality",
        width: "120px",
        // render: (code) => <span>{shared_countries_returnName(code)}</span>,
      },
    ],
    workers_training: [
      {
        title: "Id",
        dataIndex: "id",
        key: "id",
        width: "70px",
      },
      {
        title: "First Name",
        dataIndex: "first_name",
        key: "first_name",
        width: "120px",
      },
      {
        title: "Last Name",
        dataIndex: "last_name",
        key: "last_name",
        width: "120px",
      },
      {
        title: "Phone Number",
        dataIndex: "phone_number",
        key: "phone_number",
        width: "120px",
      },
      {
        title: "Is Born Again?",
        dataIndex: "is_born_again",
        key: "is_born_again",
        width: "120px",
      },
      {
        title: "Year Joined WICF",
        dataIndex: "wicf_joining_year",
        key: "wicf_joining_year",
        width: "120px",
      },
      {
        title: "Year of departure",
        dataIndex: "possible_departure_year",
        key: "possible_departure_year",
        width: "120px",
      },
      {
        title: "Mininstry",
        dataIndex: "ministry",
        key: "ministry",
        width: "120px",
      },
      {
        title: "Commitment To Attending",
        dataIndex: "commitment_to_attending",
        key: "commitment_to_attending",
        width: "120px",
      },
      {
        title: "Completion Time",
        dataIndex: "completion_time",
        key: "completion_time",
        width: "200px",
        render: (dateTime) =>
          dateTime
            ? moment(dateTime).utcOffset(8, false).format("YYYY-MM-DD_HH:MM")
            : null,
      },
    ],
    academic_summit: [
      {
        title: "Id",
        dataIndex: "id",
        key: "id",
        width: "70px",
      },
      {
        title: "Full name",
        dataIndex: "full_name",
        key: "full_name",
        width: "120px",
      },
      {
        title: "Full name",
        dataIndex: "full_name",
        key: "full_name",
        width: "120px",
      },
      {
        title: "Completion Time",
        dataIndex: "completion_time",
        key: "completion_time",
        width: "200px",
        render: (dateTime) =>
          dateTime
            ? moment(dateTime).utcOffset(8, false).format("YYYY-MM-DD_HH:MM")
            : null,
      },
    ],
    feedback: [
      {
        title: "Id",
        dataIndex: "id",
        key: "id",
        width: "70px",
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: "120px",
      },
      {
        title: "Contact",
        dataIndex: "contact",
        key: "contact",
        width: "120px",
      },
      {
        title: "Message",
        dataIndex: "message",
        key: "message",
        width: "300px",
      },
      {
        title: "Completion Time",
        dataIndex: "completion_time",
        key: "completion_time",
        width: "200px",
        render: (dateTime) =>
          dateTime
            ? moment(dateTime).utcOffset(8, false).format("YYYY-MM-DD_HH:MM")
            : null,
      },
      {
        title: "First Name",
        dataIndex: ["user", "wicf_member", "first_name"],
        key: ["user", "wicf_member", "first_name"],
        width: "120px",
      },
      {
        title: "Last Name",
        dataIndex: ["user", "wicf_member", "last_name"],
        key: ["user", "wicf_member", "last_name"],
        width: "120px",
      },
    ],
    prayer_request: [
      {
        title: "Id",
        dataIndex: "id",
        key: "id",
        width: "70px",
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: "120px",
      },
      {
        title: "Prayer Request",
        dataIndex: "request",
        key: "request",
        width: "300px",
      },
      {
        title: "Contact Info",
        dataIndex: "contact_info",
        key: "contact_info",
        width: "300px",
      },
      {
        title: "Is Addressed?",
        dataIndex: "is_addressed",
        key: "is_addressed",
        width: "120px",
        render: (bool) => tools_returnBooleanSpan(bool),
        filterSearch: true,
        filters: shared_filters_booleans,
        onFilter: (value, record) =>
          JSON.stringify(record?.is_addressed ?? "").includes(value),
      },
      {
        title: "Completion Time",
        dataIndex: "completion_time",
        key: "completion_time",
        width: "200px",
        render: (dateTime) =>
          dateTime
            ? moment(dateTime).utcOffset(8, false).format("YYYY-MM-DD_HH:MM")
            : null,
      },
      {
        title: "First Name",
        dataIndex: ["user", "wicf_member", "first_name"],
        key: ["user", "wicf_member", "first_name"],
        width: "120px",
      },
      {
        title: "Last Name",
        dataIndex: ["user", "wicf_member", "last_name"],
        key: ["user", "wicf_member", "last_name"],
        width: "120px",
      },
    ],
    summerfest: [
      {
        title: "Id",
        dataIndex: "id",
        key: "id",
        width: "70px",
      },
      {
        title: "First Name",
        dataIndex: "first_name",
        key: "first_name",
        width: "120px",
      },
      {
        title: "Last Name",
        dataIndex: "last_name",
        key: "last_name",
        width: "120px",
      },
      {
        title: "Nationality",
        dataIndex: "nationality",
        key: "nationality",
        width: "120px",
        // render: (code) => <span>{shared_countries_returnName(code)}</span>,
      },
      {
        title: "Phone Number",
        dataIndex: "phone_number",
        key: "phone_number",
        width: "120px",
      },
      {
        title: "Passport",
        dataIndex: "passport_number",
        key: "passport_number",
        width: "120px",
      },
      {
        title: "Passport Expiry",
        dataIndex: "passport_expiry_date",
        key: "passport_expiry_date",
        width: "120px",
        render: (dateTime) =>
          dateTime ? moment(dateTime).format("YYYY-MM-DD") : null,
      },
      {
        title: "Completion Time",
        dataIndex: "completion_time",
        key: "completion_time",
        width: "200px",
        render: (dateTime) =>
          dateTime
            ? moment(dateTime).utcOffset(8, false).format("YYYY-MM-DD_HH:MM")
            : null,
      },
    ],
    all: [
      {
        title: "Id",
        dataIndex: "id",
        key: "id",
        width: "70px",
      },
      {
        title: "First Name",
        dataIndex: "first_name",
        key: "first_name",
        width: "120px",
      },
      {
        title: "Last Name",
        dataIndex: "last_name",
        key: "last_name",
        width: "120px",
      },
      {
        title: "Nationality",
        dataIndex: "nationality",
        key: "nationality",
        width: "120px",
        render: (code) => <span>{shared_countries_returnName(code)}</span>,
      },
      {
        title: "Occupation",
        dataIndex: "occupation",
        key: "occupation",
        width: "120px",
      },
      {
        title: "University",
        dataIndex: "university",
        key: "university",
        width: "200px",
        filterSearch: true,
        filters: shared_universities_filters,
        onFilter: (value, record) => record?.university?.includes(value),
      },
      {
        title: "University Campus",
        dataIndex: "university_campus",
        key: "university_campus",
        width: "120px",
      },
      {
        title: "Phone Number",
        dataIndex: "phone_number",
        key: "phone_number",
        width: "120px",
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        width: "200px",
      },
      {
        title: "Wechat Id",
        dataIndex: "wechat_id",
        key: "wechat_id",
        width: "200px",
      },
      {
        title: "Requesting Salvation / Rededication",
        dataIndex: "is_requesting_salvation_rededication",
        key: "is_requesting_salvation_rededication",
        width: "120px",
        render: (bool) => tools_returnBooleanSpan(bool),
        filterSearch: true,
        filters: shared_filters_booleans,
        onFilter: (value, record) =>
          JSON.stringify(
            record?.is_requesting_salvation_rededication ?? "",
          ).includes(value),
      },
      {
        title: "Ministry Of Interest",
        dataIndex: "ministry_of_interest",
        key: "ministry_of_interest",
        width: "120px",
        render: (text) => (
          <span>
            {text !== "none_for_now" ? tools_textToSentenceCase(text) : null}
          </span>
        ),
      },
      // {
      //   title: "Has Prayer Request",
      //   dataIndex: "is_requesting_prayer",
      //   key: "is_requesting_prayer",
      // },
      {
        title: "Prayer Request",
        dataIndex: "suggestion_prayer_request",
        key: "suggestion_prayer_request",
        width: "200px",
      },
      {
        title: "Birthday",
        dataIndex: "birthday",
        key: "birthday",
        width: "120px",
        render: (dateTime) =>
          dateTime ? moment(dateTime).format("YYYY-MM-DD") : null,
      },
      {
        title: "Marital Status",
        dataIndex: "marital_status",
        key: "marital_status",
        width: "120px",
        filterSearch: true,
        filters: shared_marital_status_filters,
        onFilter: (value, record) => record?.marital_status?.includes(value),
      },
      {
        title: "Is In China?",
        dataIndex: "is_in_china",
        key: "is_in_china",
        width: "120px",
        render: (bool) => tools_returnBooleanSpan(bool),
        filterSearch: true,
        filters: shared_filters_booleans,
        onFilter: (value, record) =>
          JSON.stringify(record?.is_in_china ?? "").includes(value),
      },
      // {
      //   title: "Start Time",
      //   dataIndex: "start_time",
      //   key: "start_time",
      // },
      // {
      //   title: "Completion Time",
      //   dataIndex: "completion_time",
      //   key: "completion_time",
      // },
      {
        title: "Last Updated",
        dataIndex: "last_updated_time",
        key: "last_updated_time",
        width: "200px",
      },
    ],
    worship: [
      {
        title: "Id",
        dataIndex: "id",
        key: "id",
        width: "70px",
        sorter: (a, b) => Number(a.id) - Number(b.id),
        // sortOrder: sortedInfo.columnKey === "id" ? sortedInfo.order : null,
      },
      {
        title: "First Name",
        dataIndex: ["wicf_member", "first_name"],
        key: ["wicf_member", "first_name"],
        width: "120px",
      },
      {
        title: "Last Name",
        dataIndex: ["wicf_member", "last_name"],
        key: ["wicf_member", "last_name"],
        width: "120px",
      },
      {
        title: "Phone Number",
        dataIndex: ["wicf_member", "phone_number"],
        key: ["wicf_member", "phone_number"],
        width: "120px",
      },
      {
        title: "University",
        dataIndex: ["wicf_member", "university"],
        key: ["wicf_member", "university"],
        width: "120px",
        filterSearch: true,
        filters: shared_universities_filters,
        onFilter: (value, record) => {
          const r = record.wicf_member.university;
          console.log(r);
          return r?.includes(value) ? record : null;
        },
      },
      {
        title: "Is Vocalist",
        dataIndex: "is_vocalist",
        key: "is_vocalist",
        width: "100px",
        render: (bool) => tools_returnBooleanSpan(bool),
        filterSearch: true,
        filters: shared_filters_booleans,
        onFilter: (value, record) =>
          JSON.stringify(record?.is_vocalist ?? null).includes(value),
      },
      {
        title: "Is Instrumentalist",
        dataIndex: "is_instrumentalist",
        key: "is_instrumentalist",
        width: "130px",
        render: (bool) => tools_returnBooleanSpan(bool),
        filterSearch: true,
        filters: shared_filters_booleans,
        onFilter: (value, record) =>
          JSON.stringify(record?.is_instrumentalist ?? null).includes(value),
      },
      {
        title: "Is Born Again",
        dataIndex: "is_born_again",
        key: "is_born_again",
        width: "100px",
        render: (bool) => tools_returnBooleanSpan(bool),
        filterSearch: true,
        filters: shared_filters_booleans,
        onFilter: (value, record) =>
          JSON.stringify(record?.is_born_again ?? null).includes(value),
      },
      {
        title: "Is Baptized",
        dataIndex: "is_born_again",
        key: "is_baptized",
        width: "100px",
        render: (bool) => tools_returnBooleanSpan(bool),
        filters: shared_filters_booleans,
        onFilter: (value, record) =>
          JSON.stringify(record?.is_baptized ?? null).includes(value),
      },
      {
        title: "Did Workers Training",
        dataIndex: "has_completed_workers_training",
        key: "has_completed_workers_training",
        width: "120px",
        render: (bool) => tools_returnBooleanSpan(bool),
        filters: shared_filters_booleans,
        onFilter: (value, record) =>
          JSON.stringify(
            record?.has_completed_workers_training ?? null,
          ).includes(value),
      },
      {
        title: "Reason For Joining",
        dataIndex: "reason_for_joining",
        key: "reason_for_joining",
        width: "200px",
      },
      {
        title: "Knows Music Theory",
        dataIndex: "has_music_theory",
        key: "has_music_theory",
        width: "100px",
        render: (bool) => tools_returnBooleanSpan(bool),
        filters: shared_filters_booleans,
        onFilter: (value, record) =>
          JSON.stringify(record?.has_music_theory ?? null).includes(value),
      },
      {
        title: "Has Practice Schedule",
        dataIndex: "has_practice_schedule",
        key: "has_practice_schedule",
        width: "100px",
        render: (bool) => tools_returnBooleanSpan(bool),
        filters: shared_filters_booleans,
        onFilter: (value, record) =>
          JSON.stringify(record?.has_practice_schedule ?? null).includes(value),
      },
      {
        title: "Has Song Learning Approach",
        dataIndex: "has_approach_for_learning_songs",
        key: "has_approach_for_learning_songs",
        width: "100px",
        render: (bool) => tools_returnBooleanSpan(bool),
        filters: shared_filters_booleans,
        onFilter: (value, record) =>
          JSON.stringify(
            record?.has_approach_for_learning_songs ?? null,
          ).includes(value),
      },
      {
        title: "Song Learning Approach",
        dataIndex: "approach_for_learning_songs",
        key: "approach_for_learning_songs",
        width: "120px",
      },
      {
        title: "Music Listening Frequency",
        dataIndex: "music_listening_frequency",
        key: "music_listening_frequency",
        width: "120px",
        render: (item) => shared_frequency_returnLabel(item),
        filters: shared_frequency_filters,
        onFilter: (value, record) =>
          record?.music_listening_frequency?.includes(value),
      },
      {
        title: "Has Vocal Exercises",
        dataIndex: "has_vocal_exercises",
        key: "has_vocal_exercises",
        width: "100px",
        render: (item) => tools_returnBooleanSpan(item),
        filters: shared_filters_booleans,
        onFilter: (value, record) =>
          JSON.stringify(record?.has_vocal_exercises ?? null).includes(value),
      },
      {
        title: "Vocal Exercises Frequency",
        dataIndex: "vocal_exercises_frequency",
        key: "vocal_exercises_frequency",
        width: "120px",
        // render: (item) => tools_textToSentenceCaseSpan(item),
        render: (item) => shared_frequency_returnLabel(item),
        filters: shared_frequency_filters,
        onFilter: (value, record) =>
          record?.vocal_exercises_frequency?.includes(value),
      },
      {
        title: "Prays for Choir",
        dataIndex: "is_praying_for_choir",
        key: "is_praying_for_choir",
        width: "120px",
        render: (item) => tools_returnBooleanSpan(item),
        filters: shared_filters_booleans,
        onFilter: (value, record) =>
          JSON.stringify(record?.is_praying_for_choir ?? null).includes(value),
      },
      {
        title: "Confortable Harmony",
        dataIndex: "confortable_harmony",
        key: "confortable_harmony",
        width: "120px",
        // render: (item) => tools_textToSentenceCaseSpan(item),
        render: (_, { confortable_harmony: tags }) => (
          <>
            {typeof tags === "object" &&
              tags.map((tag) => {
                return (
                  <Tag color="#55acee" key={tag}>
                    {shared_harmony_returnLabel(tag)}
                  </Tag>
                );
              })}
          </>
        ),
        filterSearch: true,
        filters: shared_harmony_filters,
        onFilter: (value, record) =>
          record?.confortable_harmony?.includes(value),
      },
      {
        title: "Vocal Range",
        dataIndex: "vocal_range",
        key: "vocal_range",
        width: "120px",
        render: (_, { vocal_range: tags }) => (
          <>
            {typeof tags === "object" &&
              tags.map((tag) => {
                // let color = tag.length > 5 ? "geekblue" : "green";
                // if (tag === "loser") {
                //   color = "volcano";
                // }
                return (
                  <Tag color="#55acee" key={tag}>
                    {shared_vocal_range_returnLabel(tag)}
                  </Tag>
                );
              })}
          </>
        ),
        filterSearch: true,
        filters: shared_vocal_range_filters,
        onFilter: (value, record) => record?.vocal_range?.includes(value),
      },
      {
        title: "Define Background Vocals",
        dataIndex: "define_background_vocal",
        key: "define_background_vocal",
        width: "120px",
      },
      {
        title: "Define Worship Leader",
        dataIndex: "define_worship_leader",
        key: "define_worship_leader",
        width: "120px",
      },
      {
        title: "Define Worship",
        dataIndex: "define_worship",
        key: "define_worship",
        width: "120px",
      },
      {
        title: "Define Worshipper",
        dataIndex: "define_worshipper",
        key: "define_worshipper",
        width: "200px",
      },
      {
        title: "Struggle In Choir",
        dataIndex: "struggle_in_choir",
        key: "struggle_in_choir",
        width: "120px",
      },
      {
        title: "Instruments Able To Play",
        dataIndex: "instruments_able_to_play",
        key: "instruments_able_to_play",
        width: "120px",
        render: (_, { instruments_able_to_play: tags }) => (
          <>
            {typeof tags === "object" &&
              tags.map((tag) => {
                return (
                  <Tag
                    key={tag}
                    color="#55acee"
                    css={css`
                      width: 100%;
                    `}
                  >
                    {shared_instruments_returnLabel(tag)}
                  </Tag>
                );
              })}
          </>
        ),
        filterSearch: true,
        filters: shared_instruments_filters,
        onFilter: (value, record) =>
          record?.instruments_able_to_play?.includes(value),
      },
      {
        title: "Instruments Ability Level",
        dataIndex: "instruments_able_to_play_level",
        key: "instruments_able_to_play_level",
        width: "200px",
        // render: () => <span>sdsd</span>,
        render: (_, { instruments_able_to_play_level: tags }) => (
          <>
            {typeof tags === "object" &&
              Object.keys(tags).map((key) => {
                const instrument = shared_instruments_returnLabel(key);
                const level = tools_textToSentenceCase(tags[key]);
                const tag = `
                ${instrument}:
                ${level}`;
                // const tag = level;
                // let color = "#55acee";
                // switch (level) {
                //   case "Beginner":
                //     color = "default";
                //     break;
                //   case "Intermediate":
                //     color = "processing";
                //     break;
                //   case "Advanced":
                //     color = "success";
                //     break;
                //   default:
                //     color = "#55acee";
                // }
                // console.log("t", t);
                return (
                  <Tag
                    key={key}
                    color="#2db7f5"
                    css={css`
                      width: 100%;
                    `}
                  >
                    {tag}
                  </Tag>
                );
              })}
          </>
        ),
      },
      {
        title: "Knows Band Instruments Roles",
        dataIndex: "knows_instruments_roles_in_band",
        key: "knows_instruments_roles_in_band",
        width: "120px",
        render: (item) => tools_returnBooleanSpan(item),
        filters: shared_filters_booleans,
        onFilter: (value, record) =>
          JSON.stringify(
            record?.knows_instruments_roles_in_band ?? null,
          ).includes(value),
      },
      {
        title: "Knows Number System",
        dataIndex: "knows_number_system",
        key: "knows_number_system",
        width: "200px",
        render: (item) => tools_returnBooleanSpan(item),
        filters: shared_filters_booleans,
        onFilter: (value, record) =>
          JSON.stringify(record?.knows_number_system ?? null).includes(value),
      },
      {
        title: "Work Ethic With Others",
        dataIndex: "work_ethic_with_others",
        key: "work_ethic_with_others",
        width: "200px",
        render: (item) => tools_textToSentenceCaseSpan(item),
      },
      {
        title: "Supports Regular Workshops",
        dataIndex: "is_regular_workshop_willing",
        key: "is_regular_workshop_willing",
        width: "200px",
        render: (item) => tools_returnBooleanSpan(item),
        filters: shared_filters_booleans,
        onFilter: (value, record) =>
          JSON.stringify(record?.is_regular_workshop_willing ?? null).includes(
            value,
          ),
      },
      {
        title: "Choir Improvement",
        dataIndex: "choir_improvement_request",
        key: "choir_improvement_request",
        width: "200px",
      },
    ],
    sample: [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        filters: [
          {
            text: "Joe",
            value: "Joe",
          },
          {
            text: "Jim",
            value: "Jim",
          },
        ],
        filteredValue: filteredInfo?.name || null,
        onFilter: (value, record) => record.name.includes(value),
        sorter: (a, b) => a.name.length - b.name.length,
        sortOrder: sortedInfo?.columnKey === "name" ? sortedInfo.order : null,
        ellipsis: true,
      },
      {
        title: "Age",
        dataIndex: "age",
        key: "age",
        sorter: (a, b) => a.age - b.age,
        sortOrder: sortedInfo.columnKey === "age" ? sortedInfo.order : null,
        ellipsis: true,
      },
      {
        title: "Address",
        dataIndex: "address",
        key: "address",
        filters: [
          {
            text: "London",
            value: "London",
          },
          {
            text: "New York",
            value: "New York",
          },
        ],
        filteredValue: filteredInfo?.address || null,
        onFilter: (value, record) => record?.address?.includes(value),
        sorter: (a, b) => a.address.length - b.address.length,
        sortOrder: sortedInfo.columnKey === "address" ? sortedInfo.order : null,
        ellipsis: true,
      },
    ],
  };
  const [columns, setColumns] = useState(columnsTemplate.init);
  const handleChange = (pagination, filters, sorter, extra) => {
    console.log("Various parameters", pagination, filters, sorter);
    setFilteredInfo(filters);
    setSortedInfo(sorter);
    const { currentDataSource } = extra;
    if (currentDataSource) {
      setDataCurrent(currentDataSource);
    }
  };
  // const clearFilters = () => {
  //   setFilteredInfo({});
  //   setColumns([]);
  //   setData([]);
  // };
  // const clearAll = () => {
  //   setFilteredInfo({});
  //   setSortedInfo({});
  // };
  // const setAgeSort = () => {
  //   setSortedInfo({
  //     order: "descend",
  //     columnKey: "age",
  //   });
  // };
  async function onSubmit(values) {
    setIsTableLoading(true);
    try {
      let searchValueFinal: number | string = searchValue;
      if (searchValueFinal && !searchProperty) {
        toast.error(`Please set "Search by" property`);
        setIsTableLoading(false);
        return;
      }
      if (searchValueFinal && searchProperty) {
        switch (searchProperty) {
          case "id":
            searchValueFinal = Number(searchValueFinal);
            console.log("searchValueFinal", searchValueFinal);
            break;
          case "nationality":
            // searchValueFinal=shared
            break;
          default:
        }
      }
      console.log(values);
      const ministry_ = ministry !== "all" ? ministry : null;
      const request =
        ministry === "summerfest" ||
          ministry === "academic_summit" ||
          ministry === "feedback" ||
          ministry === "prayer_request" ||
          ministry === "workers_training"
          ? `/api/wicf/form?k=${k}&form=${ministry}`
          : `/api/wicf/manage/members?k=${k}&ministry=${ministry_ ?? ""
          }&property=${searchProperty ?? ""}&value=${searchValueFinal ?? ""
          }&nationality=${values.nationality ?? ""}&university=${values.university ?? ""
          }`;
      const response = await toast.promise(fetch(request), {
        pending: "Getting data....",
        // success: "Request Successful",
        error: "Request failed",
      });
      const res = await response.json();
      if (!res) {
        toast.error(res.message);
        setIsTableLoading(false);
      }
      toast.success(res.message);
      // console.log(res);
      setColumns([]);
      setData([]);
      setTimeout(() => {
        setColumns(columnsTemplate[ministry]);
        // setData("worship", tools_valuesToJson(res.data));
        const data = res.data;
        // console.log("gotData", data);
        if (res.data) {
          const dataJson = tools_valuesToJson(ministry, data);
          // const dataJson = data;
          // console.log("dataJson", dataJson);
          if (Array.isArray(dataJson)) {
            setDataCount(dataJson.length);
            setData(dataJson);
            setDataCurrent(dataJson);
          }
          setIsTableLoading(false);
        } else {
          setIsTableLoading(false);
        }
      }, 500);
    } catch (e) {
      console.log(e);
      setIsTableLoading(false);
      toast.error("An Error occured on you request");
    }
  }
  function onExport() {
    const excel = new Excel();
    // eslint-disable-next-line no-unused-vars
    const cleanArray = (arr) => arr.map(({ width, render, ...rest }) => rest);
    // const dataForExcel = dataCurrent;
    console.log("dataBefore", dataCurrent);
    const dataForExcel = tools_valuesToString({
      type: ministry === "worship" ? "worship" : "wicf_members",
      values: dataCurrent,
    });
    if (!Array.isArray(dataForExcel)) {
      toast.error("Error exporting data is not array");
      return;
    }
    console.log("dataString", dataForExcel);
    const time = new Date();
    const fileName = `WICF_Members-${time.toDateString()}-${time.getHours() + "_" + time.getMinutes()
      }${ministry ? "-" + ministry : null}.xlsx`;
    // console.log(fileName);
    if (dataForExcel) {
      excel
        .addSheet("Wicf" + `-${ministry}`)
        .addColumns(cleanArray(columns))
        .addDataSource(dataForExcel)
        .saveAs(fileName);
    }
  }
  function returnSearchOptions() {
    let options: any[] = [];
    if (!columns) {
      return [];
    }
    options.push({
      value: "",
      label: "None",
    });
    if (columnsTemplate[ministry]) {
      columnsTemplate[ministry].map((col) => {
        if (
          col.dataIndex === "id" ||
          col.dataIndex === "is_requesting_salvation_rededication" ||
          col.dataIndex === "is_in_china" ||
          col.dataIndex === "is_vocalist" ||
          col.dataIndex === "is_instrumentalist" ||
          col.dataIndex === "is_born_again" ||
          col.dataIndex === "is_praying_for_choir" ||
          col.dataIndex === "is_regular_workshop_willing" ||
          col.dataIndex === "nationality" ||
          col.dataIndex === "birthday" ||
          ministry !== "all"
          // col.dataIndex === ""||
        ) {
          return;
        }
        options.push({
          value: col.dataIndex,
          label: col.title,
        });
      });
    }
    return options;
  }
  async function checkCredentials(values) {
    console.log("checkCredentials", values);
    const password = values.password;
    try {
      const response = await toast.promise(
        fetch(`/api/wicf/manage/check-credentials`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: password,
          }),
        }),
        {
          pending: "Verifiying You....",
          // success: "Successfully updated your information",
          error: "Request failed",
        },
      );
      const res = await response.json();
      if (res.isError === true) {
        toast.error(res.message);
      } else if (res.data.k !== undefined) {
        setK(res.data.k);
        setIsOpen(true);
        toast.success(res.message);
      } else {
        toast.error("General error, contact admin");
      }
    } catch (e) {
      toast.error(
        "An Error occurred try reload the page, if persist contact admin",
      );
      console.log(e);
    }
  }
  return (
    <LayoutDashboard title="Manage">
      {!isOpen ? (
        <div
          css={css`
            // position: fixed;
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: 10;
            // background: black;
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          <Form
            labelCol={{
              span: 7,
            }}
            onFinish={checkCredentials}
            // layout="vertical"
            css={css`
              width: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            `}
          >
            <Form.Item>
              <img
                src={
                  "https://maravianwebservices.com/images/wicf/assets/logo2.png"
                }
                alt="WICF Logo"
                width={100}
                height={100}
                css={css`
                  padding: 0px;
                  margin: 0px;
                  background-size: contain;
                `}
              />
            </Form.Item>
            <Form.Item>
              <h2>Welcome to WICF Manage</h2>
            </Form.Item>
            <Form.Item
              name="password"
              // label="Password"
              rules={[{ required: true, message: "Please enter the password" }]}
            >
              <Input placeholder="Password" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                css={css`
                  width: 150px;
                `}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      ) : null}
      <div
        css={css`
          // border: 1px solid red;
          width: 100%;
          height: 100%;
          // padding-top: 50px;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
        `}
      >
        <Card
          title="Manage Ministry"
          css={css`
            background: transparent;
            height: 100%;
            // border: 1px solid red;
            // overflow: hidden;
            border: 0px;
          `}
        >
          <Form
            form={form}
            onFinish={onSubmit}
            labelCol={{
              span: 3,
              xl: 3,
              xxl: 3,
            }}
            wrapperCol={{
              span: 21,
              xl: 21,
              xxl: 21,
            }}
          >
            <Form.Item name="ministry" label="Ministry / Form">
              <Select
                placeholder="Select Ministry / Form"
                value={ministry}
                options={[
                  // { value: "all", label: "All Members" },
                  { value: "all", label: "All Members" },
                  ...shared_ministries,
                  {
                    value: "workers_training",
                    label: "Form: Workers Training",
                  },
                  { value: "summerfest", label: "Form: Summer Fest" },
                  { value: "academic_summit", label: "Form: Academic Summit" },
                  { value: "feedback", label: "Form: Feedback" },
                  { value: "prayer_request", label: "Form: Prayer Requests" },
                ]}
                onChange={(value) => {
                  console.log(value);
                  setMinistry(value);
                  setSearchProperty("");
                  setSearchValue("");
                  form.setFieldValue("ministy", "");
                }}
              />
            </Form.Item>
            <Form.Item name="university" label="University">
              <Select
                placeholder="Select University"
                options={[
                  { value: "", label: "All Universities" },
                  ...shared_universities_options,
                ]}
              />
            </Form.Item>
            <Form.Item name="nationality" label="Nationality">
              <Select
                placeholder="Select Nationality"
                options={[
                  { value: "", label: "All Nationalities" },
                  ...shared_countries_options,
                ]}
              />
            </Form.Item>
            <Form.Item name="value" label="Search">
              {/* <Space.Compact block size="middle">
                <Input.Search
                  onSearch={onSubmit}
                  onPressEnter={() => {}}
                  addonBefore={
                    <Select
                      placeholder="Search by"
                      options={returnSearchOptions()}
                      onChange={setSearchProperty}
                    />
                  }
                />
              </Space.Compact> */}
              <Search
                disabled={!searchProperty}
                allowClear
                onSearch={onSubmit}
                onPressEnter={() => { }}
                addonBefore={
                  <Select
                    value={searchProperty}
                    placeholder="Search by"
                    options={returnSearchOptions()}
                    onChange={(value) => {
                      // console.log(value);
                      if (value === "") {
                        setSearchValue("");
                      }
                      setSearchProperty(value);
                    }}
                    css={css`
                      min-width: 150px;
                    `}
                  />
                }
                value={searchProperty ? "" : searchValue}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchValue(value);
                }}
              />
            </Form.Item>
            {/* <Form.Item name="value" label="Search"></Form.Item> */}
            <Form.Item>
              <Row
                gutter={24}
                css={css`
                  // border: 1px solid white;
                  color: white;
                  // align-items: center;
                `}
              >
                <Col
                // span={7} sm={4} md={3} lg={2} xxl={2}
                // css={css`
                //   width: fit-content;
                // `}
                >
                  <Button htmlType="submit" type="primary">
                    Search
                  </Button>
                </Col>
                <Col
                  span={12}
                  css={css`
                    width: fit-content;
                  `}
                >
                  {/* <Statistic title="Members" value={112893} /> */}
                  <Descriptions>
                    <Descriptions.Item label="Members">
                      {dataCount}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
              {/* <Paragraph>{`Number of Members:${33}`}</Paragraph> */}
            </Form.Item>
          </Form>
          <Space
            css={css`
              // border: 1px solid red;
              width: 100%;
              overflow: hidden;
              margin-bottom: 16px;
              display: flex;
              flex-wrap: wrap;
            `}
          >
            <Button type="primary" onClick={onExport}>
              Export
            </Button>
            {/* <Button onClick={setAgeSort}>Sort</Button> */}
            {/* {isOpen ? (
              <>
                <Button onClick={clearFilters}>Clear filters</Button>
                <Button onClick={clearAll}>Clear filters and sorters</Button>
              </>
            ) : null} */}
          </Space>
          {isOpen ? (
            <Table
              loading={isTableLoading}
              columns={columns}
              dataSource={data}
              onChange={handleChange}
              key="id"
              style={{ width: "100%" }}
              css={css({
                width: "100%",
                overflow: "auto",
                ".ant-table-tbody": {
                  background: "white",
                },
              })}
            />
          ) : null}
        </Card>
      </div>
    </LayoutDashboard>
  );
}
export default Page;

export async function getServerSideProps(context) {
  console.log(context.resolvedUrl);
  let k = typeof process.env.KEY_K === "string" ? process.env.KEY_K : null;
  return permissionReturnRedirectionOrProps({
    session: (await getSession(context.res)) as TypeSession | null,
    routeUrl: context.resolvedUrl,
    props: {
      k,
      isOpen: true,
    },
  });
}

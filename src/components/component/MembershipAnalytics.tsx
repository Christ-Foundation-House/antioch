/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

import { useState, useMemo, useEffect } from "react";
import { api } from "@/utils/api";
import {
  Table,
  Button,
  Statistic,
  Card,
  List,
  Skeleton,
  Tooltip,
  Menu,
  TableProps,
  Popconfirm,
  Typography,
  DatePicker,
  Input,
  Form,
  InputNumber,
} from "antd";
const { RangePicker } = DatePicker;
import {
  shared_countries_filters,
  shared_countries_returnName,
} from "@/shared/shared_countries";
import { CheckCircleFilled, DownloadOutlined } from "@ant-design/icons";
import { DeviceScreen } from "@/styles/theme";
import React, { useRef } from "react";
import { exportGraph, exportTable } from "@/utils/export";
import { GraphSimpleLineChart } from "../Graphs";
import { SearchFilter } from "@/components/SearchFilter";
import { Dayjs } from "dayjs";
import { toast } from "react-toastify";
import { shared_universities2_returnLabel } from "@/shared/shared_universities2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { UserDetails } from "@/components/userDetails";
import { user } from "@prisma/client";
import { CardDescription } from "../ui/card";
import OptionsDropDown from "../OptionsDropDown";
import {
  emailTemplateAccountNoMembership,
  emailTemplateWelcome,
} from "@/lib/email/emailTemplates";
import { env } from "@/env";
import { useRouter } from "next/router";

const DateFormat = "YYYY-MM-DD";

const emailMembershipCreate = {
  subject: "Issue Resolved: Account Creation/Information Update",
  retry_link: `https://wicf.maravian.com/information_update`,
};
export function MembershipAnalytics() {
  const router = useRouter();
  const [notification_count, set_notification_count] = useState<
    number | undefined
  >(10);
  const [dateRange, setDateRange] = useState<
    [start: Dayjs | null | undefined, end: Dayjs | null | undefined]
  >([undefined, undefined]);
  const api_membership_get = api.registration.membership_get.useQuery({
    start_date: dateRange[0]?.valueOf() ?? undefined, // Convert start date to milliseconds
    end_date: dateRange[1]?.endOf("day").valueOf() ?? undefined, // Convert end date (23:59:59) to milliseconds
    notification_count,
  });
  const api_registration_action = api.registration.action.useMutation();
  const api_stats_get = api.stats.get.useQuery(
    {
      last_number_of_months: 5,
    },
    {
      // refetchInterval: 10000,
    },
  );
  const api_start_update = api.stats.update.useMutation();
  const api_user_membership_create =
    api.registration.user_membership_create.useMutation();
  const api_email_send = api.email.sendEmail.useMutation();
  const [activityLog, setActivityLog] = useState([
    {
      id: 1,
      action: "Verified member",
      member: "John Doe",
      timestamp: new Date("2023-05-01 10:30:00"),
    },
    {
      id: 2,
      action: "Exported member list",
      timestamp: new Date("2023-04-30 15:45:00"),
    },
    {
      id: 3,
      action: "Pending verification for Jane Smith",
      member: "Jane Smith",
      timestamp: new Date("2023-04-28 09:15:00"),
    },
  ]);
  // table
  const [dataMembers, setDataMembers] = useState(
    api_membership_get.data?.members ?? [],
  );
  const [dataMembersNew, setDataMembersNew] = useState(
    api_membership_get.data?.members_new ?? [],
  );
  const [dataAccountsNoMembership, setDataAccountsNoMembership] = useState<
    user[]
  >([]);
  const [accountsWithDataMatch, setAccountsWithDataMatch] = useState<user[]>(
    [],
  ); // ACCOUNTS WITH NO MEMBERSHIP WHERE THERE THEIR EMAILS OR PHONE NUMBER ARE ALREADY BEING USED
  const [dataMembersNoAccount, setDataMembersNoAccount] = useState<user[]>([]);
  const [dataAccountsWithDataMatch, setDataAccountsWithDataMatch] = useState<
    user[]
  >([]);

  interface columnsTemplateType {
    [key: string]: TableProps["columns"];
  }

  const [searchProperty, setSearchProperty] = useState("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [filteredInfo, setFilteredInfo] = useState<any>();
  const [sortedInfo, setSortedInfo] = useState<any>({});

  const [columnsTemplate] = useState<columnsTemplateType>({
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
        filterSearch: true,
      },
      {
        title: "Nationality",
        dataIndex: "nationality",
        key: "nationality",
        filterSearch: true,
        // filterMode: "tree",
        filters: shared_countries_filters,
        render: (code) => <span>{shared_countries_returnName(code)}</span>,
        onFilter: (value, record) =>
          JSON.stringify(record?.nationality ?? "").includes(value as string),
      },
      {
        title: "Phone",
        dataIndex: "phone_number",
        key: "phone_number",
        filterSearch: true,
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        filterSearch: true,
      },
      {
        title: "University",
        dataIndex: "university",
        key: "university",
        filterSearch: true,
        render: (item) =>
          shared_universities2_returnLabel(item) ??
          (item ? `${item} [Other]` : null),
      },
      {
        title: "Campus",
        dataIndex: "university_campus",
        key: "university_campus",
        filterSearch: true,
      },
      {
        title: "Last Registration Step",
        dataIndex: "registration_last_step",
        key: "registration_last_step",
        filterSearch: true,
      },
      {
        title: "Registration Complete",
        dataIndex: "registration_completion_time",
        key: "registration_completion_time",
        filterSearch: true,
        render: (value) => (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              textAlign: "center",
            }}
          >
            {value ? (
              <>
                <CheckCircleFilled style={{ color: "green" }} />
                {" " + new Date(value).toLocaleDateString()}
              </>
            ) : (
              "No"
            )}
          </span>
        ),
      },
      {
        title: "New member?",
        dataIndex: "is_new_member",
        key: "is_new_member",
        filterSearch: true,
        render(value: boolean, record, index) {
          return value ? (
            !record.is_new_member_acknowledged ? (
              <Button
                size="middle"
                type="default"
                loading={api_registration_action.isPending}
                onClick={() => {
                  onNewMemberAcknowledge({ wicf_id: record.id });
                }}
              >
                {`Yes, Acknowledge`}
              </Button>
            ) : (
              <span>
                {`Yes (Acknowledged)`}{" "}
                <CheckCircleFilled style={{ color: "blue" }} />
              </span>
            )
          ) : (
            ""
          );
        },
        filters: [
          {
            value: true,
            text: "Yes",
          },
          {
            value: false,
            text: "No",
          },
        ],
        onFilter: (value, record) =>
          record.is_new_member === value ? true : false,
      },
      {
        title: "Actions",
        dataIndex: "",
        key: "x",
        fixed: "right",
        width: 100,
        render: (member: (typeof dataMembers)[0]) => (
          <>
            <div
              css={css({
                display: "flex",
                gap: 5,
                [DeviceScreen.mobile]: {
                  display: "none",
                },
              })}
            >
              <Button
                size="middle"
                type="default"
                // style={{ backgroundColor: "black", color: "white" }}
                onClick={() => {
                  onUserFullDetails({ user: member });
                }}
              >
                Full Details
              </Button>
              {!member.user?.is_verified ? (
                <Button
                  size="middle"
                  type="default"
                  hidden={!member.user}
                  disabled={!member.registration_completion_time}
                  style={{
                    backgroundColor: member?.registration_completion_time
                      ? "black"
                      : "grey",
                    color: "white",
                  }}
                  loading={api_registration_action.isPending}
                  onClick={() => {
                    member?.user && onUserVerify({ id: member.user.id });
                  }}
                >
                  {!member.registration_completion_time
                    ? "Incomplete"
                    : api_registration_action.isPending
                      ? `Verifying`
                      : `Verify`}
                </Button>
              ) : !member.user?.is_banned ? (
                <Button
                  size="middle"
                  type="default"
                  danger
                  style={{ backgroundColor: "red", color: "white" }}
                  loading={api_registration_action.isPending}
                  onClick={() => {
                    member?.user && onUserBan({ id: member.user.id });
                  }}
                >
                  {`Ban`}
                </Button>
              ) : (
                <Button
                  size="middle"
                  type="default"
                  style={{ backgroundColor: "red", color: "white" }}
                  loading={api_registration_action.isPending}
                  onClick={() => {
                    member?.user && onUserUnBan({ id: member.user.id });
                  }}
                >
                  {`Un-Ban`}
                </Button>
              )}
              <Button
                size="middle"
                type="default"
                hidden
                loading={api_registration_action.isPending}
                onClick={() => {
                  member?.user &&
                    onUserSendWelcomeEmail({ id: member?.user.id });
                }}
              >
                {api_registration_action.isPending
                  ? `Welcoming`
                  : `Send Welcome`}
              </Button>
            </div>
            <div
              css={css({
                display: "none",
                gap: 5,
                [DeviceScreen.mobile]: {
                  display: "flex",
                },
              })}
            >
              <Tooltip
                title={
                  <Menu
                    theme="dark"
                    css={css`
                      background-color: transparent;
                      color: white;
                    `}
                    items={[
                      {
                        key: "verify",
                        label: "Verify",
                        onClick: () => {
                          member.user && onUserVerify({ id: member.user.id });
                        },
                      },
                      {
                        key: "ban",
                        label: "Ban",
                        onClick: () => {
                          member.user && onUserBan({ id: member.user.id });
                        },
                      },
                      {
                        key: "details",
                        label: "Full details",
                        onClick: () => {
                          member.user && onUserFullDetails({ user: member });
                        },
                      },
                    ]}
                  />
                }
              >
                <Button size="small">Options</Button>
              </Tooltip>
            </div>
          </>
        ),
      },
    ],
    users: [
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
        filterSearch: true,
      },
      {
        title: "Phone",
        dataIndex: "phone_number",
        key: "phone_number",
        filterSearch: true,
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        filterSearch: true,
      },
      {
        title: "Created At",
        dataIndex: "created_at",
        key: "created_at",
      },
      {
        title: "Emailed Already used in members?",
        dataIndex: "email",
        key: "email2",
        filterSearch: true,
        render(value: string | undefined, record, index) {
          return accountsWithDataMatch?.some((user) => user.email === value) ? (
            "Yes, Conflict Cannot Make Membership"
          ) : (
            <Popconfirm
              okText="Notify member"
              cancelText="Do not Notify"
              title={"Do you want to Notify member when fixed?"}
              onConfirm={async () => {
                await onMembershipCreate({ user: record as any }).then(
                  (res) => {
                    if (res) {
                      toast.promise(
                        api_email_send
                          .mutateAsync({
                            to: record.email,
                            subject: emailMembershipCreate.subject,
                            text: emailTemplateAccountNoMembership({
                              first_name: record.first_name ?? "Member",
                              retry_link: emailMembershipCreate.retry_link,
                            }),
                          })
                          .catch((e) => {
                            console.error(e);
                            toast.error(e.message);
                          }),
                        {
                          pending: "Sending Email",
                          success: "Email Sent",
                          error: "Failed to Send Email",
                        },
                      );
                    }
                  },
                );
              }}
              onCancel={async () => {
                onMembershipCreate({ user: record as any });
              }}
            >
              <Button
                type="primary"
                loading={api_user_membership_create.isPending}
              >
                No, Create Membership
              </Button>
            </Popconfirm>
          );
        },
        filters: [
          {
            value: true,
            text: "Yes",
          },
          {
            value: false,
            text: "No",
          },
        ],
        onFilter: (value, record) => {
          const hasConflict = accountsWithDataMatch?.some(
            (id) => id === record.id,
          );
          return value === true ? hasConflict : !hasConflict;
        },
      },
      {
        title: "Actions",
        dataIndex: "",
        key: "x",
        fixed: "right",
        width: 100,
        render: (member: (typeof dataMembers)[0]) => (
          <>
            <div
              css={css({
                display: "flex",
                gap: 5,
                [DeviceScreen.mobile]: {
                  display: "none",
                },
              })}
            >
              <Button
                size="middle"
                type="default"
                onClick={() => {
                  onUserFullDetails({ user: member });
                }}
              >
                Full Details
              </Button>
              <OptionsDropDown
                title="Create Report"
                options={[
                  {
                    label: "Conflicted Account",
                    onClick: () => {
                      onReportCreate({
                        name: "ADMIN (ON BEHALF OF)",
                        type: "bug",
                        title: "Registration: Conflicted Account",
                        description: `This account for for ${member.first_name} ${member.last_name}, does not have a membership and may fail to create one because the email or phone number is already being used by another membership / account `,
                        email: member.email ?? "",
                        user_id: member?.user?.id ?? undefined,
                      });
                    },
                  },
                  {
                    label: "Account No Member",
                    onClick: () => {
                      onReportCreate({
                        name: "ADMIN (ON BEHALF OF)",
                        type: "bug",
                        title: "Registration: Account No Member",
                        description: `This account for ${member.first_name} ${member.last_name},  was created but it is not linked to a membership, this might created issues, please review and notify user when resolved`,
                        email: member.email ?? "",
                        user_id: member?.user?.id ?? undefined,
                      });
                    },
                  },
                  {
                    label: "Send Welcome Email",
                    onClick: () => {
                      if (!member.email) {
                        toast.error("No Email");
                        return;
                      }
                      member.email &&
                        toast.promise(
                          api_email_send
                            .mutateAsync({
                              to: member.email,
                              subject:
                                "Issue Resolved: Account Creation/Information Update",
                              text: emailTemplateWelcome({
                                first_name: member.first_name ?? "Member",
                                last_name: member.last_name ?? "",
                                login_link: "https://wicf.maravian.com/sign-in",
                                feedback_link:
                                  "https://wicf.maravian.com/feedback",
                              }),
                            })
                            .catch((e) => {
                              console.error(e);
                              toast.error(e.message);
                            }),
                          {
                            pending: "Sending Email",
                            success: "Email Sent",
                            error: "Failed to Send Email",
                          },
                        );
                    },
                  },
                ]}
              />
            </div>
          </>
        ),
      },
    ],
  });
  const [columns, setColumns] = useState<TableProps["columns"]>(
    columnsTemplate.init,
  );
  const [columns2, setColumns2] = useState<TableProps["columns"]>(
    columnsTemplate.users,
  );
  const refGraphNewMembers = useRef<HTMLDivElement>(null);
  const [profileDetails, setProfileDetails] = useState<
    (typeof dataMembers)[0] | undefined
  >(undefined);
  function setData(args: {
    property:
      | "members"
      | "members_new"
      | "accounts_no_membership"
      | "accounts_with_data_match"
      | "members_no_account";
    data: any;
    onChangeArgs?:
      | any
      | {
          pagination;
          filters;
          sorter;
          extra;
        };
  }) {
    // const { filters, sorter, extra, pagination } = args?.onChangeArgs;
    const filters = args?.onChangeArgs?.filters;
    const sorter = args?.onChangeArgs?.sorter;
    const extra = args?.onChangeArgs?.extra;
    const pagination = args?.onChangeArgs;
    console.log(args);
    const currentDataSource = extra?.currentDataSource;

    filters && setFilteredInfo(filters);
    sorter && setSortedInfo(sorter);

    let dataNew = currentDataSource ?? args.data ?? [];
    // if (currentDataSource) {
    //   dataNew = currentDataSource;
    // }
    switch (args.property) {
      case "members":
        setDataMembers(dataNew);
        break;
      case "members_new":
        setDataMembersNew(dataNew);
        break;
      case "accounts_no_membership":
        setDataAccountsNoMembership(dataNew);
        break;
      case "accounts_with_data_match":
        setDataAccountsWithDataMatch(dataNew);
        break;
      case "members_no_account":
        setDataMembersNoAccount(dataNew);
        break;
      default:
        break;
    }
  }
  function onUserVerify(args: { id: string }) {
    toast
      .promise(
        api_registration_action.mutateAsync({
          action: "user_verify",
          id: args.id,
        }),
        {
          pending: "Verifying user...",
          success: "User verified successfully",
          error: "Failed to verify user",
        },
      )
      .then(() => {
        api_membership_get.refetch();
      });
  }
  function onUserBan(args: { id: string }) {
    toast
      .promise(
        api_registration_action.mutateAsync({
          action: "ban",
          id: args.id,
        }),
        {
          pending: "Banning user...",
          success: "User banned successfully",
          error: "Failed to ban user",
        },
      )
      .then(() => {
        api_membership_get.refetch();
      });
  }
  function onUserUnBan(args: { id: string }) {
    toast
      .promise(
        api_registration_action.mutateAsync({
          action: "unban",
          id: args.id,
        }),
        {
          pending: "Un Banning user...",
          success: "User Un banned successfully",
          error: "Failed to Un ban user",
        },
      )
      .then(() => {
        api_membership_get.refetch();
      });
  }
  function onUserSendWelcomeEmail(args: { id: string }) {
    toast
      .promise(
        api_registration_action.mutateAsync({
          action: "send_welcome_email",
          id: args.id,
        }),
        {
          pending: "Welcoming user...",
          success: "User welcomed successfully",
          error: "Failed to welcome user",
        },
      )
      .then(() => {
        api_membership_get.refetch();
      });
  }
  function onNewMemberAcknowledge(args: { wicf_id: number }) {
    toast
      .promise(
        api_registration_action.mutateAsync({
          action: "acknowledge_new_member",
          wicf_id: args.wicf_id,
        }),
        {
          pending: "Acknowledging new member...",
          success: "Acknowledged new user successfully",
          error: "Failed to Acknowledge user",
        },
      )
      .then(() => {
        api_membership_get.refetch();
      })
      .catch((e) => {
        toast.error(e);
      });
  }
  function onUserFullDetails(args: { user: (typeof dataMembers)[0] }) {
    setProfileDetails(args.user);
  }
  async function onMembershipCreate(args: { user: user }) {
    const { first_name, last_name, email, phone_number } = args.user;
    if (!first_name || !last_name || !email || !phone_number) {
      toast.error("Account does not have enough data to create membership");
      return;
    }
    const res = await toast
      .promise(
        api_user_membership_create.mutateAsync({
          first_name,
          last_name,
          email,
          phone_number,
          user_id_overide: args.user.id,
        }),
        {
          pending: "Creating membership...",
          success: "Membership created successfully",
          error: "Failed to create membership",
        },
      )
      .then(() => {
        api_membership_get.refetch();
        return true;
      })
      .catch((e) => {
        toast.error(e.message ?? `Failed to create membership for ${email}`);
        console.error(e);
        return false;
      });
    return res;
  }
  const api_report_create = api.report.create.useMutation();
  type ReportCreateInput = {
    type: "general" | "bug" | "appeal";
    description: string;
    email: string;
    name?: string | undefined;
    title?: string | undefined;
    user_id?: string | undefined;
    url?: string | undefined;
  };

  function onReportCreate(args: ReportCreateInput) {
    toast.promise(
      api_report_create
        .mutateAsync(args)
        .then(() => {
          toast.success("Report created successfully");
        })
        .catch((e) => {
          console.error(e);
          toast.error("Failed to create report");
        }),
      {
        pending: "Creating report...",
        // success: "Report created successfully",
        error: "Failed to create report",
      },
    );
  }

  // useEffect(() => {
  //   const _data = api_membership_get.data?.users_with_no_wicf_membership.filter(
  //     (user) =>
  //       accountsWithDataMatch.some((account) => account.email === user.email)
  //         ? false
  //         : true,
  //   );
  //   setDataAccountsNoMembership(_data ?? []);
  // }, [
  //   accountsWithDataMatch,
  //   api_membership_get.data?.users_with_no_wicf_membership,
  // ]);
  useEffect(() => {
    if (!api_membership_get?.data) return;
    const { users_with_no_wicf_membership, members_no_account } =
      api_membership_get?.data;
    const _accountsWithMatchingMemberships: user[] = [];
    if (users_with_no_wicf_membership && members_no_account) {
      users_with_no_wicf_membership.map((user) => {
        members_no_account.map((member) => {
          // if (member.email === user.email) {
          //   _accountsWithMatchingMemberships.push(user);
          // }
          if (member.phone_number === user.phone_number) {
            _accountsWithMatchingMemberships.push(user);
          }
        });
      });
      setAccountsWithDataMatch(_accountsWithMatchingMemberships);
      setColumns2(columnsTemplate.users);
    }
    setData({
      property: "members",
      data: api_membership_get.data?.members ?? [],
    });
    setData({
      property: "members_no_account",
      data: api_membership_get.data?.members_no_account ?? [],
    });
    setData({
      property: "accounts_no_membership",
      data: api_membership_get.data?.users_with_no_wicf_membership ?? [],
    });
  }, [api_membership_get.data]);
  useEffect(() => {
    accountsWithDataMatch &&
      setDataAccountsWithDataMatch(accountsWithDataMatch);
  }, [accountsWithDataMatch]);
  return (
    <div
      style={{
        width: "100%",
      }}
    >
      <Card
        title="Data Criteria"
        bordered={false}
        style={{ backgroundColor: "transparent" }}
        extra={
          <Button
            loading={api_membership_get.isPending}
            size={"small"}
            onClick={() => {
              api_membership_get.refetch();
            }}
          >
            Apply
          </Button>
        }
      >
        <Form
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 24,
          }}
          layout="horizontal"
          css={css({
            [".ant-picker-suffix, .ant-picker-clear"]: {
              color: "white !important",
            },
          })}
        >
          <Form.Item name={"date_range"} label="Date Range">
            <RangePicker
              value={dateRange}
              width={"100%"}
              style={{
                width: "100%",
              }}
              onChange={(dateNew) => {
                if (dateNew) {
                  setDateRange([dateNew[0], dateNew[1]]); // Set the new date range if dates are selected
                } else {
                  setDateRange([undefined, undefined]); // Handle case where no dates are selected (null)
                }
                console.log(dateNew);
              }}
            />
          </Form.Item>
          <Form.Item
            initialValue={notification_count}
            name="notification_count"
            label="Notification Count:"
          >
            <InputNumber
              type="number"
              value={notification_count}
              style={{
                color: "white",
                backgroundColor: "transparent",
                width: "100%",
              }}
              onChange={(value) => {
                set_notification_count(value ?? 0);
              }}
              min={0}
              // suffix={}
            />
            <Button
              size="small"
              style={{
                zIndex: 0,
                marginTop: 5,
              }}
              onClick={() => {
                set_notification_count(undefined);
              }}
            >
              Get all notifications
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <Card
        title="General Summary"
        bordered={false}
        style={{
          color: "black",
          backgroundColor: "transparent",
        }}
        extra={[
          <Button
            size="small"
            onClick={() => {
              api_membership_get.refetch();
            }}
            loading={api_membership_get.isFetching}
          >
            {api_membership_get.isFetching ? "Loading" : "Refresh"}
          </Button>,
        ]}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            textAlign: "center",
          }}
        >
          <Statistic
            title="New Members"
            value={api_membership_get.data?.count?.members_new}
          />
          <Statistic
            title="Verified Members"
            value={api_membership_get.data?.count?.members_verified}
          />
          <Statistic
            title="Unverified Members"
            value={api_membership_get.data?.count?.members_unverified}
          />
          <Statistic
            title="Total Members"
            value={api_membership_get.data?.count?.members_total}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            textAlign: "center",
            marginTop: 5,
          }}
        >
          {api_membership_get.data?.count ? (
            <Statistic
              title="NOT Completed Registration"
              value={
                api_membership_get.data?.count?.members_total -
                api_membership_get.data?.count?.members_completed_registration
              }
            />
          ) : null}
          <Statistic
            title="Banned Members"
            value={api_membership_get.data?.count?.members_banned}
          />
          <Statistic
            title="Completed Registration"
            value={
              api_membership_get.data?.count?.members_completed_registration
            }
          />
        </div>
      </Card>
      <Card
        title={`Members (${dataMembers.length}/${api_membership_get.data?.count?.members_total})`}
        bordered={false}
        style={{
          color: "black",
          backgroundColor: "transparent",
        }}
        extra={[
          <div style={{ display: "flex", gap: 10 }}>
            <Button
              size="small"
              loading={api_stats_get.isFetching}
              onClick={() => {
                api_membership_get.refetch();
              }}
            >
              Refresh
            </Button>
            <Button
              size="small"
              onClick={() => {
                exportTable({
                  columns,
                  data: dataMembers,
                  type: "wicf_members",
                  fileNamePrefix: "Wicf-All_Members",
                });
              }}
              icon={<DownloadOutlined />}
            >
              Export
            </Button>
          </div>,
        ]}
      >
        <SearchFilter
          titleShow={false}
          data={api_membership_get.data?.members ?? []}
          onSearch={(filteredData) => {
            setData({
              property: "members",
              data: filteredData,
            });
          }}
        />
        <Table
          rowKey={"id"}
          loading={api_membership_get.isPending}
          columns={columns}
          dataSource={dataMembers}
          onChange={(args) => {
            setData({
              property: "members",
              data: api_membership_get.data?.members ?? [],
              onChangeArgs: args,
            });
          }}
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
      </Card>
      <Card
        title={`Activity logs (${api_membership_get.data?.notifications.length})`}
        bordered={false}
        style={{
          color: "black",
          backgroundColor: "transparent",
        }}
        extra={
          [
            // <Button
            //   size="small"
            //   loading={api_membership_get.isFetching}
            //   onClick={() => {
            //     api_membership_get.refetch();
            //   }}
            // >
            //   Refresh
            // </Button>,
          ]
        }
      >
        <List
          loading={api_membership_get.isPending}
          key={"id"}
          itemLayout="horizontal"
          // loadMore={loadMore}
          dataSource={api_membership_get.data?.notifications}
          style={{
            color: "white",
          }}
          renderItem={(item, index) => (
            <List.Item
              key={item.id}
              actions={
                [
                  // <Button size="small" key="list-loadmore-edit">
                  //   Edit
                  // </Button>,
                  // <Button size="small" key="list-loadmore-more">
                  //   More
                  // </Button>,
                ]
              }
            >
              <Skeleton
                key={index}
                avatar
                title={false}
                loading={api_membership_get.isPending}
                active
              >
                <List.Item.Meta
                  key={item.id}
                  // avatar={<Avatar src={item.picture.large} />}
                  title={
                    <h2>
                      #{item.id} {item.title}
                    </h2>
                  }
                  description={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <p>{item.message}</p>
                      <p>
                        {item.timestamp.toLocaleDateString() +
                          " " +
                          item.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  }
                />
              </Skeleton>
            </List.Item>
          )}
        />
      </Card>
      <Card
        // hidden
        title="Information Graphs"
        bordered={false}
        style={{
          color: "black",
          backgroundColor: "transparent",
        }}
        extra={[
          <div style={{ display: "flex", gap: 10 }}>
            <Button
              size="small"
              loading={api_stats_get.isFetching}
              onClick={() => {
                api_stats_get.refetch();
              }}
            >
              Refresh
            </Button>
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => {
                exportGraph({
                  divRef: refGraphNewMembers,
                  fileName: "members_new.png",
                });
              }}
            >
              Export
            </Button>
          </div>,
        ]}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            padding: 10,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Popconfirm
            title={`It will take some time to recalculate, are you sure?`}
          >
            <Button
              danger
              size="small"
              loading={api_start_update.isPending}
              onClick={() => {
                api_start_update
                  .mutateAsync({ time: "all" })
                  .then(() => api_stats_get.refetch());
              }}
            >{`Recalculate (All)`}</Button>
          </Popconfirm>
          <Button
            size="small"
            loading={api_start_update.isPending}
            onClick={() => {
              api_start_update
                .mutateAsync({ time: "current_year" })
                .then(() => api_stats_get.refetch());
            }}
          >{`Recalculate (Year)`}</Button>
          <Button
            size="small"
            loading={api_start_update.isPending}
            onClick={() => {
              api_start_update
                .mutateAsync({ time: "current_month" })
                .then(() => api_stats_get.refetch());
            }}
          >{`Recalculate (Month)`}</Button>
        </div>

        <div ref={refGraphNewMembers}>
          <GraphSimpleLineChart
            title={"New & Total Members"}
            data={api_stats_get.data?.data ?? []}
            // typeShown={["count_members", "count_new_member"]}
            typeShown={[
              {
                key: "count_members",
                label: "Total Members",
                color: "#ff5722",
              },
              {
                key: "count_new_members",
                label: "New Members",
                color: "#6a5acd",
              },
            ]}
          />
          {/* <GraphSimpleLineChart
            title={"Feedback & Prayer Requests"}
            data={api_stats_get.data?.data ?? []}
            typeShown={["count_feedback", "count_prayer_request"]}
          /> */}
        </div>
      </Card>
      <Dialog
        open={profileDetails ? true : false}
        onOpenChange={(state) => {
          if (!state) {
            setProfileDetails(undefined);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          {profileDetails ? (
            <UserDetails member={profileDetails as any} />
          ) : undefined}
        </DialogContent>
      </Dialog>

      <Card
        title={`Account With Data Match (${accountsWithDataMatch.length})`}
        bordered={false}
        style={{
          color: "black",
          backgroundColor: "transparent",
        }}
        extra={[
          <Button
            size="small"
            onClick={() => {
              api_membership_get.refetch();
            }}
            loading={api_membership_get.isFetching}
          >
            {api_membership_get.isFetching ? "Loading" : "Refresh"}
          </Button>,
        ]}
      >
        <CardDescription style={{ padding: 5 }}>
          These are accounts that don't have a membership but their phone
          numbers match an existing membership from previous data
        </CardDescription>
        <SearchFilter
          titleShow={false}
          data={accountsWithDataMatch ?? []}
          onSearch={(filteredData) => {
            setData({
              property: "accounts_with_data_match",
              data: filteredData,
            });
          }}
        />
        <Table
          rowKey={"id"}
          loading={api_membership_get.isPending}
          columns={columns2}
          dataSource={dataAccountsWithDataMatch}
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
      </Card>
      <Card
        title={`Account with no membership (${
          dataAccountsNoMembership.length
        })`}
        bordered={false}
        style={{
          color: "black",
          backgroundColor: "transparent",
        }}
        extra={[
          <div style={{ display: "flex", gap: 5 }}>
            <Popconfirm
              okText="Notify them"
              cancelText="Do not Notify"
              title={"Do you want to Notify them when fixed?"}
              onConfirm={() => {
                dataAccountsNoMembership?.map(async (account) => {
                  await onMembershipCreate({ user: account }).then((res) => {
                    if (res) {
                      toast.promise(
                        api_email_send
                          .mutateAsync({
                            to: account.email,
                            subject: emailMembershipCreate.subject,
                            text: emailTemplateAccountNoMembership({
                              first_name: account.first_name ?? "Member",
                              retry_link: emailMembershipCreate.retry_link,
                            }),
                          })
                          .catch((e) => {
                            console.error(e);
                            toast.error(e.message);
                          }),
                        {
                          pending: "Sending Email",
                          success: "Email Sent",
                          error: "Failed to Send Email",
                        },
                      );
                    }
                  });
                });
              }}
              onCancel={() => {
                dataAccountsNoMembership?.map(async (account) => {
                  await toast.promise(onMembershipCreate({ user: account }), {
                    pending: "Creating membership...",
                    // success: "Membership created successfully",
                    error: "Failed to create membership",
                  });
                });
              }}
            >
              <Button
                size="small"
                loading={
                  api_user_membership_create.isPending ||
                  api_membership_get.isFetching
                }
              >
                {"Make memberships for all"}
              </Button>
            </Popconfirm>
            <Button
              size="small"
              onClick={() => {
                api_membership_get.refetch();
              }}
              loading={api_membership_get.isFetching}
            >
              {api_membership_get.isFetching ? "Loading" : "Refresh"}
            </Button>
            ,
          </div>,
        ]}
      >
        <CardDescription style={{ padding: 5 }}>
          These are accounts that don't have a membership
        </CardDescription>
        <SearchFilter
          titleShow={false}
          data={api_membership_get.data?.users_with_no_wicf_membership ?? []}
          onSearch={(filteredData) => {
            setData({
              property: "accounts_no_membership",
              data: filteredData,
            });
          }}
        />
        <Table
          rowKey={"id"}
          loading={api_membership_get.isPending}
          columns={columns2}
          dataSource={dataAccountsNoMembership}
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
      </Card>
      <Card
        title={`Memberships with No Account (${dataMembersNoAccount.length})`}
        bordered={false}
        style={{
          color: "black",
          backgroundColor: "transparent",
        }}
        extra={[
          <div style={{ display: "flex", gap: 5 }}>
            <Button
              size="small"
              onClick={() => {
                api_membership_get.refetch();
              }}
              loading={api_membership_get.isFetching}
            >
              {api_membership_get.isFetching ? "Loading" : "Refresh"}
            </Button>
            ,
          </div>,
        ]}
      >
        <CardDescription style={{ padding: 5 }}>
          These are memberships from previous data that have no accounts, or
          been claimed yet
        </CardDescription>
        <SearchFilter
          titleShow={false}
          data={api_membership_get.data?.members_no_account ?? []}
          onSearch={(filteredData) => {
            setData({
              property: "members_no_account",
              data: filteredData,
            });
          }}
        />
        <Table
          rowKey={"id"}
          loading={api_membership_get.isPending}
          columns={columns}
          dataSource={dataMembersNoAccount}
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
      </Card>
    </div>
  );
}

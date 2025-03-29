/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Table,
  Tabs,
  Typography,
  message,
} from "antd";
import { useState } from "react";
import { api } from "@/utils/api";
import dayjs from "dayjs";
import { LayoutDashboard } from "@/layouts/layoutDashboard";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { TypeSession } from "@/shared/shared_types";
import { permissionReturnRedirectionOrProps } from "@/utils/permission";
import { getSession } from "next-auth/react";
import { CheckCircle2 } from "lucide-react";
const { Title } = Typography;
const { RangePicker } = DatePicker;

interface TenureRecord {
  id: string;
  label: string;
  name: string;
  description: string | null;
  start_date: Date;
  end_date: Date;
  appointments: {
    id: string;
    position: {
      label: string;
    };
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
    start_date: Date;
    end_date: Date | null;
    status: string;
    is_notified: Date | null;
    is_accepted: Date | null;
  }[];
}

interface TenureFormData {
  label: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
}

interface AppointmentFormData {
  tenureId: string;
  positionId: string;
  userId: string;
  period: [Date, Date];
}

export default function TenureManagement() {
  const router = useRouter();
  const [tenureForm] = Form.useForm();
  const [appointmentForm] = Form.useForm();
  const [isTenureModalOpen, setIsTenureModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingTenure, setEditingTenure] = useState<TenureRecord | null>(null);
  const [selectedTenure, setSelectedTenure] = useState<string | null>(null);

  // const utils = api.useContext();
  const { data: tenures, ..._leadershipTenure } =
    api.leadershipTenure.getAll.useQuery();
  const { data: positions } = api.leadershipPosition.getAll.useQuery();
  const { data: users } = api.user.getWicfMembers.useQuery({
    only_registed_members: true,
  });

  const createTenure = api.leadershipTenure.create.useMutation({
    onSuccess: async () => {
      // await utils.leadershipTenure.getAll.invalidate();
      _leadershipTenure.refetch();
      message.success("Tenure created successfully");
      setIsTenureModalOpen(false);
      tenureForm.resetFields();
      toast.success("Tenure created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
      message.error(error.message);
    },
  });

  const updateTenure = api.leadershipTenure.update.useMutation({
    onSuccess: async () => {
      // await utils.leadershipTenure.getAll.invalidate();
      _leadershipTenure.refetch();
      message.success("Tenure updated successfully");
      setIsTenureModalOpen(false);
      setEditingTenure(null);
      tenureForm.resetFields();
      toast.success("Tenure updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
      message.error(error.message);
    },
  });

  const deleteTenure = api.leadershipTenure.delete.useMutation({
    onSuccess: async () => {
      // await utils.leadershipTenure.getAll.invalidate();
      _leadershipTenure.refetch();
      message.success("Tenure deleted successfully");
      toast.success("Tenure deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
      message.error(error.message);
    },
  });

  const createAppointment = api.leadershipTenure.createAppointment.useMutation({
    onSuccess: async () => {
      // await utils.leadershipTenure.getAll.invalidate();
      _leadershipTenure.refetch();
      message.success("Appointment created successfully");
      setIsAppointmentModalOpen(false);
      appointmentForm.resetFields();
    },
    onError: (error) => {
      toast.error(error.message);
      message.error(error.message);
    },
  });

  const updateAppointment = api.leadershipTenure.updateAppointment.useMutation({
    onSuccess: async () => {
      // await utils.leadershipTenure.getAll.invalidate();
      _leadershipTenure.refetch();
      message.success("Appointment updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
      message.error(error.message);
    },
  });

  const removeAppointment = api.leadershipTenure.removeAppointment.useMutation({
    onSuccess: async () => {
      // await utils.leadershipTenure.getAll.invalidate();
      _leadershipTenure.refetch();
      message.success("Appointment removed successfully");
    },
    onError: (error) => {
      toast.error(error.message);
      message.error(error.message);
    },
  });
  const notifyAppointment = api.leadershipTenure.notifyAppointment.useMutation({
    onSuccess: async (data) => {
      // await utils.leadershipTenure.getAll.invalidate();
      _leadershipTenure.refetch();
      message.success(data.message ?? "Appointment notified successfully");
    },
    onError: (error) => {
      toast.error(error.message);
      message.error(error.message);
    },
  });

  const handleTenureSubmit = (values_: TenureFormData) => {
    console.log(values_);
    const period = (values_ as any).period as string[];
    const startDate = period[0];
    const endDate = period[1];

    if (!startDate || !endDate) {
      message.error("Please select a valid tenure period");
      return;
    }

    const values = {
      ...values_,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      description: values_.description ?? "",
    };

    if (editingTenure) {
      void updateTenure.mutate({
        id: editingTenure.id,
        ...values,
      });
    } else {
      void createTenure.mutate(values);
    }
  };

  const handleAppointmentSubmit = (values: AppointmentFormData) => {
    let submitValues = {
      ...values,
      tenureId: selectedTenure!,
      startDate: new Date(values.period[0]),
      endDate: new Date(values.period[1]),
      period: undefined,
    };
    console.log(submitValues);
    void createAppointment.mutate(submitValues);
  };

  const tenureColumns = [
    {
      title: "Name",
      dataIndex: "label",
      key: "label",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Period",
      key: "period",
      render: (record: TenureRecord) => (
        <>
          {new Date(record.start_date).toLocaleDateString()} -{" "}
          {new Date(record.end_date).toLocaleDateString()}
        </>
      ),
    },
    {
      title: "Appointments",
      key: "appointments",
      render: (record: TenureRecord) => record.appointments.length,
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: TenureRecord) => (
        <>
          <Button
            type="link"
            onClick={() => {
              setEditingTenure(record);
              tenureForm.setFieldsValue({
                ...record,
                period: [dayjs(record.start_date), dayjs(record.end_date)],
                // startDate: dayjs(record.start_date),
                // endDate: dayjs(record.end_date),
              });
              setIsTenureModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button type="link" onClick={() => setSelectedTenure(record.id)}>
            Manage Appointments
          </Button>
          <Button
            type="link"
            danger
            onClick={() => void deleteTenure.mutate({ id: record.id })}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  const appointmentColumns = [
    {
      title: "Position",
      key: "position",
      render: (record: TenureRecord["appointments"][number]) =>
        record.position.label,
    },
    {
      title: "Member",
      key: "member",
      render: (record: TenureRecord["appointments"][number]) =>
        `${record.user.first_name} ${record.user.last_name} - ${record.user.email}`,
    },
    {
      title: "Period",
      key: "period",
      render: (record: TenureRecord["appointments"][number]) => (
        <>
          {new Date(record.start_date).toLocaleDateString()}
          {record.end_date &&
            ` - ${new Date(record.end_date).toLocaleDateString()}`}
        </>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: TenureRecord["appointments"][number]) => (
        <>
          {/* <Button
            type="link"
            onClick={() =>
              void updateAppointment.mutate({
                id: record.id,
                startDate: record.start_date,
                endDate: record.end_date ?? undefined,
                status: record.status === "active" ? "completed" : "active",
              })
            }
          >
            {record.status === "active" ? "Complete" : "Reactivate"}
          </Button> */}
          <Button
            disabled={!!record.is_notified}
            type="link"
            onClick={() => void notifyAppointment.mutate({ id: record.id })}
          >
            {record.is_accepted
              ? "Accepted"
              : record.is_notified
                ? "Resend"
                : "Notify"}
          </Button>

          <Button
            type="link"
            danger
            onClick={() => void removeAppointment.mutate({ id: record.id })}
          >
            Remove
          </Button>
        </>
      ),
    },
  ];

  const selectedTenureData = tenures?.find((t) => t.id === selectedTenure);

  return (
    <LayoutDashboard title="Leadership Tenure Management">
      <div className="p-6 w-full">
        <div className="mb-6 flex items-center justify-between">
          <Title level={2}>{`Leadership Tenures (${tenures?.length})`}</Title>
          <Button
            type="primary"
            onClick={() => {
              setEditingTenure(null);
              tenureForm.resetFields();
              setIsTenureModalOpen(true);
            }}
          >
            Add Tenure
          </Button>
          <Button
            type="primary"
            hidden
            onClick={() => {
              router.push("/dashboard/leadership/positions");
            }}
          >
            Add Position
          </Button>
        </div>

        <Tabs
          activeKey={selectedTenure ? "appointments" : "tenures"}
          onChange={(key) => {
            if (key === "tenures") {
              setSelectedTenure(null);
            }
          }}
          items={[
            {
              key: "tenures",
              label: "Tenures",
              children: (
                <Card className="overflow-x-auto">
                  <Table
                    dataSource={tenures}
                    columns={tenureColumns}
                    rowKey="id"
                    loading={!tenures}
                  />
                </Card>
              ),
            },
            {
              key: "appointments",
              label: `Appointments - ${selectedTenureData?.name ?? ""}`,
              children: selectedTenureData && (
                <Card
                  title={
                    <>
                      <div className="flex items-center justify-between flex-wrap p-2">
                        <div className="text-sm text-gray-600 flex flex-wrap items-center gap-2">
                          <span className="text-lg font-bold text-black">
                            {`Appointments (${selectedTenureData.name})`}
                          </span>
                        </div>

                        <Button
                          type="primary"
                          onClick={() => {
                            appointmentForm.resetFields();
                            appointmentForm.setFieldsValue({
                              period: [
                                dayjs(selectedTenureData.start_date),
                                dayjs(selectedTenureData.end_date),
                              ],
                            });
                            setIsAppointmentModalOpen(true);
                          }}
                        >
                          Add Appointment
                        </Button>
                      </div>
                      <div className="text-black">
                        {`Appointed Leaders: ${selectedTenureData.appointments.length} || `}
                        <span>{`From: ${dayjs(selectedTenureData.start_date).format("DD-MM-YYYY")}`}</span>{" "}
                        <span>{`To: ${dayjs(selectedTenureData.end_date).format("DD-MM-YYYY")}`}</span>
                      </div>
                    </>
                  }
                  style={{
                    width: "100%",
                  }}
                  // className="w-full flex flex-col scroll-auto"
                  className="overflow-x-auto"
                >
                  <Table
                    dataSource={selectedTenureData.appointments}
                    columns={appointmentColumns}
                    rowKey="id"
                    className="w-full"
                  />
                </Card>
              ),
              disabled: !selectedTenure,
            },
          ]}
        />

        {/* Tenure Modal */}
        <Modal
          title={editingTenure ? "Edit Tenure" : "Add Tenure"}
          open={isTenureModalOpen}
          onCancel={() => {
            setIsTenureModalOpen(false);
            setEditingTenure(null);
            tenureForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={tenureForm}
            layout="vertical"
            onFinish={handleTenureSubmit}
            className="mt-4"
          >
            <Form.Item
              name="label"
              label={<span className="text-black">Tenure Name</span>}
              rules={[{ required: true, message: "Please enter tenure name" }]}
              style={{ color: "black !important" }}
            >
              <Input
                className="text-black"
                css={css({
                  color: "black !important",
                })}
              />
            </Form.Item>

            <Form.Item
              name="description"
              // label="Description"
              label={<span className="text-black">Description</span>}
            >
              <Input.TextArea
                rows={4}
                css={css({
                  color: "black !important",
                })}
              />
            </Form.Item>

            <Form.Item
              name="period"
              label={<span className="text-black">Tenure Period</span>}
              rules={[
                { required: true, message: "Please select tenure period" },
              ]}
            >
              <RangePicker
                className="w-full text-black"
                css={css({
                  ["input"]: {
                    color: "black !important",
                  },
                })}
                onChange={(dates) => {
                  if (dates) {
                    tenureForm.setFieldsValue({
                      startDate: dates[0]?.toDate(),
                      endDate: dates[1]?.toDate(),
                    });
                  }
                }}
              />
            </Form.Item>

            <Form.Item className="mb-0 text-right">
              <Button
                type="default"
                className="mr-2"
                onClick={() => setIsTenureModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createTenure.isPending || updateTenure.isPending}
              >
                {editingTenure ? "Update" : "Create"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Appointment Modal */}
        <Modal
          title="Add Appointment"
          open={isAppointmentModalOpen}
          onCancel={() => {
            setIsAppointmentModalOpen(false);
            appointmentForm.resetFields();
          }}
          css={css({
            background: "transparent",
            ".ant-modal-title": {
              color: "white",
            },
            ".ant-modal-header": {
              background: "transparent",
            },
            ".ant-modal-content": {
              background: "#161E27",
            },
          })}
          footer={null}
        >
          <Form
            form={appointmentForm}
            layout="vertical"
            onFinish={handleAppointmentSubmit}
            className="mt-4"
          >
            <Form.Item
              name="positionId"
              // label="Position"
              label="Position"
              rules={[{ required: true, message: "Please select a position" }]}
            >
              <Select
                placeholder="Select a position"
                showSearch
                filterOption={(input, option) => {
                  const item = positions?.find((u) => u.id === option?.value);
                  if (!item) return false;
                  const fullName = `${item.label}`.toLowerCase();
                  return fullName.includes(input.toLowerCase());
                }}
              >
                {positions?.map((position) => (
                  <Select.Option key={position.id} value={position.id}>
                    {position.label}
                    {position.ministry && ` (${position.ministry.label})`}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="userId"
              // label="Member"
              label="Member (Registrated Only)"
              rules={[{ required: true, message: "Please select a member" }]}
            >
              <Select
                placeholder="Select a member"
                showSearch
                filterOption={(input, option) => {
                  const user = users?.find((u) => u.user_id === option?.value);
                  if (!user) return false;
                  const fullName =
                    `${user.first_name} ${user.last_name}`.toLowerCase();
                  return fullName.includes(input.toLowerCase());
                }}
              >
                {users?.map((user) => (
                  <Select.Option
                    key={user.user_id}
                    value={user.user_id}
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      {`${user.first_name} ${user.last_name} - ${user.email ?? user.user?.email} `}
                      {user?.registration_completion_time && (
                        <CheckCircle2 className="size-3 text-green-500" />
                      )}
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="period"
              // label="Appointment Period"
              label="Appointment Period"
              rules={[
                { required: true, message: "Please select appointment period" },
              ]}
            >
              <RangePicker
                className="w-full"
                // css={css({
                //   ["input"]: {
                //     color: "black !important",
                //   },
                // })}
                onChange={(dates) => {
                  if (dates) {
                    appointmentForm.setFieldsValue({
                      startDate: dates[0]?.toDate(),
                      endDate: dates[1]?.toDate(),
                    });
                  }
                }}
              />
            </Form.Item>

            <Form.Item className="mb-0 text-right">
              <Button
                type="default"
                className="mr-2"
                onClick={() => setIsAppointmentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </LayoutDashboard>
  );
}

export async function getServerSideProps(context) {
  console.log(context.resolvedUrl);
  return permissionReturnRedirectionOrProps({
    session: (await getSession(context.res)) as TypeSession | null,
    routeUrl: context.resolvedUrl,
  });
}

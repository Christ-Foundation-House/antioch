/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Table,
  Typography,
  message,
} from "antd";
import { useState } from "react";
import { api } from "@/utils/api";
import LayoutDashboard from "@/layouts/layoutDashboard";
import { getSession } from "next-auth/react";
import { permissionReturnRedirectionOrProps } from "@/utils/permission";
import { TypeSession } from "@/shared/shared_types";
import { shared_leadership_positions_options } from "@/shared/shared_leadershipPositions";
import {
  leadership_position,
  leadership_position_type,
  ministry,
} from "@prisma/client";

const { Title } = Typography;

interface PositionFormData extends Partial<leadership_position> {
  label: string;
  name: string;
  description?: string;
  ministryId?: string;
  leadership_type?: leadership_position_type;
}

// interface PositionMinistry {
//   id: string;
//   name: string;
//   label: string;
// }

// interface PositionAppointment {
//   id: string;
//   status: string;
// }

// interface PositionRecord {
//   id: string;
//   label: string;
//   name: string;
//   description: string | null;
//   ministry_id: string | null;
//   created_at: Date;
//   updated_at: Date;
//   ministry: PositionMinistry | null;
//   appointments: PositionAppointment[];
// }

type PositionRecord = leadership_position & {
  ministry: ministry | null;
};

export default function PositionManagement() {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<PositionRecord | null>(
    null,
  );

  // const utils = api.useContext();
  const { data: positions, ..._leadershipPosition } =
    api.leadershipPosition.getAll.useQuery();
  const { data: ministries } = api.ministry.getAll.useQuery();

  const createPosition = api.leadershipPosition.create.useMutation({
    onSuccess: async () => {
      // await utils.leadershipPosition.getAll.invalidate();
      _leadershipPosition.refetch();
      message.success("Position created successfully");
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error) => {
      if (error.message.includes("Unique constraint failed")) {
        message.error("One value already exists");
      } else {
        message.error(error.message);
      }
    },
  });

  const updatePosition = api.leadershipPosition.update.useMutation({
    onSuccess: async () => {
      // await utils.leadershipPosition.getAll.invalidate();
      _leadershipPosition.refetch();
      message.success("Position updated successfully");
      setIsModalOpen(false);
      setEditingPosition(null);
      form.resetFields();
    },
    onError: (error) => {
      if (error.message.includes("Unique constraint failed")) {
        message.error("One value already exists");
      } else {
        message.error(error.message);
      }
    },
  });

  const deletePosition = api.leadershipPosition.delete.useMutation({
    onSuccess: async () => {
      // await utils.leadershipPosition.getAll.invalidate();
      _leadershipPosition.refetch();
      message.success("Position deleted successfully");
    },
  });

  const handleSubmit = (values: PositionFormData) => {
    if (editingPosition) {
      void updatePosition.mutate({
        id: editingPosition.id,
        ...values,
      });
    } else {
      void createPosition.mutate(values);
    }
  };

  const columns = [
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
      title: "Leadership Type",
      key: "leadership_type",
      render: (record: PositionRecord) => record.leadership_type ?? "N/A",
    },
    {
      title: "Ministry",
      key: "ministry",
      render: (record: PositionRecord) => record.ministry?.label ?? "N/A",
    },
    // {
    //   title: "Active Appointments",
    //   key: "appointments",
    //   render: (record: PositionRecord) =>
    //     record.appointments.filter((a) => a.status === "active").length,
    // },
    {
      title: "Actions",
      key: "actions",
      render: (record: PositionRecord) => (
        <>
          <Button
            type="link"
            onClick={() => {
              setEditingPosition(record);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            onClick={() => void deletePosition.mutate({ id: record.id })}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <LayoutDashboard title="Leadership Position Management">
      <div className="p-6 w-full">
        <div className="mb-6 flex items-center justify-between">
          <Title
            level={2}
          >{`Leadership Positions (${positions?.length})`}</Title>
          <Button
            type="primary"
            onClick={() => {
              setEditingPosition(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            Add Position
          </Button>
        </div>

        <Card className="overflow-x-auto">
          <Table
            dataSource={positions}
            columns={columns}
            rowKey="id"
            loading={!positions}
          />
        </Card>

        <Modal
          title={editingPosition ? "Edit Position" : "Add Position"}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingPosition(null);
            form.resetFields();
          }}
          footer={null}
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
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="mt-4"
          >
            <Form.Item
              name="label"
              label="Position Name"
              rules={[
                { required: true, message: "Please enter position name" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="leadership_type"
              label="Leadership Type"
              rules={[
                { required: true, message: "Please select a leadership type" },
              ]}
            >
              <Select options={shared_leadership_positions_options} />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item name="ministryId" label="Ministry">
              <Select allowClear placeholder="Select a ministry">
                {ministries?.map((ministry) => (
                  <Select.Option key={ministry.id} value={ministry.id}>
                    {ministry.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item className="mb-0 text-right">
              <Button
                type="default"
                className="mr-2"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createPosition.isPending || updatePosition.isPending}
              >
                {editingPosition ? "Update" : "Create"}
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

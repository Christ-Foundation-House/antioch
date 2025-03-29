/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Table,
  Typography,
  message,
} from "antd";
import { useState } from "react";
import { api } from "@/utils/api";
import { getSession } from "next-auth/react";
import { TypeSession } from "@/shared/shared_types";
import { permissionReturnRedirectionOrProps } from "@/utils/permission";
import LayoutDashboard from "@/layouts/layoutDashboard";
import { toast } from "react-toastify";

const { Title } = Typography;

interface MinistryFormData {
  name: string;
  label: string;
  description?: string;
}

interface MinistryUser {
  id: string;
  name: string | null;
}

interface MinistryMember {
  id: number;
  user: MinistryUser;
}

interface MinistryPosition {
  id: number;
  name: string;
}

interface MinistryRecord {
  id: string;
  label: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
  members: MinistryMember[];
  positions: MinistryPosition[];
}

export default function MinistryManagement() {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState<MinistryRecord | null>(
    null,
  );

  const utils = api.useContext();
  const { data: ministries } = api.ministry.getAll.useQuery();

  const createMinistry = api.ministry.create.useMutation({
    onSuccess: async () => {
      await utils.ministry.getAll.invalidate();
      message.success("Ministry created successfully");
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error) => {
      toast.error(error.message);
      message.error(error.message);
    },
  });

  const updateMinistry = api.ministry.update.useMutation({
    onSuccess: async () => {
      await utils.ministry.getAll.invalidate();
      message.success("Ministry updated successfully");
      setIsModalOpen(false);
      setEditingMinistry(null);
      form.resetFields();
    },
    onError: (error) => {
      toast.error(error.message);
      message.error(error.message);
    },
  });

  const deleteMinistry = api.ministry.delete.useMutation({
    onSuccess: async () => {
      await utils.ministry.getAll.invalidate();
      message.success("Ministry deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
      message.error(error.message);
    },
  });

  const handleSubmit = (values: MinistryFormData) => {
    if (editingMinistry) {
      void updateMinistry.mutate({
        id: editingMinistry.id,
        ...values,
      });
    } else {
      void createMinistry.mutate(values);
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
      title: "Members",
      key: "members",
      render: (record: MinistryRecord) => record.members.length,
    },
    {
      title: "Positions",
      key: "positions",
      render: (record: MinistryRecord) => record.positions.length,
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: MinistryRecord) => (
        <>
          <Button
            type="link"
            onClick={() => {
              setEditingMinistry(record);
              form.setFieldsValue({
                label: record.label,
                description: record.description,
              });
              setIsModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            onClick={() => void deleteMinistry.mutate({ id: record.id })}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <LayoutDashboard title="Ministry Management">
      <div className="p-6 w-full">
        <div className="mb-6 flex items-center justify-between">
          <Title level={2}>{`Ministries (${ministries?.length})`}</Title>
          <Button
            type="primary"
            onClick={() => {
              setEditingMinistry(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            Add Ministry
          </Button>
        </div>

        <Card className="overflow-x-auto">
          <Table
            dataSource={ministries}
            columns={columns}
            rowKey="id"
            loading={!ministries}
          />
        </Card>

        <Modal
          title={editingMinistry ? "Edit Ministry" : "Add Ministry"}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingMinistry(null);
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
              label="Ministry Name"
              rules={[
                { required: true, message: "Please enter ministry name" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <Input.TextArea rows={4} />
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
                loading={createMinistry.isPending || updateMinistry.isPending}
              >
                {editingMinistry ? "Update" : "Create"}
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

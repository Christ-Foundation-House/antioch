/** @jsxImportSource @emotion/react */
import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Card,
  Row,
  Col,
  // Statistic,
  message,
} from "antd";
import { api } from "@/utils/api";
import LayoutDashboard from "@/layouts/layoutDashboard";
import { permissionReturnRedirectionOrProps } from "@/utils/permission";
import { getSession } from "next-auth/react";
import { TypeSession } from "@/shared/shared_types";
import { css } from "@emotion/react";
import Link from "next/link";

interface TopicFormData {
  name: string;
  Label: string;
  is_open: boolean;
}

const QuestionsDashboard = () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<any>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);

  function formatTopicName(name: string) {
    // name sure it small letter and no space
    const name_ = name.toLowerCase().replace(/\s+/g, "_");
    return name_;
  }

  const { data: topics, isLoading } = api.qa.getTopics.useQuery();
  const { data: selectedTopicStats } = api.qa.getTopicStats.useQuery(
    { id: selectedTopicId! },
    { enabled: !!selectedTopicId },
  );

  const createTopic = api.qa.createTopic.useMutation({
    onSuccess: () => {
      message.success("Topic created successfully");
      setIsModalOpen(false);
      form.resetFields();
    },
  });

  const updateTopic = api.qa.updateTopic.useMutation({
    onSuccess: () => {
      message.success("Topic updated successfully");
      setIsModalOpen(false);
      setEditingTopic(null);
      form.resetFields();
    },
  });

  const deleteTopic = api.qa.deleteTopic.useMutation({
    onSuccess: () => {
      message.success("Topic deleted successfully");
    },
  });

  const utils = api.useContext();

  const handleSubmit = (values: TopicFormData) => {
    if (editingTopic) {
      updateTopic.mutate({
        id: editingTopic.id,
        ...values,
        name: formatTopicName(values.name),
      });
    } else {
      createTopic.mutate(values);
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this topic?",
      content: "This action cannot be undone.",
      onOk: () => {
        deleteTopic.mutate(
          { id },
          {
            onSuccess: () => {
              utils.qa.getTopics.invalidate();
            },
          },
        );
      },
    });
  };

  const columns = [
    { title: "Topic", dataIndex: "name", key: "name" },
    { title: "Label", dataIndex: "Label", key: "Label" },
    {
      title: "Questions",
      dataIndex: "_count",
      key: "questions",
      render: (count: { qa_questions: number }) => count.qa_questions,
    },
    {
      title: "Status",
      dataIndex: "is_open",
      key: "status",
      render: (isOpen: boolean) => (isOpen ? "Open" : "Closed"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: any) => (
        <>
          <Button
            type="link"
            onClick={() => {
              setEditingTopic(record);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
          <Button type="link" onClick={() => setSelectedTopicId(record.id)}>
            View Stats
          </Button>
          <Link href={`/qa/${record.name}`}>
            <Button type="link">View Questions</Button>
          </Link>
        </>
      ),
    },
  ];

  function Statistic(props: any) {
    return (
      <div
        css={css({
          color: "black !important",
        })}
      >
        {props.title}: <strong>{props.value}</strong>
      </div>
    );
  }

  return (
    <LayoutDashboard title="Questions Dashboard">
      <div className="p-6" style={{ height: "100vh", width: "100%" }}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Questions Dashboard</h1>
          <Button
            type="primary"
            onClick={() => {
              setEditingTopic(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            Create New Topic
          </Button>
        </div>

        <Table columns={columns} dataSource={topics} loading={isLoading} />

        {selectedTopicStats && (
          <Card
            title={
              <span
                css={css({
                  color: "black !important",
                })}
              >
                Topic Statistics
              </span>
            }
            className="mt-4"
            css={css({
              color: "black !important",
            })}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Total Questions"
                  value={selectedTopicStats.totalQuestions}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Answered Questions"
                  value={selectedTopicStats.answeredQuestions}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Questions with Answers"
                  value={selectedTopicStats.questionsWithAnswers}
                />
              </Col>
            </Row>
          </Card>
        )}

        <Modal
          title={editingTopic ? "Edit Topic" : "Create New Topic"}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingTopic(null);
            form.resetFields();
          }}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="name"
              label={
                <span
                  css={css({
                    color: "black !important",
                  })}
                >
                  Topic Name
                </span>
              }
              rules={[{ required: true, message: "Please enter topic name" }]}
            >
              <Input
                name="name"
                css={css({
                  color: "black !important",
                })}
              />
            </Form.Item>
            <Form.Item
              name="Label"
              label={
                <span
                  css={css({
                    color: "black !important",
                  })}
                >
                  Label
                </span>
              }
              rules={[{ required: true, message: "Please enter label" }]}
            >
              <Input
                css={css({
                  color: "black !important",
                })}
              />
            </Form.Item>
            <Form.Item
              name="is_open"
              label="Status"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren="Open" unCheckedChildren="Closed" />
            </Form.Item>
            <Form.Item className="text-right">
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
                loading={createTopic.isPending || updateTopic.isPending}
              >
                {editingTopic ? "Update" : "Create"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </LayoutDashboard>
  );
};

export async function getServerSideProps(context) {
  return permissionReturnRedirectionOrProps({
    session: (await getSession(context.res)) as TypeSession | null,
    routeUrl: context.resolvedUrl,
  });
}

export default QuestionsDashboard;

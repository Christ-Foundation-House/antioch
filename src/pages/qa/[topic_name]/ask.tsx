import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Select } from "antd";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { qa_topic } from "@prisma/client";

const AskQuestion = () => {
  const [form] = Form.useForm();
  const [topics, setTopics] = useState<qa_topic[]>([]);
  const { data: fetchedTopics } = api.qa.getTopics.useQuery();
  const router = useRouter();

  useEffect(() => {
    if (fetchedTopics) {
      setTopics(fetchedTopics);
    }
  }, [fetchedTopics]);

  const createQuestion = api.qa.createQuestion.useMutation({
    onSuccess: () => {
      message.success("Question submitted successfully!");
      form.resetFields();
      router.push("/qa/success");
    },
    onError: (error) => {
      message.error(error.message || "Failed to submit question.");
    },
  });

  const onFinish = async (values) => {
    if (values.full_name === "" || values.full_name === undefined) {
      values.full_name = "Anonymous";
    }
    createQuestion.mutate(values);
  };

  return (
    <div style={{ height: "100%", width: "100%", padding: "20px" }}>
      <h1>Ask a Question</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="qa_topic_id"
          label="Select Topic"
          rules={[{ required: true, message: "Please select a topic!" }]}
        >
          <Select
            aria-label="Select Topic"
            defaultValue={topics[0]?.id}
            options={topics.map((topic) => ({
              label: topic.Label,
              value: topic.id,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="full_name"
          label="Your Name"
          rules={[{ required: false, message: "Please enter your name!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="subject" label="Subject">
          <Input />
        </Form.Item>
        <Form.Item
          name="question"
          label="Question"
          rules={[{ required: true, message: "Please enter your question!" }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AskQuestion;

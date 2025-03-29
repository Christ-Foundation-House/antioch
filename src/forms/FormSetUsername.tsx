/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { storageWriteItem } from "@/utils/localStorage";
import { Button, Form, FormInstance, Input } from "antd";

export default function FormSetUsername(props: {
  form: FormInstance<any>;
  modalClose: () => void;
}) {
  return (
    <Form
      form={props.form}
      onFinish={(values) => {
        console.log(values);
        if (values["live-username"]) {
          storageWriteItem("live-username", values["live-username"]);
          props.modalClose();
        }
      }}
    >
      <Form.Item
        name="live-username"
        label={<span style={{ color: "black" }}>Username</span>}
        rules={[{ required: true, message: "Please set your username" }]}
      >
        <Input
          css={css`
            color: black !important;
          `}
        />
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          css={css`
            width: 100%;
          `}
          htmlType="submit"
        >
          Save
        </Button>
      </Form.Item>
    </Form>
  );
}

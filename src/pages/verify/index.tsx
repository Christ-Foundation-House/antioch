// "use client";
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
import Link from "next/link";
// import Image from "next/image";
import { Button, Row, Col, Typography, Form, Input, Switch } from "antd";

// import { useRouter } from "next/navigation";
import { useRouter } from "next/router";

import {
  // useSession,
  getSession,
  signIn,
} from "next-auth/react";
import AuthProviders from "@/components/AuthProviders";
import { logger } from "@/lib/logger";
import { GetErrorMessage } from "@/lib/errors";
import { DeviceScreen } from "@/styles/theme";
import { toast } from "react-toastify";

function onChange(checked) {
  console.log(`switch to ${checked}`);
}

const { Title } = Typography;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [email, setEmail] = useState("");
  const onFinish = async () => {
    setLoading(true);
    localStorage.setItem("email", email);
    try {
      await signIn("email", { email });
    } catch (error) {
      console.error("Error sending magic link", error);
      logger.error(error);
    } finally {
      setLoading(false);
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  useEffect(() => {
    const setEmail_ = async () => {
      const email = (await localStorage.getItem("email")) ?? "";
      console.log({ email });
      // setEmail(email)
      form.setFieldValue("email", email);
    };
    setEmail_();
  }, []);
  return (
    <div
      css={css`
        width: 100%;
        height: 100%;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 10px;
      `}
    >
      <Row
        gutter={[24, 0]}
        justify="space-around"
        css={css`
          // margin-top: 50px;
          border: 1px solid #808080;
          width: 720px;
          border-radius: 25px;
          padding: 20px;
          ${DeviceScreen.mobile} {
            // margin-top: 50px;
            border: 0;
          }
        `}
      >
        <Col
          span={24}
          style={{
            textAlign: "center",
            height: 300,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            // gap: 10
          }}
        >
          <Title>Check You Email</Title>
          <Title
            className="font-regular text-muted"
            level={5}
            style={{ marginTop: 0 }}
          >
            {`A sign in link has been sent to your email address.`}
          </Title>
          <Link href="/sign-in">
            <Button
              loading={loading}
              disabled={loading}
              type="primary"
              htmlType="submit"
              style={{
                width: 200,
                backgroundColor: "#ED8703",
                border: "none",
                marginTop: 10,
              }}
            >
              GO TO SIGN-IN
            </Button>
          </Link>
        </Col>
      </Row>
    </div>
  );
}

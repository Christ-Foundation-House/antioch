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
      if (!email) {
        toast.error("Please re-enter your email address");
        return;
      }
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
      // console.log({ email });
      setEmail(email);
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
        <Col span={24}>
          <Title>Forgot Password</Title>
          <Title className="font-regular text-muted" level={5}>
            {`Enter your email address and we'll send you a login link.`}
          </Title>
          <Form
            form={form}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            layout="vertical"
            className="row-col"
          >
            <Form.Item label="Email" name="email">
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  localStorage.setItem("email", e.target.value);
                }}
                required
              />
            </Form.Item>
            <Form.Item
              style={{
                textAlign: "center",
              }}
            >
              <Button
                loading={loading}
                disabled={loading}
                type="primary"
                htmlType="submit"
                style={{
                  width: "100%",
                  backgroundColor: "#ED8703",
                  border: "none",
                }}
              >
                SEND LINK
              </Button>
              <Link href="/sign-in">
                <p
                  className="text-dark font-bold"
                  css={css({
                    paddingTop: 10,
                    color: "white !important",
                    opacity: 0.4,
                    "&:hover": {
                      opacity: 0.7,
                    },
                  })}
                >
                  I remember my password
                </p>
              </Link>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (session) {
    return {
      redirect: {
        destination: "/dashboard/account",
        permanent: false,
      },
    };
  }
  return {
    props: { session },
  };
}

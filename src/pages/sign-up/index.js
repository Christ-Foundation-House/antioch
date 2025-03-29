"use client";
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import React, { useState } from "react";
import { Button, Typography, Form, Input, Checkbox, Col, Row } from "antd";
import {
  // useSession,
  getSession,
  // signIn,
} from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import AuthProviders from "@/components/AuthProviders";
import { GetErrorMessage } from "@/lib/errors";
import { DeviceScreen } from "@/styles/theme";
import { toast } from "react-toastify";

const { Title } = Typography;
function Page() {
  const router = useRouter();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState(
    router?.query?.error && GetErrorMessage(router?.query?.error),
  );
  const onFinish = async (values) => {
    try {
      // const body = { ...values };
      const body = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone_number: values.phone_number,
        password: values.password,
      };
      // console.log(`POSTing ${JSON.stringify(body, null, 2)}`);
      // const res = await toast.promise(
      //   fetch(`/api/user/create`, {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify(body),
      //   }),
      //   {
      //     pending: "Registering....",
      //     error: "Request failed",
      //   }
      // );
      // if (res.status == 200) {
      //   console.log("User Creation Successful");
      //   toast.success("Account created successfully");
      //   // router.push("/");
      // } else {
      //   console.log("res", res.json().message);
      //   toast.info(res.body.message);
      //   setError(res.body.message);
      // }

      const response = await toast.promise(
        fetch(`/api/user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
        {
          pending: "Registering....",
          error: "Request failed",
        },
      );
      const res = await response.json();
      if (res.isError !== true) {
        toast.success(res.message ?? "Successfully Registered");
        setError(null);
        router.push("/sign-in");
      } else {
        toast.error(res.message ?? "General error, contact admin");
        setError(
          res.message ??
            "Failed to create user, Try different Email or Contact Admin",
        );
      }
    } catch (error) {
      console.error(error);
      setError("Failed to create user, Try different Email or Contact Admin");
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
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
          min-height: 560px;
          ${DeviceScreen.mobile} {
            // margin-top: 50px;
            border: 0;
          }
        `}
      >
        <Col span={24}>
          <Title>Register</Title>
          <Title className="font-regular text-muted" level={5}>
            Login or create new account
          </Title>
          {/* {error ? <pre style={{ color: "red" }}>{error}</pre> : null} */}
          <pre
            style={{
              width: "100%",
              wordWrap: "break-word",
              whiteSpace: "normal",
              color: "red",
            }}
          >
            {error}
          </pre>
          <Form
            name="basic"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            className="row-col"
            layout="vertical"
          >
            <Form.Item
              label="First Name"
              name="first_name"
              rules={[
                { required: true, message: "Please input your first name" },
              ]}
            >
              <Input placeholder="Username" />
            </Form.Item>
            <Form.Item
              label="Last Name"
              name="last_name"
              rules={[
                { required: true, message: "Please input your last name" },
              ]}
            >
              <Input placeholder="Username" />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Please input your email!" }]}
            >
              <Input placeholder="email" type="email" />
            </Form.Item>
            <Form.Item
              label="Phone Number"
              name="phone_number"
              rules={[
                { required: true, message: "Please input your phone number!" },
              ]}
            >
              <Input placeholder="Phone number" type="tel" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input placeholder="Password" />
            </Form.Item>
            <Form.Item>
              <AuthProviders />
            </Form.Item>
            <Form.Item name="terms" valuePropName="checked">
              <Checkbox
                value={agreeTerms}
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              >
                I agree the{" "}
                <a href="#terms" className="font-bold text-dark">
                  Terms and Conditions
                </a>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                style={{ width: "100%" }}
                type="primary"
                htmlType="submit"
                disabled={!agreeTerms}
              >
                SIGN UP
              </Button>
            </Form.Item>
          </Form>
          <p className="font-semibold text-muted text-center">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-bold text-dark">
              Sign In
            </Link>
          </p>
        </Col>
      </Row>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  console.log(session);
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

export default Page;

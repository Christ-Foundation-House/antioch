// "use client";
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
import Link from "next/link";
// import Image from "next/image";
import { Button, Row, Col, Typography, Form, Input, Switch } from "antd";
import React from "react";
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
import {
  StorageReadItem,
  StorageRemoveItem,
  StorageWriteItem,
} from "@/utils/localStorage";

function onChange(checked) {
  console.log(`switch to ${checked}`);
}

const { Title } = Typography;

function SignIn() {
  const router = useRouter();
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const { error } = router.query;
    if (error) {
      setError(GetErrorMessage(String(error) as any));
    }
  }, [router.query]);
  // const { data: session } = useSession();
  const onFinish = async (values) => {
    // console.log("Success:", values);
    setLoading(true);
    try {
      // const body = { ...defaultBody, ...values };
      const body = {
        phone_number: values.phone_number,
        password: values.password,
      };
      // console.log(`POSTing ${JSON.stringify(body, null, 2)}`);
      // let res = await signIn("credentials", {
      //   ...body,
      //   // callbackUrl: router.query.callbackUrl,
      // });
      if (remember) {
        StorageWriteItem("phone_number", body.phone_number);
        StorageWriteItem("password", body.password);
        StorageWriteItem("remember", remember);
      }
      let res = await toast.promise(
        signIn("credentials", {
          ...body,
          redirect: false,
          // callbackUrl: router.query.callbackUrl,
        })
          .then((res) => {
            if (res?.error) {
              throw res.error;
            } else {
              setError(undefined);
              const url = String(router.query.url);
              console.log({ url });
              if (
                url &&
                url !== "undefined" &&
                url !== undefined &&
                url !== "" &&
                url !== "/" &&
                url !== "/sign-in" &&
                url !== "/forgot-password" &&
                !url.includes("[") &&
                !url.includes("error")
              ) {
                router.push({
                  pathname: url,
                });
              } else {
                router.push({
                  pathname: "/dashboard/account",
                });
              }
            }
          })
          .catch((errorCode) => {
            // setError(errorCode);
            router.replace({
              pathname: router.pathname,
              query: {
                error: errorCode,
              },
            });
          }),
        {
          pending: "Verifying You....",
          error: "Request failed",
        },
      );
      logger.debug(`signing:onsubmit:res`, res);
    } catch (error) {
      logger.error(error);
    } finally {
      setLoading(false);
    }
  };
  // if (status === "authenticated") {
  //   router.push("/", {
  //     query: {
  //       callbackUrl: router.query.callbackUrl,
  //     },
  //   });
  // };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  const [form] = Form.useForm();
  useEffect(() => {
    const formData = {
      phone_number:
        StorageReadItem("phone_number") ?? localStorage.getItem("phone_number"),
      password: StorageReadItem("password") ?? localStorage.getItem("password"),
      remember: StorageReadItem("remember") ?? localStorage.getItem("remember"),
    };
    form.setFieldsValue(formData);
    formData.remember && setRemember(Boolean(formData.remember));
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
        justify={"space-around"}
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
          <Title>Sign In</Title>
          <Title className="font-regular text-muted" level={5}>
            Log in with your email and password
          </Title>
          <pre style={{ color: "red" }}>{error}</pre>
          <Form
            form={form}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            layout="vertical"
            className="row-col"
            onChange={() => {
              setError(undefined);
            }}
          >
            <Form.Item
              className="username"
              label="Phone Number"
              name="phone_number"
              rules={[
                {
                  required: true,
                  message: "Please input your phone number",
                },
              ]}
            >
              <Input
                type="tel"
                placeholder="Phone Number"
                // defaultValue="admin@hivemaster.com"
              />
            </Form.Item>

            <Form.Item
              className="username"
              label="Password"
              name="password"
              initialValue=""
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
            >
              <Input.Password
                visibilityToggle
                type="password"
                placeholder="Password"
              />
            </Form.Item>
            <Form.Item>
              <AuthProviders />
            </Form.Item>
            <Form.Item
              name="remember"
              className="aligin-center"
              valuePropName="checked"
            >
              <Switch
                defaultChecked
                checked={remember}
                // value={remember}
                onChange={(value) => {
                  if (value === false) {
                    StorageRemoveItem("phone_number");
                    StorageRemoveItem("password");
                    StorageRemoveItem("remember");
                  }
                  setRemember(value);
                }}
                // color="#ED8703"
                css={css`
                  background-color: #ed8703;
                `}
              />
              <span
                css={css`
                  padding-left: 20px;
                  color: white;
                `}
              >
                Remember me
              </span>
            </Form.Item>
            <Form.Item
              style={{
                textAlign: "center",
              }}
            >
              <Button
                loading={loading}
                type="primary"
                htmlType="submit"
                style={{
                  width: "100%",
                  backgroundColor: "#ED8703",
                  border: "none",
                }}
              >
                {loading ? `SIGNING IN...` : `SIGN IN`}
              </Button>
              <Link href="/forgot-password">
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
                  Forgot your password
                </p>
              </Link>
            </Form.Item>
            <p className="font-semibold text-muted">
              <span>{`Don't have an account? `}</span>
              <Link
                href="/register2"
                className="text-dark font-bold"
                css={css`
                  color: #ed8703;
                `}
              >
                {" "}
                Sign Up
              </Link>
            </p>
          </Form>
        </Col>
        <Col
          className="sign-img"
          style={{ padding: 12 }}
          xs={{ span: 24 }}
          lg={{ span: 12 }}
          md={{ span: 12 }}
        >
          {/* <img src={signinbg} alt="" /> */}
          {/* <img
                src={signinbg}
                alt="signin"
                css={css`
                  object-fit: contain;
                  width: 100% !important;
                  position: relative !important;
                  height: 100% !important;
                `}
                priority
              /> */}
        </Col>
      </Row>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  // console.log(session);
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

export default SignIn;

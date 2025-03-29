/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { useRouter } from "next/router";
// import Image from "next/image";
import { Input, Button, Typography, Form, Select } from "antd";
// const { TextArea } = Input;

import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import { TypeSession } from "@/shared/shared_types";
import Link from "next/link";
import { shared_universities2_options } from "@/shared/shared_universities2";
const {
  // Title,
  Paragraph,
} = Typography;

function Page() {
  // const router = useRouter();
  const [formTitle] = useState(`Academic Summit Question Submission`);
  // const formRef = useRef();
  const [form] = Form.useForm();
  const [isDone, setIsDone] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const request_prayerSubmit =
    api.prayer.academic_summit_question_create.useMutation();
  const session = useSession();
  const user = session?.data?.user as TypeSession["user"];
  async function onFormSubmit(values) {
    setIsSubmitting(true);
    toast
      .promise(
        request_prayerSubmit.mutateAsync({
          full_name: values.full_name,
          topic: values.topic,
          question: values.question,
        }),
        {
          pending: "Submitting...",
          success: "Registration submitted",
          error: "Failed to submit",
        },
      )
      .then((res) => {
        console.log(res);
        setIsDone(true);
      })
      .catch((e) => {
        console.log(e);
        toast.error(e.message ?? "Failed");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }
  function onFormSubmitFailed(formData) {
    console.log("Form failed", formData);
    if (formData.values.firstname === undefined) {
    }
  }
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        // name: user.wicf_member
        //   ? user.wicf_member?.first_name + " " + user.wicf_member?.last_name
        //   : user.first_name + " " + user.last_name,
        // contact_info: user.email,
        first_name: user.wicf_member?.first_name ?? "",
        last_name: user.wicf_member?.last_name ?? "",
      });
    }
  }, [user]);
  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        margin: 0px #important;
        padding: 0px #important;
        scroll-snap-type: mandatory;
        scroll-snap-points-y: repeat(300px);
        scroll-snap-type: y mandatory;
      `}
    >
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div
        css={css`
          scroll-snap-align: start;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          align-items: center;
          position: relative;
        `}
      >
        <div
          css={css`
            display: flex;
            border-bottom: 1px solid grey;
            height: fit-content;
            width: 100%;
            align-items: center;
            justify-content: center;
            position: -webkit-sticky; /* Safari */
            position: sticky;
            top: 0;
            z-index: 1;
            backdrop-filter: blur(10px);
          `}
        >
          <img
            src={"https://maravianwebservices.com/images/wicf/assets/logo2.png"}
            alt="WICF Logo"
            width={100}
            height={100}
            css={css`
              padding: 0px;
              margin: 0px;
              background-size: contain;
            `}
          />
          <span
            css={css`
              font-size: 25px;
              text-align: center;
            `}
          >
            {formTitle}
          </span>
        </div>
        {isDone !== true ? (
          <Form
            scrollToFirstError={true}
            form={form}
            layout="vertical"
            onFinish={onFormSubmit}
            onFinishFailed={onFormSubmitFailed}
            // onValuesChange={onFormChange}
            css={css`
              min-height: 100%;
              padding: 0px 40px;
              width: 100%;
              max-width: 1200px;
            `}
          >
            <Paragraph
              css={css`
                // border: 1px solid red;
                width: 100%;
                padding: 15px 0px;
                text-align: center;
              `}
            >
              <span>{`Please submit your question`}</span>
              <br />
            </Paragraph>
            <Form.Item
              name="full_name"
              label="Full name"
              rules={[
                { required: true, message: "Please enter your full name" },
              ]}
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item
              name="topic"
              label="Topic"
              // rules={[{ required: true, message: "Please enter the topic" }]}
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item
              name="question"
              label="Question"
              rules={[
                { required: true, message: "Please enter your question" },
              ]}
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item
              css={css`
                display: flex;
                align-items: center;
                justify-content: center;
              `}
            >
              <div
                css={css`
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 0px 10px;
                  width: 100%;
                `}
              >
                <Button
                  disabled={isSubmitting}
                  type="primary"
                  css={css`
                    width: 200px;
                  `}
                  htmlType="submit"
                >
                  Submit
                </Button>
              </div>
            </Form.Item>
          </Form>
        ) : (
          <div
            css={css`
              // height: 100%;
              padding: 0px 40px;
              width: 100%;
              max-width: 1200px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
              flex: 1;
            `}
          >
            <span
              css={css`
                font-size: 25px;
                text-align: center;
              `}
            >
              Thank you
            </span>
            <span
              css={css`
                font-size: 25px;
                text-align: center;
              `}
            >
              You have successfully Submitted
            </span>
            <div
              style={{
                paddingTop: 10,
                gap: 5,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Link href="/">
                <Button>WICF Home</Button>
              </Link>
              <Link href="/academic_summit_2024">
                <Button>Academic Summit 2024</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default Page;

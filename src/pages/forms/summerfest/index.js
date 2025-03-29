/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { useRouter } from "next/router";
// import Image from "next/image";
import { Input, Button, Typography, Form, Select, DatePicker } from "antd";
// const { TextArea } = Input;

import { useState, useRef } from "react";
import moment from "moment";
import shared_countries from "@/shared/shared_countries";
import shared_universities from "@/shared/shared_universities";
const {
  // Title,
  Paragraph,
} = Typography;
const countries = [];
shared_countries.map((c) => {
  let country = {
    label: c.name,
    value: c.name,
  };
  countries.push(country);
});

const universities = [];
shared_universities.map((u) => {
  let university = {
    label: u.name,
    value: u.name,
  };
  universities.push(university);
});
function Page() {
  // const router = useRouter();
  const [formTitle] = useState("WICF Summerfest Registration");
  const formRef = useRef();
  const formTopRef = useRef();
  const [form] = Form.useForm();
  const [passportExpiryDate, setPassportExpiryDate] = useState(null);
  const [isDone, setIsDone] = useState(false);

  function onFormChange(values) {
    console.log(values);
  }
  async function onFormSubmit(values) {
    console.log("submit", values);
    try {
      values.passport_expiry_date = null;
      if (passportExpiryDate !== null) {
        console.log("here passportExpiryDate");
        if (passportExpiryDate && typeof passportExpiryDate !== "string") {
          values.passport_expiry_date =
            passportExpiryDate.format("YYYY-MM-DD") + "T00:00:00.000Z";
        }
        console.log(values.passport_expiry_date);
      }
      values.form = "summerfest";
      values.completion_time = moment().utcOffset(8, false).format();
      console.log(values);
      const response = await toast.promise(
        fetch(`/api/wicf/form`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }),
        {
          pending: "Registering....",
          error: "Request failed",
        },
      );
      const res = await response.json();
      if (res.isError === true) {
        toast.error(res.message);
      } else if (res.data.id !== undefined) {
        toast.success(res.message);
        setIsDone(true);
      } else {
        toast.error("General error, contact admin");
      }
    } catch (e) {
      toast.error("An Error occurred try reload the page");
      console.log(e);
    }
  }
  function onFormSubmitFailed(formData) {
    console.log("Form failed", formData);
    if (formData.values.firstname === undefined) {
    }
  }
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
        ref={formRef}
        css={css`
          scroll-snap-align: start;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          // flex: 1;
          // border: 1px solid red;
          align-items: center;
          // justify-content: center;
          // padding-top: 20px;
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
            level={3}
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
            onValuesChange={onFormChange}
            css={css`
              min-height: 100%;
              padding: 0px 40px;
              width: 100%;
              max-width: 1200px;
            `}
          >
            <Paragraph
              ref={formTopRef}
              css={css`
                // border: 1px solid red;
                width: 100%;
                padding: 15px 0px;
                text-align: center;
              `}
            >
              <span>Register for the Summerfest</span>
              <br />
              Please fill your information accurately
            </Paragraph>
            <Form.Item
              hidden
              name="id"
              label="Id"
              // rules={[
              //   { required: true, message: "Please enter your Id" },
              // ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="first_name"
              label="First Name"
              rules={[
                { required: true, message: "Please enter your first name" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="last_name"
              label="Last Name"
              rules={[
                { required: true, message: "Please enter your last name!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="nationality"
              label="Country"
              rules={[
                { required: true, message: "Please enter your nationality" },
              ]}
            >
              <Select options={countries} />
            </Form.Item>
            <Form.Item
              name="phone_number"
              label="Phone Number"
              rules={[
                {
                  required: true,
                  message: "Please enter a valid phone number",
                  min: 11,
                  max: 11,
                },
              ]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              name="passport_number"
              label="Passport Number"
              rules={[
                {
                  required: true,
                  message: "Please enter your passport number!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="passport_expiry_date"
              label="Passport Expiry Date"
              rules={[
                {
                  required: true,
                  message: "Please enter your passport expiry date!",
                },
              ]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                value={passportExpiryDate}
                onChange={(value) => {
                  console.log(value);
                  setPassportExpiryDate(value);
                }}
              />
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
                  // column-gap: 2px;
                  width: 100%;
                `}
              >
                <Button
                  type="primary"
                  css={css`
                    width: 200px;
                  `}
                  htmlType="submit"
                >
                  Register
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
              level={3}
              css={css`
                font-size: 25px;
                text-align: center;
              `}
            >
              Thank you
            </span>
            <span
              level={3}
              css={css`
                font-size: 25px;
                text-align: center;
              `}
            >
              You have registered successfully
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
export default Page;

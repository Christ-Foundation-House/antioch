/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
// import WicfLogo from "@/assets/images/wicf/wicf-logo.png";
// import useScrollSnap from "react-use-scroll-snap";
// import useScrollSnap from "./useScrollSnap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
// import Image from "next/image";
import {
  // Input,
  Input,
  Button,
  Typography,
  Form,
  // TreeSelect,
  // Radio,
  Select,
  // Cascader,
  DatePicker,
  // InputNumber,
  // Switch,
  // Space,
} from "antd";
const { TextArea } = Input;

import { useState, useRef, useEffect } from "react";
import moment from "moment";
import shared_ministries from "@/shared/shared_ministries";
import shared_countries from "@/shared/shared_countries";
import shared_universities from "@/shared/shared_universities";
import { shared_marital_status_options } from "@/shared/shared_marital_status";
import dayjs from "dayjs";
const {
  // Title,
  Paragraph,
} = Typography;
const dateFormat = "YYYY-MM-DD";

const countries = [];
shared_countries.map((c) => {
  let country = {
    label: c.name,
    value: c.code,
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
  // const scrollRef = useRef(null);
  // useScrollSnap({
  //   ref: scrollRef,
  //   duration: 10,
  //   delay: 1,
  // });
  const router = useRouter();
  const { member_new } = router.query;
  const [formTitle] = useState("WICF Registration");
  const [isStudent, setIsStudent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [otherUniversity, setOtherUniversity] = useState("");
  const formRef = useRef();
  const searchRef = useRef();
  const formTopRef = useRef();
  const [form] = Form.useForm();
  // const [radioValue, setRadioValue] = useState(1);
  const [isNewMember, setIsNewMember] = useState(true);
  const [birthday, setBirthday] = useState(null);

  function onFormChange(values) {
    // console.log(values);
    if (values.occupation && values.occupation === "student") {
      setIsStudent(true);
    }
    if (values.occupation && values.occupation !== "student") {
      setIsStudent(false);
    }
  }
  async function onFormSubmit(values) {
    console.log("submit", values);
    try {
      // values.birthday = values.birthday.format("YYYY/MM/DD");
      // console.log(typeof birthday);
      // values.birthday = values.birthday ? values.birthday.utc().format() : null;
      values.birthday = null;
      if (birthday !== null) {
        console.log("here birthday");
        if (birthday && typeof birthday !== "string") {
          values.birthday =
            // moment(birthday).startOf("day").toISOString();
            // birthday.utc().format("YYYY-MM-DD") + "T00:00:00.000Z";
            birthday.format("YYYY-MM-DD") + "T00:00:00.000Z";
          // values.birthday = birthday.format();
        }
        console.log(values.birthday);
      }
      values.completion_time = moment().format;
      console.log(values);
      const response = await toast.promise(
        fetch(`/api/wicf/member`, {
          method: isNewMember ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }),
        {
          pending: "Updating....",
          // success: "Successfully updated your information",
          error: "Request failed",
        },
      );
      const res = await response.json();
      if (res.isError === true) {
        toast.error(res.message);
        // form.resetFields();
      } else if (res.data.id !== undefined) {
        const member = res.data;
        toast.success(res.message);
        setPhoneNumber(member.phone_number ?? null);
        setIsNewMember(false);
        form.setFieldsValue({ ...member });
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
      // formRef.current.scrollTop = 0;
      // formTopRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }
  async function onFindMe() {
    if (phoneNumber !== null && phoneNumber !== "") {
      try {
        console.log("phoneNumber", phoneNumber);
        const response = await toast.promise(
          fetch(`/api/wicf/member?phone_number=${phoneNumber}`),
          {
            pending: "Searching....",
            // success: "Request Successful",
            error: "Request failed",
          },
        );
        // const member = await response.json();
        // if (member.id === undefined) {
        //   toast.error(
        //     "You are not registered with this number, fill the form below"
        //   );
        //   form.resetFields();
        // } else {
        //   toast.success(
        //     "You number was found, please check and update your infomation"
        //   );
        // form.setFieldsValue({ ...member });
        // formTopRef.current.scrollIntoView({ behavior: "smooth" });
        // }
        const res = await response.json();
        // console.log(res);
        if (res.isError === true) {
          toast.error(res.message);
          form.resetFields();
        } else if (res.data.user.id !== undefined) {
          const member = res.data.user;
          toast.success(res.message);
          console.log(member);
          // member.birthday = member.birthday.format();
          // member.birthday = moment(member.birthday);
          if (member.birthday !== null) {
            // setBirthday(moment(member.birthday));
            setBirthday(dayjs(member.birthday, dateFormat));
          }
          delete member.birthday;
          console.log(member);
          setIsNewMember(false);
          form.setFieldsValue({ ...member });
          setIsStudent(member.occupation === "student" ? true : false);
          setOtherUniversity(member.university);
          // formTopRef.current.scrollIntoView({ behavior: "smooth" });
          formRef.current.scrollIntoView({ behavior: "smooth" });
        } else {
          toast.error("General error, contact admin");
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      toast.info("Please Enter a Phone number");
    }
  }
  function onNewMember() {
    console.log("phoneNumber", phoneNumber);
    setBirthday(null);
    setIsNewMember(true);
    form.resetFields();
    setOtherUniversity(null);
    formRef.current.scrollIntoView({ behavior: "smooth" });
    if (phoneNumber !== null) {
      form.setFieldsValue({ phone_number: phoneNumber });
    }
  }
  useEffect(() => {
    console.log("member_new", member_new);
    if (member_new === "true") {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [member_new]);
  return (
    <div
      // ref={scrollRef}
      css={css`
        display: flex;
        flex-direction: column;
        width: 100%;
        // height: 100vh;
        // overflow: scroll;
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
        ref={searchRef}
        css={css`
          scroll-snap-align: end;
          display: flex;
          flex-direction: column;
          height: 100vh;
          align-items: center;
          justify-content: center;
          // border: 1px solid red;
        `}
      >
        <img
          // loader={MainLogo}
          src={"https://maravianwebservices.com/images/wicf/assets/logo2.png"}
          alt="WICF Logo"
          width={200}
          height={200}
          css={css`
            padding: 0px;
            margin: 0px;
            background-size: contain;
          `}
        />
        {/* <span>DOZ & SOF Registration</span> */}
        <span
          level={3}
          css={css`
            // border: 1px solid red;
            font-size: 25px;
            // color: red;
          `}
        >
          {formTitle}
        </span>
        <Input
          type="number"
          value={phoneNumber}
          onChange={(e) => {
            // console.log(e.target.value);
            setPhoneNumber(e.target.value);
          }}
          placeholder="Phone number"
          css={css`
            width: 580px;
            max-width: 80%;
            // border: 1px solid red;
          `}
        />
        <div
          css={css`
            display: flex;
            padding: 10px;
            gap: 0px 10px;
            // border: 1px solid red;
          `}
        >
          <Button type="primary" onClick={onFindMe}>
            Find Me By Number
          </Button>
          <Button type="default" onClick={onNewMember}>
            New Member
          </Button>
        </div>
      </div>
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
          justify-content: center;
          // padding-top: 20px;
          position: relative;
        `}
      >
        <div
          css={css`
            display: flex;
            // border-top: 1px solid grey;
            border-bottom: 1px solid grey;
            height: fit-content;
            width: 100%;
            align-items: center;
            justify-content: center;
            position: -webkit-sticky; /* Safari */
            position: sticky;
            top: 0;
            // background-color: red;
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
            `}
          >
            {formTitle}
          </span>
        </div>
        <Form
          // labelCol={{
          //   span: 5,
          // }}
          // wrapperCol={{
          //   span: 14,
          // }}
          scrollToFirstError={true}
          form={form}
          layout="vertical"
          onFinish={onFormSubmit}
          onFinishFailed={onFormSubmitFailed}
          onValuesChange={onFormChange}
          css={css`
            // border: 1px solid red;
            // flex-grow: 1;
            min-height: 100%;
            padding: 0px 40px;
            // overflow: scroll;
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
            {isNewMember == true ? (
              <>
                <span>Welcome to WICF</span>
                <br />
              </>
            ) : null}
            Please {isNewMember == true ? "fill" : "change"} your information
            accurately
          </Paragraph>
          {/* <Form.Item></Form.Item> */}
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
            label="Nationality"
            // rules={[
            //   { required: true, message: "Please enter your nationality" },
            // ]}
          >
            <Select options={countries} />
          </Form.Item>
          <Form.Item
            name="occupation"
            label="Occupation"
            // rules={[
            //   { required: true, message: "Please enter your occupation" },
            // ]}
          >
            <Select>
              <Select.Option value="student">Student</Select.Option>
              <Select.Option value="non_student">Non-Student</Select.Option>
            </Select>
          </Form.Item>
          {isStudent ? (
            <>
              <Form.Item
                name="university"
                label="University"
                rules={[
                  { required: true, message: "Please enter your university" },
                ]}
                // value={uni}
              >
                {/* <Radio.Group
                  value={radioValue}
                  onChange={(e) => {
                    setRadioValue(e.target.value);
                  }}
                >
                  <Space direction="vertical">
                    <Radio value="Wuhan University">Wuhan University</Radio>
                    <Radio value="Jiangsu University">Jiangsu University</Radio>
                    <Radio value="Wuhan University Of Science And Technology">
                      Wuhan University Of Science And Technology
                    </Radio>
                    <Radio value="Hubei University Of Technology">
                      Hubei University Of Technology
                    </Radio>
                    <Radio value={otherUniversity}>
                      Other
                      <Input
                        style={{ width: "fit-content", marginLeft: 10 }}
                        onChange={(e) => {
                          form.setFieldValue("university", e.target.value);
                          setOtherUniversity(e.target.value);
                        }}
                        rules={[
                          {
                            required: true,
                            message: "Please enter university",
                          },
                        ]}
                      />
                    </Radio>
                  </Space>
                </Radio.Group> */}
                <>
                  <Select
                    value={otherUniversity}
                    onChange={(value) => {
                      setOtherUniversity(value);
                      form.setFieldValue("university", value);
                      form.setFieldValue("university_campus", "");
                    }}
                    options={universities}
                  />
                  {otherUniversity === "Other" ? (
                    <Input
                      required
                      placeholder="Enter your university or select from the list"
                      onChange={(e) => {
                        form.setFieldValue("university", e.target.value);
                        // setOtherUniversity(n);
                      }}
                    />
                  ) : null}
                </>
              </Form.Item>
              <Form.Item
                name="university_campus"
                label="University Campus"
                // rules={[{ required: true, message: "Please your university campus" }]}
              >
                <Input />
              </Form.Item>
            </>
          ) : null}
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
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please enter your email" }]}
          >
            <Input type="email" />
          </Form.Item>
          <Form.Item
            name="wechat_id"
            label="Wechat Id"
            rules={[{ required: true, message: "Please enter your wechat Id" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="is_requesting_salvation_rededication"
            label="Would you like to commit/rededicate your life to Christ?"
            // rules={[{ required: true, message: "Please Input here!" }]}
          >
            <Select>
              <Select.Option value={true}>Yes</Select.Option>
              <Select.Option value={false}>No</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="ministry_of_interest"
            label="Ministry of interest"
            // rules={[
            //   {
            //     required: true,
            //     message: "Please select your ministry of interest",
            //   },
            // ]}
          >
            {/* <Select>
              <Select.Option value="none_for_now">None for now</Select.Option>
              <Select.Option value="sof">SOF</Select.Option>
              <Select.Option value="doz">DOZ</Select.Option>
              <Select.Option value="prayer">Prayer</Select.Option>
              <Select.Option value="media">Media</Select.Option>
              <Select.Option value="literature_translation">
                Literature & Translation
              </Select.Option>
              <Select.Option value="evangelism">Evangelism</Select.Option>
              <Select.Option value="bible_study">Bible Study</Select.Option>
              <Select.Option value="artistic">Artistic</Select.Option>
              <Select.Option value="organizing">Organizing</Select.Option>
              <Select.Option value="worship">Worship</Select.Option>
              <Select.Option value="academic">Academic</Select.Option>
              <Select.Option value="children">Children Ministry</Select.Option>
            </Select> */}
            <Select options={shared_ministries} />
          </Form.Item>
          <Form.Item
            name="is_requesting_prayer"
            label="Would you like one of the leaders to pray with you?"
            // rules={[{ required: true, message: "Please Input here" }]}
          >
            <Select>
              <Select.Option value={true}>Yes</Select.Option>
              <Select.Option value={false}>No</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="suggestion_prayer_request"
            label="Prayer Request"
            // rules={[{ required: true, message: "Please your prayer request!" }]}
          >
            {/* <Input /> */}
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            // name="birthday"
            label="Birthday"
            // value={birthday}
            // valuePropName={"birthday"}
            // rules={[{ required: true, message: "Please enter your birthday!" }]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              value={birthday}
              onChange={(value) => {
                console.log(value);
                setBirthday(value);
              }}
            />
          </Form.Item>
          <Form.Item
            name="marital_status"
            label="Marital Status"
            // rules={[
            //   { required: true, message: "Please enter your marital status" },
            // ]}
          >
            {/* <Select>
              <Select.Option value="single">Single</Select.Option>
              <Select.Option value="in_relationship">
                In a relationship
              </Select.Option>
              <Select.Option value="engaged">Engaged</Select.Option>
              <Select.Option value="married">Married</Select.Option>
            </Select> */}
            <Select options={shared_marital_status_options} />
          </Form.Item>
          <Form.Item
            // name="current_location"
            name="is_in_china"
            label="Current Location"
            // rules={[{ required: true, message: "Please enter your location" }]}
          >
            <Select>
              <Select.Option value={true}>China</Select.Option>
              <Select.Option value={false}>Outside China</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            css={css`
              display: flex;
              // border: 1px solid red;
              align-items: center;
              justify-content: center;
            `}
          >
            <div
              css={css`
                // flex: 1;
                display: flex;
                // border: 1px solid red;
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
                {isNewMember ? "Register" : "Update"}
              </Button>
              <Button
                // type="ghost"
                css={css`
                  // margin-left: 20px;
                  width: 200px;
                `}
                // htmlType="submit"
                onClick={() => {
                  if (isNewMember === true) {
                    setPhoneNumber(form.getFieldValue("phone_number"));
                    searchRef.current.scrollIntoView({ behavior: "smooth" });
                    toast.info(
                      "To update please find you information by phone number first",
                    );
                  } else {
                    setIsNewMember(true);
                  }
                }}
              >
                {isNewMember ? "Switch to Update" : "Switch to Register"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
export default Page;

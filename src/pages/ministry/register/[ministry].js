/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import React from "react";
// import WicfLogo from "@/assets/images/wicf/wicf-logo.png";
// import useScrollSnap from "react-use-scroll-snap";
// import useScrollSnap from "./useScrollSnap";
// import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
// import Image from "next/image";
import {
  // Input,
  Input,
  Button,
  Modal,
  // Typography,
  // Form,
  // TreeSelect,
  // Radio,
  // Select,
  // Cascader,
  // DatePicker,
  // InputNumber,
  // Switch,
  // Space,
} from "antd";
// const { TextArea } = Input;
import { toast } from "react-toastify";
import { useState, useRef, useEffect } from "react";
// import moment from "moment";
import shared_universities from "@/shared/shared_universities";
import shared_countries from "@/shared/shared_countries";
import shared_ministries from "@/shared/shared_ministries";
// const {
//   // Title,
//   Paragraph,
// } = Typography;

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
  const router = useRouter();
  const { query } = useRouter();
  const [formTitle, setFormTitle] = useState("Choir Registration");
  const [phoneNumber, setPhoneNumber] = useState(null);
  const formRef = useRef();
  const searchRef = useRef();
  const [isMember, setIsMember] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [wicfUserId, setWicfUserId] = useState();
  // const formTopRef = useRef();
  // const [isNewMember, setIsNewMember] = useState(true);
  // const [birthday, setBirthday] = useState(null);
  // const [form, setForm] = useState(null);
  // const [form, setForm] = useState(WorshipRegistration);
  const [ministry, setMinisty] = useState(null);
  const [initialFormValues, setInitialFormValues] = useState({});

  async function onFindMe() {
    if (phoneNumber !== null && phoneNumber !== "") {
      try {
        console.log("phoneNumber", phoneNumber);
        const response = await toast.promise(
          fetch(
            `/api/wicf/member?phone_number=${phoneNumber}&ministry=worship`,
          ),
          {
            pending: "Searching....",
            // success: "Request Successful",
            error: "Request failed",
          },
        );
        const res = await response.json();
        if (res.isError === true) {
          toast.error(res.message);
          setWicfUserId(null);
          setIsMember(false);
          setInitialFormValues(null);
        } else if (res.data.user.id !== undefined) {
          setWicfUserId(res.data.user.id);
          const member = res.data;
          toast.success(res.message);
          if (!member.user_ministries.worship) {
            setIsMember(false);
            onModalOpen();
            // toast.error(
            //   "You are not a member of this ministry, please join first"
            // );
          } else {
            const ministryData = member.user_ministries;
            console.log("ministryData", ministryData);
            setInitialFormValues(ministryData);
            setIsMember(true);
            setTimeout(() => {
              if (ministry?.form_registration) {
                formRef.current.scrollIntoView({ behavior: "smooth" });
              } else {
                toast.error(
                  `There is no form for registration for this ministry`,
                );
              }
            }, 500);
          }
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
    router.push({
      pathname: "/register",
      query: { member_new: true },
    });
  }
  function onSelectMinistry() {
    router.push({
      pathname: "/ministry/register",
    });
  }
  async function onJoinMinistry() {
    try {
      setIsModalLoading(true);
      const response = await toast.promise(
        fetch(`/api/wicf/member`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: JSON.stringify({
            id: wicfUserId,
            ministry: "worship",
          }),
        }),
        {
          pending: "Joining....",
          // success: "Request Successful",
          error: "Request failed",
        },
      );
      const res = await response.json();
      setIsModalLoading(false);
      console.log(res);
      if (!res || res.isError === true) {
        toast.error(res.message ?? "Failed to join Ministry, Contact Admin");
      } else if (res.data.user_ministries.worship) {
        setIsMember(true);
        setInitialFormValues(res.data.user_ministries);
        setTimeout(() => {
          formRef.current.scrollIntoView({ behavior: "smooth" });
        }, 500);
        toast.success("Welcome to Worship Ministry");
        onModalClose();
      }
    } catch (e) {
      console.log(e);
      toast.error("Failed to join Ministry, Contact Admin");
    }
  }
  function onModalOpen() {
    setIsModalOpen(true);
  }
  function onModalClose() {
    setIsModalOpen(false);
  }
  useEffect(() => {
    const _ministry = query?.ministry;
    // console.log("ministry:", _ministry);
    const m = shared_ministries.find((m) => m.value === _ministry);
    if (m) {
      console.log(m);
      setMinisty(m);
      setFormTitle("Join " + m?.label + " Ministry");
      if (m?.form) {
        // setForm(ministry.form);
      }
    } else {
      setMinisty(null);
    }
  }, [ministry, query]);
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
      <Modal
        title="Join Worship Ministry"
        open={isModalOpen}
        onOk={onJoinMinistry}
        confirmLoading={isModalLoading}
        onCancel={onModalClose}
        okText="Join"
      >
        <span>
          You are not a member of the Worship Ministry, Would you like to Join?
        </span>
      </Modal>
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
          {ministry === null ? "Please select a valid ministry" : formTitle}
        </span>
        {ministry === null ? null : (
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
        )}
        <div
          css={css`
            display: flex;
            padding: 10px;
            gap: 0px 10px;
            // border: 1px solid red;
          `}
        >
          {ministry === null ? (
            <Button type="primary" onClick={onSelectMinistry}>
              Select ministry
            </Button>
          ) : (
            <Button type="primary" onClick={onFindMe}>
              Find Me By Number
            </Button>
          )}
          <Button type="default" onClick={onNewMember}>
            New WICF Member
          </Button>
        </div>
      </div>
      {isMember && ministry?.form_registration ? (
        <div
          ref={formRef}
          css={css`
            scroll-snap-align: start;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            align-items: center;
            justify-content: flex-start;
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
              position: -webkit-sticky;
              position: sticky;
              top: 0;
              z-index: 1;
              backdrop-filter: blur(10px);
            `}
          >
            <img
              src={
                "https://maravianwebservices.com/images/wicf/assets/logo2.png"
              }
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
              {formTitle ?? ""}
            </span>
          </div>
          {ministry.form_registration ?? null}
          {React.createElement(ministry.form_registration, {
            initialFormValues,
          })}
        </div>
      ) : null}
    </div>
  );
}
export default Page;

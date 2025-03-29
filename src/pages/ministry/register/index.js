/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import {
  // ToastContainer,
  toast,
} from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
// import Image from "next/image";
import {
  // Input,
  Button,
  // Typography,
  Select,
} from "antd";
// const { TextArea } = Input;

import { useState } from "react";
import shared_universities from "../../../shared/shared_universities";
import shared_countries from "../../../shared/shared_countries";
import shared_ministries from "@/shared/shared_ministries"; // type_shared_ministries,

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
  const [ministry, setMinistry] = useState(null);
  const [formTitle] = useState("Choose a ministry to join");
  function onNewMember() {
    router.push({
      pathname: "/register",
      query: { member_new: true },
    });
  }
  function onJoinMinistry() {
    if (ministry === null || ministry === "") {
      toast.info("Please select a ministry");
    } else {
      console.log(ministry);
      if (shared_ministries.map((ministry) => ministry.value === ministry)) {
        // do something
        // toast.success(ministry);
        router.push(`/ministry/register/${ministry}`);
      }
    }
  }
  return (
    <div
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
      {/* <ToastContainer
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
      /> */}
      <div
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
        <Select
          placeholder="Select Ministry"
          value={ministry}
          options={shared_ministries}
          onChange={(value) => {
            // console.log(value);
            setMinistry(value);
          }}
          css={css`
            width: 580px;
            max-width: 80%;
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
          <Button type="primary" onClick={onJoinMinistry}>
            Join Ministry
          </Button>
          <Button type="default" onClick={onNewMember}>
            New WICF Member
          </Button>
        </div>
      </div>
    </div>
  );
}
export default Page;

/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import Head from "next/head";
import Link from "next/link";

import {
  // Input,
  Button,
} from "antd";
import {
  // SnippetsOutlined,
  // SnippetsFilled,
  // AudioOutlined,
  // TeamOutlined,
  // FireOutlined,
  // ReadOutlined,
  ShoppingOutlined,
  PictureOutlined,
  AppstoreAddOutlined,
  FireOutlined,
  FlagOutlined,
  SnippetsOutlined,
  FormOutlined,
  HighlightOutlined,
  TeamOutlined,
  // SnippetsOutlined,
} from "@ant-design/icons";
import { Montserrat } from "next/font/google";
import { DeviceScreen } from "@/styles/theme";
const font = Montserrat({ subsets: ["latin"] });

// const background = [
//   `background-image: radial-gradient(circle,#1c1b36,#1e2041,#1f244d,#1f2a59,#1c2f66,#1a2f68,#172f6b,#142f6d,#142a65,#14255e,#132156,#121c4f);`,
//   `background-image: radial-gradient(circle, #000000, #000000, #000000, #000000, #000000, #000000, #000000, #000000, #000000, #000000, #000000, #000000);`,
//   `background-image: linear-gradient(to left bottom, #000000, #080003, #0d000a, #0e0012, #0b0218, #0b0218, #0b0218, #0b0218, #0e0012, #0d000a, #080003, #000000);`,
//   `background-image: linear-gradient(to left bottom, #0f0f0f, #141417, #17181d, #181c24, #19212b, #19212b, #19212b, #19212b, #181c24, #17181d, #141417, #0f0f0f);`,
// ];

// function MiddleLink(props) {
//   return (
//     <Link href={props.href ?? ""}>
//       <span
//         css={css`
//           color: white;
//         `}
//       >
//         {props.title}
//       </span>
//     </Link>
//   );
// }
// function Header() {
//   return (
//     <div
//       css={css`
//         color: white;
//         display: flex;
//         align-items: center;
//         justify-content: space-between;
//         // padding: 0px 10px;
//         height: 50px;
//         // border-bottom: 1px solid #f0edff;
//       `}
//     >
//       <span
//         css={css`
//           font-weight: 700;
//           font-size: 24px;
//         `}
//       >
//         WICF
//       </span>
//       <div>{/* <span>WICF</span> */}</div>
//       <div
//         css={css`
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           column-gap: 20px;
//           // border: 1px solid red;
//           flex: 1;
//         `}
//       >
//         <MiddleLink title="Photos" href="" />
//         <MiddleLink title="Bible Study" href="" />
//       </div>
//       <Button
//         type="ghost"
//         css={css`
//           background: transparent;
//           color: #fbfbfb;
//           height: fit-content;
//           border: 1px solid white;
//           border-radius: 20px;
//         `}
//       >
//         Sign In
//       </Button>
//     </div>
//   );
// }

function Title() {
  return (
    <div
      css={css`
        // border: 1px solid white;
        flex: 1;
        // width: 100%;
        display: flex;
        flex-direction: column;
        text-align: center;
        align-items: center;
        justify-content: center;
        // height: : 1700px;
        max-width: 700px;
      `}
    >
      <h3
        className={font.className}
        css={css`
          color: white;
          font-size: 42px;
          font-weight: 700;
          max-width: 650px;
          margin-bottom: 5px;
          // border: 1px solid red;
        `}
      >
        WICF
      </h3>
      <p
        className={font.className}
        css={css`
          max-width: 400px;
        `}
      >
        Welcome to your home away from home, Join us physically or online
      </p>
      <br />
      <div
        css={css`
          display: flex;
          // width: 500px;
          // border: 1px solid red;
          justify-content: center;
          column-gap: 20px;
          row-gap: 10px;
          flex-wrap: wrap;
        `}
      >
        <Link href={"/location"}>
          <Button
            type="primary"
            css={css`
              // background: #1e2145;
              background: #fbfbfb;
              color: #0f0f0f;
              font-size: 24px;
              height: fit-content;
              border: none;
              border-radius: 20px;
              font-weight: 500;
              width: 200px;
            `}
          >
            Sunday Location
          </Button>
        </Link>
        <Link href={"/live"} passHref>
          <Button
            // type="ghost"
            css={css`
              // background: #1e2145;
              // background: #0f0f0f;
              background: transparent;
              color: #fbfbfb;
              font-size: 24px;
              height: fit-content;
              border: 1px solid white;
              border-radius: 20px;
              font-weight: 500;
              width: 200px;
            `}
          >
            Join Online Live
          </Button>
        </Link>
      </div>
    </div>
  );
}
function Feature(props) {
  return (
    <Link href={props.href}>
      <div
        className={font.className}
        css={css`
          width: 150px;
          min-height: 150px;
          // border: 1px solid #212122;
          border: 1px solid #2c2c2d;
          // border-radius: 0px 25px 0px 0px;
          border-radius: 20px;
          // background: #0b0218;
          color: white;
          display: flex;
          flex-direction: column;
          // align-items: center;
          // padding: 20px 15px;
          align-items: center;
          text-align: center;
          padding: 5px;
          ${DeviceScreen.mobile} {
            width: 100%;
          }
        `}
      >
        <div
          css={css`
            height: 70px;
            width: 70px;
            background: #1f1f1f;
            border-radius: 15px;
            margin-bottom: 10px;
            font-size: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          {props.icon}
        </div>
        <span
          css={css`
            font-size: 16px;
            font-weight: 700;
            padding-bottom: 2px;
            // height: 80px;
          `}
        >
          {props.title}
        </span>
        <span>{props.description}</span>
      </div>
    </Link>
  );
}
function Featured() {
  return (
    <div
      css={css`
        // border: 1px solid white;
        width: 100%;
        color: white;
        // height: 200px;
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        column-gap: 50px;
        padding-bottom: 20px;
        flex-wrap: wrap;
        padding-top: 20px;
        gap: 10px;
      `}
    >
      <Feature
        // icon={<SnippetsFilled />}
        icon={<SnippetsOutlined />}
        title="Welcome to WICF"
        href="/register2"
        description="Update your information"
        // description="Are you an existing member of wicf, click here to register or update your information."
      />
      <Feature
        icon={<HighlightOutlined />}
        title="Questions & Answers"
        href="/qa"
        description="Ask Discipleship questions & find previous answers"
      />
      {/* <Feature
        icon={<HighlightOutlined />}
        title="Academic Summit 2024"
        href="/academic_summit_2024"
        description="Be inspired.Be empowered!"
      /> */}
      {/* <Feature
        icon={<TeamOutlined />}
        title="Join A Ministry"
        href="ministry/register"
        description="Are you already a member of WICF, join a ministry to serve."
      />
      <Feature
        icon={<FireOutlined />}
        title="Prayer Request"
        href="prayer/request"
        description="Submit your prayer request, for the prayer ministry and elders will pray together with you."
      /> */}
      {/* <Feature
        icon={<TeamOutlined />}
        title="Register for Summerfest"
        href="forms/summerfest"
        description="Fill the form to register for the summerfest"
      />
      <Feature
        icon={<ReadOutlined />}
        title="Register for Academic Summit"
        href="forms/academic_summit"
        description="Register for Academic Summit on 16 September, 2023"
      /> */}
      {/* <Feature
        icon={<TeamOutlined />}
        title="Register for the Workers Training"
        href="forms/workers_training"
        description="Register for the Workers TrainingNovember 4th, from 2pm to 4pm FCC platform"
      /> */}
      <Feature
        icon={<PictureOutlined />}
        title="WICF Photos"
        href="/photos"
        description="Photos of WICF Family"
      />
      <Feature
        icon={<AppstoreAddOutlined />}
        title="Dashboard"
        href="/dashboard"
        description="Manage your WICF"
      />
      <Feature
        icon={<ShoppingOutlined />}
        title="BrownBag24"
        href="/bb24"
        description="Welcome to Brown Bag 2024"
      />
      <Feature
        icon={<FireOutlined />}
        title="Prayer Request"
        href="/forms/prayer"
        description="Submit prayer request"
      />
      <Feature
        icon={<FlagOutlined />}
        title="Feedback"
        href="/forms/feedback"
        description="Submit your feedback"
      />
      <Feature
        icon={<FormOutlined />}
        title="Form Builder"
        href="/forms/form_builder"
        description="Build WICF Forms"
      />
      <Feature
        icon={<TeamOutlined />}
        title="Leadership"
        href="/leadership"
        description="WICF Leadership"
      />
    </div>
  );
}
function Content() {
  return (
    <div
      css={css`
        flex: 1;
        display: flex;
        flex-direction: column;
        // border: 1px solid red;
        // padding-top: 50px;
        overflow: hidden;
        align-items: center;
      `}
    >
      <Title />
      <Featured />
    </div>
  );
}

function Footer() {
  return null;
}

function Page() {
  return (
    <>
      {/* <Head>
        <title>Wuhan ICF</title>
        <meta name="description" content="Home away from home" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head> */}
      <main
        className={font.className}
        css={css`
          color: white;
          // border: 1px solid white;
          // min-height: 100vh;
          display: flex;
          flex-direction: column;
          // padding: 0px 20px;
          width: 99%;
          overflow: hidden;
          justify-self: center;
          align-self: center;
        `}
      >
        {/* <Head /> */}
        <Content />
        <Footer />
      </main>
    </>
  );
}

// export async function getServerSideProps() {
//   return {
//     redirect: {
//       destination: "/register",
//       permanent: false,
//     },
//   };
// }

export default Page;

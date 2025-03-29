/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import Link from "next/link";
import Header from "@/header/Header";
import { DeviceScreen } from "@/styles/theme";
import Footer from "@/footer/Footer";

export function MiddleLink(props) {
  return (
    <Link href={props.href ?? ""}>
      <span
        css={css`
          color: white;
        `}
      >
        {props.title}
      </span>
    </Link>
  );
}

export function LayoutMain({ children }) {
  return (
    <div
      css={css`
        // border: 2px solid green;
        height: 100vh;
        // width: 100vw;
        width: 100%;
        // overflow: hidden;
        display: flex;
        flex-direction: column;
      `}
    >
      {/* <Header /> */}
      <Header />
      <main
        css={css`
          // border: 1px solid blue;
          padding-bottom: 0px;
          display: flex;
          flex-grow: 1;
          align-items: center;
          justify-content: center;
          padding: 0px 0px;
          ${DeviceScreen.mobile} {
            padding: 0px 5px;
          }
        `}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default LayoutMain;

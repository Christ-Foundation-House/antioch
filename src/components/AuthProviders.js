/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { GithubOutlined, GoogleOutlined, AppleFilled } from "@ant-design/icons";
import { Button } from "antd";
import {
  // useSession,
  // getSession,
  signIn,
} from "next-auth/react";

function AuthProviders() {
  return (
    <div
      // className="sign-up-gateways"
      css={css`
        // border: 1px solid red;
        display: flex;
        width: 100%;
        column-gap: 2px;
        align-items: center;
        justify-content: space-around;
        padding-bottom: 5px;
        color: red;
      `}
    >
      <Button type="default" onClick={() => signIn("github")}>
        <GithubOutlined style={{ fontSize: 20 }} />
      </Button>
      <Button disabled type="default" onClick={() => signIn()}>
        <GoogleOutlined style={{ fontSize: 20 }} />
      </Button>
      <Button disabled type="default" onClick={() => signIn()}>
        <AppleFilled style={{ fontSize: 20 }} />
      </Button>
    </div>
  );
}

export default AuthProviders;

/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import // useSession,
// getSession,
"next-auth/react";
// import { useEffect } from "react";
import Link from "next/link";
import { DeviceScreen } from "@/styles/theme";
import UserMenu from "@/header/userMenu";

export function Header() {
  // const { data: session } = useSession();
  // useEffect(() => {
  //   console.log(session);
  // }, [session]);
  return (
    <div
      css={css`
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        // padding: 0px 10px;
        // border-bottom: 1px solid #f0edff;
        // position: sticky;
        width: 100%;
        top: 0;
        z-index: 1;
        backdrop-filter: blur(10px);
        padding: 20px 20px;
        height: 50px;
        // margin-top: -50px;
        // background-color: #010409;
      `}
    >
      <Link href="/">
        <span
          css={css`
            font-weight: 700;
            font-size: 24px;
            color: white;
            opacity: 1;
            &:hover {
              opacity: 0.7;
            }
          `}
        >
          WICF
        </span>
      </Link>
      {/* <div><span>WICF</span></div> */}
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: center;
          column-gap: 20px;
          flex: 1;
          ${DeviceScreen.mobile} {
            display: none;
          }
        `}
      >
        {/* <MiddleLink title="Photos" href="" />
          <MiddleLink title="Bible Study" href="" /> */}
      </div>
      {/* <Link href="/sign-in">
          <Button
            type="ghost"
            css={css`
              background: transparent;
              color: #fbfbfb;
              height: fit-content;
              border: 1px solid white;
              border-radius: 20px;
            `}
          >
            {session?.user?.name ?? `Sign In`}
          </Button>
        </Link> */}
      <UserMenu />
    </div>
  );
}

export default Header;

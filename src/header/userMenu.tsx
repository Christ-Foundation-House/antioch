/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import IconProfile from "@/icon/iconProfile";
import { Button, Tooltip, Card, Avatar, Image } from "antd";
import Link from "next/link";
import {
  useSession,
  // signIn,
  signOut,
} from "next-auth/react";
// import { DeviceScreen } from "@/styles/theme";
import { ReactNode, useState } from "react";
import { useRouter } from "next/router";

interface userMenuItemType {
  icon?: ReactNode;
  label: string;
  link?: string;
  onClick?: () => void;
}
const UserMenuItems: userMenuItemType[] = [
  {
    label: "Home",
    link: "/",
  },
  {
    label: "Dashboard",
    link: "/dashboard",
  },
  {
    label: "My Account",
    link: "/dashboard/account",
  },
  {
    label: "Sign Out",
    onClick: () => {
      signOut();
    },
  },
];
function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      {!session ? (
        <div
          style={{
            display: "flex",
            // gap: 5,
            // border: "1px solid red"
          }}
        >
          {/* <Link href="/sign-up"> */}
          <Link href="/register2">
            <Button
              type="text"
              css={css`
                color: grey;
                font-weight: 600;
                height: fit-content;
                border: 1px solid white;
                border-radius: 20px;
                opacity: 1;
                border: 0;
                &:hover {
                  opacity: 0.7;
                  color: #fbfbfb !important;
                }
              `}
            >
              Register
            </Button>
          </Link>
          <Link href={`/sign-in?url=${router.pathname}`}>
            <Button
              type="link"
              css={css`
                background: #fbfbfb;
                color: black;
                font-weight: 00;
                height: fit-content;
                border: 1px solid white;
                border-radius: 20px;
                opacity: 1;
                &:hover {
                  opacity: 0.7;
                }
              `}
            >
              Sign In
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <Tooltip
            open={isOpen}
            arrow={false}
            overlayInnerStyle={{
              backgroundColor: "#19212B",
              borderRadius: "20px",
              width: "fit-content",
            }}
            trigger={"hover"}
            onOpenChange={(state) => {
              setIsOpen(state);
            }}
            title={() => (
              <Card
                bordered={false}
                bodyStyle={{
                  backgroundColor: "#181B22",
                  display: "flex",
                  flexDirection: "column",
                  color: "white",
                  borderRadius: "25px",
                }}
                css={css`
                  background-color: transparent;
                  height: fit-content;
                  padding-bottom: 20px;
                `}
              >
                <div
                  css={css`
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between;
                  `}
                >
                  <div>
                    <Avatar
                      size={74}
                      // shape="square"
                      src={session?.user?.image}
                    />
                  </div>
                  <div
                    css={css`
                      width: fit-content;
                      text-align: center;
                    `}
                  >
                    <h4>{session?.user?.name}</h4>
                    <p>
                      {session?.user?.wicf_member?.email ??
                        session?.user?.email}
                    </p>
                  </div>
                </div>
                <span
                  css={css`
                    border-top: 1px solid grey;
                    border-radius: 20px;
                  `}
                >
                  {UserMenuItems.map((item, index) => (
                    <Link href={item.link ?? "/"} key={index}>
                      <Button
                        type="link"
                        css={css`
                          width: 100%;
                          color: white;
                          opacity: 1;
                          &:hover {
                            opacity: 0.7;
                          }
                        `}
                        onClick={() => {
                          if (item.onClick) item.onClick();
                          setIsOpen(false);
                        }}
                      >
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </span>
              </Card>
            )}
          >
            <span
              css={css`
                opacity: 1;
                &:hover {
                  opacity: 0.7;
                }
              `}
            >
              {session?.user?.image ? (
                <Image
                  preview={false}
                  // width={200}
                  src={session?.user?.image}
                  style={{
                    width: 35,
                    height: 35,
                    objectFit: "cover",
                    border: "1px solid white",
                    backgroundColor: "white",
                    // position: "absolute",
                    alignSelf: "center",
                    justifySelf: "center",
                    right: 0,
                    borderRadius: 100,
                  }}
                />
              ) : (
                <IconProfile />
              )}
            </span>
          </Tooltip>
        </>
      )}
    </>
  );
}

export default UserMenu;

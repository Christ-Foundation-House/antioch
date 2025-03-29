/** @jsxImportSource @emotion/react */
import { Montserrat } from "next/font/google";
import { css } from "@emotion/react";
import { DeviceScreen } from "@/styles/theme";
import { Button, Form, Progress } from "antd";
import { useRouter } from "next/router";
const font = Montserrat({ subsets: ["latin"] });

export interface PropsReportButton {
  text?: string;
  clickText?: string;
  clickTextColor?: string;
  type?: "bug" | "general";
}
export default function ReportButton(props: PropsReportButton) {
  const router = useRouter();
  return (
    <span
      className={font.className}
      css={css`
        color: white;
        font-size: 14px;
        font-weight: 400;
        text-align: center;
        opacity: 0.6;
        ${DeviceScreen.mobile} {
          font-size: 14px;
        }
      `}
    >
      {props.text ?? "Facing any issues please "}
      <Button
        type="link"
        style={{
          fontSize: 14,
          color: props.clickTextColor ?? "white",
          fontWeight: "bold",
          padding: 0,
          textDecoration: "underline",
        }}
        onClick={() => {
          router.push({
            pathname: "/report",
            query: {
              url: router.asPath,
              type: props.type ?? "general",
            },
          });
        }}
      >
        {props.clickText ?? `Report Here`}
      </Button>
    </span>
  );
}

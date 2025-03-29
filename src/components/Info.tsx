/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { Typography } from "antd";

export interface PropsInfo {
  label: string;
  value?: string;
  isCopyable?: boolean;
  onClick?: () => void;
  color?: string;
}
export default function Info(props: PropsInfo) {
  return (
    <div
      onClick={props.onClick}
      css={css({
        span: {
          color: props.color ? `${props.color} !important` : undefined,
        },
      })}
    >
      <Typography.Text strong>{`${props.label}: `}</Typography.Text>
      <Typography.Text copyable={props.isCopyable === false ? false : true}>
        {props.value}
      </Typography.Text>
    </div>
  );
}

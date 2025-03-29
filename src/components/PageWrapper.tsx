import { Spin } from "antd";
import { CSSProperties, ReactNode } from "react";
import { PageError } from "./PageError";
import { FontMontserrat } from "@/styles/theme";
import { NextSeo } from "next-seo";

export interface PropsPageWrapper {
  width?: string;
  height?: string;
  isLoading?: boolean;
  error?: {
    code?: number | string;
    message: string;
  };
  children?: ReactNode;
  style?: CSSProperties;
  title?: string;
  description?: string;
  imageUrl?: string;
}
export const PageWrapper: React.FC<PropsPageWrapper> = (props) => {
  return (
    <>
      <NextSeo
        title={`Wuhan ICF - ${props.title}`}
        description={props.description ?? undefined}
        openGraph={{
          title: `Wuhan ICF - ${props.title}`,
          description: props.description ?? undefined,
          images: props.imageUrl
            ? [
                {
                  url: props.imageUrl,
                  width: 800,
                  height: 600,
                  alt: props.title ?? undefined,
                },
              ]
            : [],
        }}
      />
      <Spin spinning={props.isLoading === true ? true : false}>
        <div
          className={FontMontserrat.className}
          style={{
            flex: 1,
            minWidth: props.width ?? "99vw",
            minHeight: "100vh",
            display: "flex",
            ...props.style,
            // border: "1px solid red",
            // position: "relative",
            flexDirection: "column",
            // alignSelf: "center",
            // justifySelf: "center",
            // overflow: "hidden",
          }}
        >
          {props.error ? (
            <PageError message={props.error.message} />
          ) : (
            props.children
          )}
        </div>
      </Spin>
    </>
  );
};

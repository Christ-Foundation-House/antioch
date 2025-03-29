/** @jsxImportSource @emotion/react */
import { TypeLiveData, TypeLiveDataLinks } from "@/shared/shared_types";
import { css } from "@emotion/react";
import { Button, Card, Modal, Typography } from "antd";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import YouTube from "react-youtube";
import Info from "./Info";
import { EditOutlined } from "@ant-design/icons";
import { ArgsDrawerOpen, ArgsModalOpen } from "@/pages/live";
import React from "react";

export interface LiveTabsProps extends TypeLiveData {
  setCurrentLinkType: Dispatch<SetStateAction<TypeLiveDataLinks | undefined>>;
  currentLinkType: TypeLiveDataLinks | undefined;
  currentLiveData: TypeLiveData | undefined;
  tabList?: never[];
  modalOpen?: (args: ArgsModalOpen) => void;
  drawerOpen?: (args: ArgsDrawerOpen) => void;
}
export function LiveTabs(props: LiveTabsProps) {
  const onTab2Change = (key: TypeLiveDataLinks) => {
    props.setCurrentLinkType(key);
  };
  const [contentList, setContentList] =
    useState<Record<string, React.ReactNode>>();

  useEffect(() => {
    const { currentLiveData } = props;
    if (currentLiveData) {
      const youtube_link = currentLiveData.links?.youtube?.url;
      let youtube_videoId =
        youtube_link?.split("v=")[1] ?? youtube_link?.split("live/")[1];
      const contentListTemp: Record<string, React.ReactNode> = {
        youtube: (
          <YouTube
            videoId={youtube_videoId}
            style={{ width: "100%", height: "100%" }}
            iframeClassName="youtube_live"
            onError={() => {
              Modal.info({
                title: "Failed to load youtube link",
                content: "Please check your connection or vp_",
              });
            }}
          />
        ),
        fcc: (
          <div
            style={{
              minHeight: 200,
              minWidth: 200,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography.Title level={2}>Join us on FCC</Typography.Title>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <Info label={"Code"} value={currentLiveData.links?.fcc?.code} />
              <Info
                label={"Password"}
                value={currentLiveData.links?.fcc?.password}
              />
              <Button
                onClick={() => {
                  window.open(
                    `https://www.freeconferencecall.com/downloads`,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
              >
                Download FCC
              </Button>
            </div>
          </div>
        ),
        zoom: (
          <div
            style={{
              minHeight: 200,
              minWidth: 200,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography.Title level={2}>Join us on Zoom</Typography.Title>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <Info label={"Code"} value={currentLiveData.links?.zoom?.code} />
              <Info
                label={"Password"}
                value={currentLiveData.links?.zoom?.password}
              />
              <Button
                onClick={() => {
                  window.open(
                    `https://zoom.us/download`,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
              >
                Download Zoom
              </Button>
            </div>
          </div>
        ),
      };
      setContentList(contentListTemp);
    }
  }, [props.currentLiveData]);
  return (
    <Card
      bordered={false}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "transparent",
      }}
      bodyStyle={{
        flexGrow: 1,
        padding: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "black",
        color: "white",
      }}
      tabList={props.tabList}
      activeTabKey={props.currentLinkType}
      // tabBarExtraContent={<a href="#">Option</a>}
      onTabChange={onTab2Change}
      tabProps={{
        size: "middle",
        tabBarStyle: {
          color: "white",
        },
        centered: true,
      }}
      actions={[
        <Info
          key="view"
          label={"Views"}
          isCopyable={false}
          value={props.views}
        />,
        <Info
          key="online"
          label={"Online"}
          isCopyable={false}
          value={props.online}
          onClick={() => {
            props.drawerOpen && props.drawerOpen({ name: "online" });
          }}
        />,
        // <SettingOutlined
        //   key="setting"
        //   style={{ color: "white" }}
        //   onClick={() => {}}
        // />,
        <EditOutlined
          key="edit"
          style={{ color: "white" }}
          onClick={() => {
            props.modalOpen &&
              props.modalOpen({
                name: "username",
              });
          }}
        />,
      ]}
      css={css`
        .ant-tabs-tab-btn {
          color: white;
        }
        .ant-card-actions {
          background-color: transparent;
          color: white !important;
        }
      `}
    >
      {props.currentLinkType && contentList
        ? contentList[props.currentLinkType]
        : props.currentLiveData
          ? "Please select the stream type"
          : "No available link at the moment"}
    </Card>
  );
}

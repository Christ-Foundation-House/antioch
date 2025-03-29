import {
  DownloadOutlined,
  // RotateLeftOutlined,
  // RotateRightOutlined,
  // SwapOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import React from "react";
import { Button, Image, Popconfirm, Space } from "antd";
import { useRouter } from "next/router";

const src =
  "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png";

interface PropsUserProfilePicture {
  src: string | undefined;
}
const UserProfilePicture = (prop: PropsUserProfilePicture) => {
  // or you can download flipped and rotated image
  // https://codesandbox.io/s/zi-ding-yi-gong-ju-lan-antd-5-7-0-forked-c9jvmp
  const onDownload = () => {
    fetch(src)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.download = "image.png";
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
        link.remove();
      });
  };
  const router = useRouter();
  return (
    <Image
      //   width={200}
      src={prop.src}
      fallback="https://maravianwebservices.com/images/wicf/assets/logo2.png"
      style={{
        width: 80,
        height: 80,
        objectFit: "cover",
        borderRadius: "50%",
        // border: "1px solid #f0f0f0",
        // boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      }}
      preview={{
        toolbarRender: (
          _,
          {
            transform: { scale },
            actions: {
              //   onFlipY,
              //   onFlipX,
              //   onRotateLeft,
              //   onRotateRight,
              onZoomOut,
              onZoomIn,
            },
          },
        ) => (
          <Space size={12} className="toolbar-wrapper">
            <Popconfirm
              title={"You can only set images from WICF Photos"}
              okText="Go to WICF Photos"
              onConfirm={() => {
                router.push("/photos");
              }}
            >
              <Button>Change</Button>
            </Popconfirm>
            <DownloadOutlined onClick={onDownload} />
            {/* <SwapOutlined rotate={90} onClick={onFlipY} />
            <SwapOutlined onClick={onFlipX} />
            <RotateLeftOutlined onClick={onRotateLeft} />
            <RotateRightOutlined onClick={onRotateRight} /> */}
            <ZoomOutOutlined disabled={scale === 1} onClick={onZoomOut} />
            <ZoomInOutlined disabled={scale === 50} onClick={onZoomIn} />
          </Space>
        ),
      }}
    />
  );
};

export default UserProfilePicture;

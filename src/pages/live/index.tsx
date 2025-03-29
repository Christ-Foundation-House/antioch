/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import {
  TypeLiveData,
  TypeLiveDataLinks,
  TypeLiveStream,
} from "@/shared/shared_types";
import { Form, Drawer, List, Avatar } from "antd";
// import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Modal } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { StorageReadItem } from "@/utils/localStorage";
import { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import { LiveTabs } from "@/components/LiveTabs";
import FormSetUsername from "@/forms/FormSetUsername";
import { useQuery } from "react-query";
import { GETLiveStream } from "@/requests";
export interface ArgsModalOpen {
  name: "username";
}
export const liveDataSamples: TypeLiveData[] = [
  {
    id: 0,
    title: "Sunday October 29, Service",
    description: "",
    status: "live",
    views: "",
    online: "",
    start_time: "Wed Nov 01 2023 18:46:28 GMT+0800 (China Standard Time)",
    end_time: "Wed Nov 01 2023 20:46:28 GMT+0800 (China Standard Time)",
    notice: "Please",
    links: {
      youtube: {
        url: "https://www.youtube.com/live/XUd30YMA6KY?si=r15-DCRBwtT_4QxB",
      },
      fcc: {
        code: "Wuhanicf",
        password: "123456",
      },
      zoom: {
        code: "",
        password: "",
      },
    },
  },
];

function DrawerOnline(props: { userList: { username: string }[] }) {
  return (
    <List
      className="demo-loadmore-list"
      // loading={initLoading}
      itemLayout="horizontal"
      dataSource={props.userList}
      renderItem={(item) => (
        <List.Item
        // actions={[
        //   <a key="list-loadmore-edit">edit</a>,
        //   <a key="list-loadmore-more">more</a>,
        // ]}
        >
          <List.Item.Meta
            style={{ border: "1px solid grey", padding: 10, borderRadius: 10 }}
            avatar={<Avatar src={""} />}
            title={<span style={{ color: "white" }}>{item.username}</span>}
            // description={<span style={{ color: "white" }}>{}</span>}
          />
        </List.Item>
      )}
    />
  );
}
export interface ArgsDrawerOpen {
  name: "online";
}
export default function Page(props: {
  liveData?: TypeLiveData;
  titleIsHidden?: boolean;
  refetch?: () => void;
}) {
  const [currentLiveData, setCurrentLiveData] = useState<TypeLiveData>();
  useEffect(() => {
    // console.log("props.liveData", props.liveData);
    // props.liveData[0] && setCurrentLiveData(props.liveData[0]);
    // data_live_stream.refetch();
    // return;
    const { liveData } = props;
    if (liveData) {
      Object.keys(liveData).map((key) => {
        const value = liveData[key];
        switch (key) {
          case "links":
            liveData[key] =
              value && typeof value === "string" ? JSON.parse(value) : value;
            break;
          default:
        }
      });
      console.log("jsonLiveData", liveData);
      // props.liveData && setCurrentLiveData(props.liveData);
      setCurrentLiveData(liveData);
    } else {
      setCurrentLiveData({});
    }
  }, [props.liveData]);
  // props.liveData[0]
  const [currentLinkType, setCurrentLinkType] = useState<TypeLiveDataLinks>();
  const [tabList, setTabList] = useState([]);

  const [form_username] = Form.useForm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modal, setModal] = useState<EmotionJSX.Element>();
  const [modalTitle, setModalTitle] = useState<string>();
  function modalOpen(args: ArgsModalOpen) {
    switch (args.name) {
      case "username":
        setModalTitle("Set Username");
        setModal(
          <FormSetUsername form={form_username} modalClose={modalClose} />,
        );
        setIsModalOpen(true);
        break;
      default:
    }
  }
  function modalClose() {
    setModalTitle(undefined);
    setModal(undefined);
    setIsModalOpen(false);
  }

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState<EmotionJSX.Element>();
  const [drawerTitle, setDrawerTitle] = useState<string>();
  const [drawerPlacement] = useState<"left" | "top" | "right" | "bottom">(
    "bottom",
  );
  function drawerOpen(args: ArgsDrawerOpen) {
    switch (args.name) {
      case "online":
        setDrawerTitle("Online Participants");
        setDrawerContent(<DrawerOnline userList={[{ username: "paulo" }]} />);
        setIsDrawerOpen(true);
        break;
      default:
    }
  }
  function drawerClose() {
    setDrawerTitle(undefined);
    setDrawerContent(undefined);
    setIsDrawerOpen(false);
  }
  useEffect(() => {
    const username = StorageReadItem("live-username");
    if (username) {
      form_username.setFieldValue("live-username", username);
    } else {
      modalOpen({ name: "username" });
    }
  }, []);
  useEffect(() => {
    let tabListTemp: any = [];
    currentLiveData?.links &&
      Object.keys(currentLiveData.links).map(
        (linkType: TypeLiveDataLinks, index) => {
          switch (linkType) {
            case "youtube":
              tabListTemp.push({
                key: "youtube",
                label: "Youtube",
              });
              break;
            case "fcc":
              tabListTemp.push({
                key: "fcc",
                label: "FCC",
              });
              break;
            case "zoom":
              tabListTemp.push({
                key: "zoom",
                label: "Zoom",
              });
              break;
            default:
          }
          // console.log(tabListTemp, currentLiveData);
          setTabList(tabListTemp);
          if (tabListTemp.length > 0) {
            setCurrentLinkType(tabListTemp[0].key);
          }
        },
      );
  }, [currentLiveData]);
  const data_live_stream = useQuery("getLiveStream", () => GETLiveStream(), {
    keepPreviousData: false,
  });
  useEffect(() => {
    if (data_live_stream.status === "success") {
      const res = data_live_stream.data?.data as unknown as TypeLiveStream;
      const { stream } = JSON.parse(JSON.stringify(res));
      // console.log("stream", stream);
      // setCurrentLiveData(stream);
      if (stream) {
        if (stream.links) {
          const parsedStream = {
            ...stream,
            links:
              typeof stream.links === "string"
                ? JSON.parse(stream.links)
                : stream.links,
          };
          setCurrentLiveData(parsedStream);
        } else {
          setCurrentLiveData({});
          setTimeout(() => {
            setCurrentLiveData(stream);
          }, 1000);
        }
      } else {
        setCurrentLiveData({});
      }
      // console.log("urlbased", res);
      // props.liveData = res.stream;
    } else {
      setCurrentLiveData({});
    }
  }, [data_live_stream.isFetched]);
  return (
    <>
      <Drawer
        title={drawerTitle}
        placement={drawerPlacement}
        // closable={false}
        closeIcon={<CloseOutlined style={{ color: "back" }} />}
        onClose={drawerClose}
        open={isDrawerOpen}
        key={drawerPlacement}
        style={{
          background: "#171A20",
          color: "white",
          borderRadius: "25px 25px 0px 0px",
          border: "1px solid grey",
        }}
        css={css`
          .ant-drawer-title {
            color: white;
            text-align: center;
          }
          .ant-drawer-header {
            border-color: grey;
          }
        `}
      >
        {drawerContent}
      </Drawer>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignContent: "center",
          justifyContent: "center",
          // border: "1px solid red",
          paddingTop: 15,
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            alignContent: "center",
            justifyContent: "center",
            textAlign: "center",
            fontSize: 25,
            fontWeight: 700,
            display: props.titleIsHidden ? "none" : "flex",
          }}
        >
          WICF LIVE SERVICE
        </div>
        <div
          style={{
            width: "100%",
            alignContent: "center",
            justifyContent: "center",
            textAlign: "center",
            fontSize: 25,
            fontWeight: 500,
            display: props.titleIsHidden ? "none" : "flex",
          }}
        >
          {currentLiveData?.title}
        </div>
        <div
          style={{
            width: "100%",
            height: "100%",
            // border: "1px solid red",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Modal title={modalTitle} open={isModalOpen} footer={null} centered>
            {modal}
          </Modal>
          <LiveTabs
            {...currentLiveData}
            setCurrentLinkType={setCurrentLinkType}
            currentLinkType={currentLinkType}
            currentLiveData={currentLiveData}
            tabList={tabList}
            modalOpen={modalOpen}
            drawerOpen={drawerOpen}
          />
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  // const session = await getSession(context);
  // const response = await fetch(`${process.env.NEXTAUTH_URL}/api/live`, {
  //   method: "GET",
  //   headers: {
  //     "Content-Type": "application/x-www-form-urlencoded",
  //     accept: "application/json",
  //   },
  // });
  // // const liveData: TypeLiveData = await response.json();

  // const liveData: TypeLiveData[] = liveDataSamples;
  return {
    props: {
      // liveData: liveDataSamples[0],
    },
  };
}

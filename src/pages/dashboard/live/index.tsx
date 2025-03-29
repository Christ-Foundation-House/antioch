/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import LayoutDashboard from "@/layouts/layoutDashboard";
import { TypeLiveData, TypeSession } from "@/shared/shared_types";
import { Button, Card, Col, Form, Modal, Row } from "antd";
import { getSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import LivePage from "@/pages/live";
import {
  SettingsChange,
  SettingsChangeProps,
} from "@/components/SettingsChange";
import { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import SharedList, { PropsSharedList } from "@/components/SharedList";
import { useQuery } from "react-query";
import { GETLiveList, GETLiveStream } from "@/requests";
import { toast } from "react-toastify";
import { permissionReturnRedirectionOrProps } from "@/utils/permission";
import { $Res } from "@/shared/shared_classes";
import { Screens } from "@/styles/theme";
// import { permissionCheck } from "@/shared/shared_actions";

// function SubmitButton() {
//   return (
//     <Form.Item>
//       <Button
//         type="primary"
//         css={css`
//           width: 100%;
//         `}
//         htmlType="submit"
//       >
//         Save
//       </Button>
//     </Form.Item>
//   );
// }
export default function Page() {
  const data_live_stream = useQuery("getLiveStream", () => GETLiveStream(), {
    keepPreviousData: false,
  });
  // const [currentLiveData, setCurrentLiveData] = useState<TypeLiveData>();
  // liveDataSamples[0]
  const [settingsTitle, setSettingsTitle] = useState("Live Settings");
  const [streamList, setStreamList] = useState<TypeLiveData[]>();
  const [selectStreamData, setSelectedStreamData] = useState({});

  const [isEditing, setIsEditing] = useState<boolean>(false);
  // const [idList, setIdList] = useState<type_options[]>([]);

  // const [form_youtube] = Form.useForm();
  // const [form_fcc] = Form.useForm();
  // const [form_zoom] = Form.useForm();
  const [form_live] = Form.useForm();
  const [form_live_new] = Form.useForm();
  const [form_live_new_is_open, set_form_live_new_is_open] =
    useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modal, setModal] = useState<EmotionJSX.Element>();
  const [modalTitle, setModalTitle] = useState<string>();

  const sectionSelect = useRef<HTMLInputElement | null>(null);
  const sectionModify = useRef<HTMLInputElement | null>(null);
  const sectionView = useRef<HTMLInputElement | null>(null);

  const livePropertiesMain: SettingsChangeProps["properties"] = [
    {
      name: "id",
      title: "Id",
      type: "options",
      isEditable: false,
      isHidden: true,
      // isRequired: true,
      // options: { list: [...idList, { label: "New", value: null }] },
    },
    {
      name: "title",
      title: "Title",
      type: "string",
      isRequired: true,
    },
    // {
    //   name: "end_time",
    //   title: "End Time",
    //   type: "dateTime",
    //   isRequired: true,
    // },
    // {
    //   name: "notice",
    //   title: "Notice",
    //   type: "string",
    // },
    {
      name: "description",
      title: "Description",
      type: "string",
      isRequired: true,
    },
    {
      name: ["links", "youtube", "url"] as any,
      title: "Youtube url",
      type: "string",
    },
    {
      name: ["links", "fcc", "code"] as any,
      title: "FCC - Code",
      type: "string",
    },
    {
      name: ["links", "fcc", "password"] as any,
      title: "FCC - Password",
      type: "string",
    },
    {
      name: ["links", "zoom", "code"] as any,
      title: "Zoom - Code",
      type: "string",
    },
    {
      name: ["links", "zoom", "password"] as any,
      title: "Zoom - Password",
      type: "string",
    },
  ];
  const liveProperties = [...livePropertiesMain];
  function modalOpen(args: { name: "youtube" | "fcc" | "zoom" | "live_new" }) {
    switch (args.name) {
      case "live_new":
        if (form_live_new) form_live_new.resetFields();
        setModalTitle("Create New Stream");
        set_form_live_new_is_open(true);
        setModal(
          <div style={{ background: "#161E27" }}>
            <SettingsChange
              form={form_live_new}
              name={"live_new"}
              title={"New Stream"}
              initialData={{
                action: "stream_create",
              }}
              properties={[
                ...livePropertiesMain,
                {
                  name: "action",
                  title: "Action",
                  type: "string",
                  isEditable: false,
                  isHidden: true,
                  isRequired: true,
                  forceValue: "stream_create",
                },
              ]}
              isEditing={{
                isEditing: form_live_new_is_open,
                setIsEditing: set_form_live_new_is_open,
              }}
              onSubmit={{
                onSubmitUrl: {
                  url: "/api/live",
                  method: "POST",
                  onSuccess: () => {
                    modalClose();
                    data_live_list.refetch();
                  },
                },
              }}
            />
          </div>,
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
  async function streamDelete(args: { data: TypeLiveData }) {
    if (args.data) {
      await toast
        .promise(
          fetch(`/api/live`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: args.data?.id,
              action: "stream_delete",
            }),
          }),
          {
            pending: "Deleting....",
            error: "Failed to delete",
            // success: "Successfully deleted",
          },
        )
        .then((res) => {
          res.text().then((data_) => {
            const data = data_ as unknown as $Res;
            if (data.isError) {
              toast.error(data.message);
            } else {
              toast.success(data.message);
              data_live_list.refetch();
            }
          });
        })
        .catch((res) => {
          toast.error("failed to delete", res);
        });
    }
  }
  function streamSelect(args: { data: TypeLiveData }) {
    if (args.data) {
      setSettingsTitle(args.data?.title ?? "Live Settings");
      form_live.resetFields();
      // form_live.setFieldsValue(args.data);
      setSelectedStreamData(args.data);
      if (window?.innerWidth <= Screens.tablet)
        sectionModify?.current?.scrollIntoView({ behavior: "smooth" });
      // setIsEditing(true);
    }
  }
  function liveNew() {
    modalOpen({ name: "live_new" });
  }
  async function liveMake() {
    const liveData = form_live.getFieldsValue();
    if (liveData.id) {
      if (isEditing) {
        toast.error("Please save your stream settings first");
        return;
      }
      // setCurrentLiveData(liveData);
      await toast
        .promise(
          fetch(`/api/live`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              stream_id: liveData.id,
              action: "live_create",
            }),
          }),
          {
            pending: "Setting Live....",
            error: "Failed to set live",
            // success: "Successfully set live",
          },
        )
        .then((response) => response.json())
        .then((res_) => {
          const res = res_ as unknown as $Res;
          if (res.isError) {
            toast.error(res.message);
          } else {
            toast.success(res.message);
            const { stream } = res.data;
            console.log("set_live", stream);
            // setCurrentLiveData(stream);
            data_live_stream.refetch();
            if (window.innerWidth <= Screens.tablet)
              sectionView?.current?.scrollIntoView({ behavior: "smooth" });
          }
        })
        .catch((res) => {
          toast.error("failed to delete", res);
        });
    } else {
      toast.error("Please select a valid stream first");
    }
  }
  async function liveRemove() {
    console.log("removing");
    // setCurrentLiveData(undefined);
    await toast
      .promise(
        fetch(`/api/live`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "live_delete",
          }),
        }),
        {
          pending: "Deleting Live....",
          error: "Failed to delete live",
          // success: "Successfully set live",
        },
      )
      .then((response) => response.json())
      .then((res_) => {
        const res = res_ as unknown as $Res;
        if (res.isError) {
          toast.error(res.message);
        } else {
          toast.success(res.message);
          // const { stream } = res.data;
          // setCurrentLiveData(null);
          // setCurrentLiveData(stream);
          data_live_stream.refetch();
          window.location.reload();
        }
      })
      .catch((res) => {
        toast.error("failed to delete", res);
      });
  }
  const data_live_list = useQuery("getLiveList", () => GETLiveList(), {
    keepPreviousData: false,
  });
  useEffect(() => {
    // console.log("data_live_list", data_live_list);
    if (data_live_list.data?.data) {
      let streams = data_live_list.data?.data;
      streams.map((stream) => {
        stream.links =
          typeof stream.links === "string"
            ? JSON.parse(stream.links)
            : stream.links;
      });
      setStreamList(streams);
    }
  }, [data_live_list]);
  return (
    <LayoutDashboard title="Live">
      <Modal
        title={modalTitle}
        open={isModalOpen}
        footer={null}
        centered
        onCancel={modalClose}
        css={css({
          background: "transparent",
          span: {
            // color: "white",
          },
          ".ant-modal-title": {
            color: "white",
          },
          ".ant-modal-header": {
            background: "transparent",
          },
          ".ant-modal-content": {
            background: "#161E27",
          },
        })}
      >
        {modal}
      </Modal>
      <Row
        align="middle"
        gutter={[24, 0]}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        <Col xl={8} lg={12} xs={24}>
          <Card
            ref={sectionSelect}
            title="1. Select Stream"
            bordered={false}
            bodyStyle={{
              background: "transparent",
              display: "flex",
              width: "100%",
              maxHeight: "80vh",
              height: "fit-content",
              padding: 0,
              overflowY: "scroll",
              gap: 5,
            }}
            style={{
              background: "transparent",
              color: "white",
            }}
            extra={
              <div
                css={css({
                  display: "flex",
                  gap: 5,
                })}
              >
                <Button size="small" onClick={liveNew}>
                  New
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    data_live_list.refetch();
                  }}
                >
                  Reload
                </Button>
              </div>
            }
          >
            <SharedList
              dataIsLoading={data_live_list.isFetching}
              data={(() => {
                let array: PropsSharedList["data"] = [];
                const data = streamList;
                if (data) {
                  data.map((item) => {
                    array.push({
                      title: item.title ?? "",
                      description: `Description: ${item.description}`,
                      info: [
                        {
                          label: "Youtube",
                          value: item.links?.youtube?.url,
                          isCopyable: item.links?.youtube?.url ? true : false,
                          color: "grey",
                        },
                      ],
                      actions: [
                        <Button
                          key="stream"
                          onClick={() => {
                            streamSelect({ data: item });
                          }}
                        >
                          Select
                        </Button>,
                        <Button
                          key="stream"
                          onClick={async () => {
                            await streamDelete({ data: item });
                          }}
                        >
                          Delete
                        </Button>,
                      ],
                      item,
                    });
                  });
                }
                return array;
              })()}
            />
          </Card>
        </Col>
        <Col xl={8} lg={12} xs={24}>
          <Card
            ref={sectionModify}
            title="2. Modify Selected Stream"
            bordered={false}
            bodyStyle={{
              background: "transparent",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              width: "100%",
              height: "fit-content",
              minHeight: "500px",
              padding: 9,
            }}
            style={{
              background: "transparent",
            }}
            extra={
              <div>
                <Button onClick={liveMake} size="small">
                  Make Live
                </Button>
              </div>
            }
          >
            <SettingsChange
              form={form_live}
              name={"live"}
              title={settingsTitle}
              initialData={{
                action: "stream_update",
                ...selectStreamData,
              }}
              properties={[
                ...liveProperties,
                {
                  name: "action",
                  title: "Action",
                  type: "string",
                  isEditable: false,
                  isHidden: true,
                  isRequired: true,
                  forceValue: "stream_update",
                },
              ]}
              isEditing={{ isEditing, setIsEditing }}
              onSubmit={{
                onSubmitUrl: {
                  url: "/api/live",
                  method: "PATCH",
                  onSuccess: ({ data }) => {
                    const stream_data = data as unknown as TypeLiveData;
                    setSelectedStreamData(stream_data);
                    form_live.setFieldsValue(stream_data);
                    modalClose();
                    if (stream_data?.title)
                      setSettingsTitle(stream_data?.title);
                    data_live_list.refetch();
                  },
                },
              }}
            />
          </Card>
        </Col>
        <Col xl={8} lg={12} xs={24}>
          <Card
            ref={sectionView}
            title="3. View Live"
            bordered={false}
            bodyStyle={{
              background: "transparent",
              display: "flex",
              // alignItems: "stretch",
              width: "100%",
              height: "500px",
              minHeight: "fit-content",
              padding: 0,
            }}
            style={{
              background: "transparent",
              color: "white",
            }}
            extra={
              <div
                css={css({
                  display: "flex",
                  gap: 5,
                })}
              >
                {/* <Button onClick={liveRemove} size="small">
                  Remove
                </Button> */}
                <Button onClick={liveRemove} size="small">
                  Remove
                </Button>
              </div>
            }
          >
            {/* <LivePage liveData={liveDataSamples} /> */}
            {/* <LivePage liveData={currentLiveData} /> */}
            <LivePage liveData={data_live_stream.data?.data?.stream} />
          </Card>
        </Col>
      </Row>
    </LayoutDashboard>
  );
}

export async function getServerSideProps(context) {
  console.log(context.resolvedUrl);
  return permissionReturnRedirectionOrProps({
    session: (await getSession(context.res)) as TypeSession | null,
    routeUrl: context.resolvedUrl,
  });
}

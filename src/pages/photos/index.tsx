/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import {
  POST_photos_albums_get,
  POST_photos_info,
  POST_photos_source_update,
  POST_photos_album_public_toggle,
} from "@/requests";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
// import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import { DeviceScreen } from "@/styles/theme";
import { PageWrapper } from "@/components/PageWrapper";
import OptionsDropDown from "@/components/OptionsDropDown";
import { EyeInvisibleOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  // utilFilesDownload1,
  utilFilesDownload5_images,
  utilShareLink,
} from "@/utils";
import { Button, Form, Modal } from "antd";
import {
  permissionGet,
  // permissionReturnRedirectionOrProps,
} from "@/utils/permission";
import { getSession } from "next-auth/react";
import { TypeSession } from "@/shared/shared_types";
import { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import { SettingsChange } from "@/components/SettingsChange";
import { photos_album } from "@prisma/client";

export default function Page(props: { is_admin: boolean }) {
  const router = useRouter();
  // const { is_admin } = router.query;
  const [is_admin] = useState(props.is_admin);
  const [isAdmin, setIsAdmin] = useState(false);
  // write me a react query fetch for POST_photos_fetch that can be called ones to update the image database
  // const { mutate } = useMutation(POST_photos_fetch);

  const data_photos_albums = useQuery(
    "photos_albums_get",
    () => POST_photos_albums_get(),
    {
      keepPreviousData: false,
    },
  );
  const data_photos_info = useQuery("photos_info", () => POST_photos_info(), {
    keepPreviousData: true,
  });
  const updateImageDatabase = () => {
    toast
      .promise(POST_photos_source_update(), {
        pending: "Image database updating...",
        success: "Image database updated successfully",
        error: "Failed to update image database",
      })
      .then(() => {
        data_photos_albums.refetch();
      })
      .catch((error) => {
        console.error(error);
      });
  };
  async function photos_album_public_toggle(
    album_key: string,
    is_public: boolean,
  ) {
    toast
      .promise(POST_photos_album_public_toggle({ album_key, is_public }), {
        pending: "Updating album visibility",
        success: "Album visibility updated",
        error: "Failed to update album visibility",
      })
      .then(() => {
        data_photos_albums.refetch();
      })
      .catch((error) => {
        console.error(error);
      });
  }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modal, setModal] = useState<EmotionJSX.Element>();
  const [modalTitle, setModalTitle] = useState<string>();
  const [formIsEditing, setFormIsEditing] = useState<boolean>(true);
  const [form_edit_details] = Form.useForm();
  function modalClose() {
    setModalTitle(undefined);
    setModal(undefined);
    setIsModalOpen(false);
  }
  function modalOpen(args: { name: "edit_details"; data: photos_album }) {
    switch (args.name) {
      case "edit_details":
        // console.log(args.data)
        form_edit_details.resetFields();
        setFormIsEditing(true);
        setModalTitle("Album Details");
        setModal(
          <div style={{ background: "#161E27" }}>
            <SettingsChange
              form={form_edit_details}
              name={"albun_edit"}
              title={"Edit"}
              initialData={{
                ...args.data,
                action: "photos_album_edit",
              }}
              properties={[
                {
                  name: "action",
                  title: "Action",
                  type: "string",
                  isEditable: false,
                  isHidden: true,
                  isRequired: true,
                  forceValue: "photos_album_edit",
                },
                {
                  name: "album_key",
                  title: "Album Key",
                  type: "string",
                  isEditable: false,
                },
                {
                  name: "title",
                  title: "Title",
                  type: "string",
                  isEditable: true,
                },
                {
                  name: "date",
                  title: "Date",
                  type: "dateTime",
                },
              ]}
              isEditing={{
                isEditing: formIsEditing,
                setIsEditing: setFormIsEditing,
              }}
              onSubmit={{
                onSubmitUrl: {
                  url: "/api/photos",
                  method: "POST",
                  onSuccess: () => {
                    modalClose();
                    data_photos_albums.refetch();
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
  useEffect(() => {
    setIsAdmin(is_admin === true ? true : false);
  }, [is_admin]);
  return (
    <PageWrapper
      title={"Photos"}
      isLoading={data_photos_albums.isLoading}
      error={
        !data_photos_albums?.error
          ? undefined
          : {
              message: (data_photos_albums?.error as { message: string })
                ?.message,
            }
      }
      style={{
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "flex-start",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Modal
        title={modalTitle}
        open={isModalOpen}
        footer={null}
        centered
        onCancel={modalClose}
        css={css({
          background: "transparent",
          span: {},
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
      <div
        style={{
          paddingTop: 30,
          width: "100%",
          maxWidth: "570px",
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h1
          style={{
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {data_photos_info.data?.title}
        </h1>
        <p
          style={{
            textAlign: "center",
          }}
        >
          {data_photos_info.data?.description ??
            (data_photos_info.isFetched
              ? "Please contact admin to set photos Infomation"
              : null)}
        </p>
        <div
          style={{
            width: "100%",
            padding: 10,
            display: isAdmin ? "flex" : "none",
            alignItems: "center",
            justifyContent: "space-around",
            // border: "1px solid white",
          }}
        >
          <Button
            type="primary"
            onClick={() => {
              updateImageDatabase();
            }}
          >
            Update Image DB
          </Button>
          <Button
            type="primary"
            onClick={() => {
              router.push("/dashboard/photos");
            }}
          >
            Edit Details
          </Button>
          <Button
            type="primary"
            onClick={() => {
              data_photos_albums.refetch();
            }}
          >
            Refresh
          </Button>
        </div>
      </div>
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "10px 0px",
          // overflow: "hidden",
          // border: "1px solid white",
        }}
        css={css`
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px;
          // ${DeviceScreen.tablet} {
          //   grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          // }
          ${DeviceScreen.mobile} {
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 10px;
          }
        `}
      >
        {data_photos_albums.data
          ?.sort((a, b) => {
            // Define a function to handle null values in date
            const getDateValue = (album) => {
              // Return a default value (e.g., a very early date) if date is null
              return album.date || "1900-01-01";
            };

            // Compare the date values, handling possible nulls
            const dateA = getDateValue(a);
            const dateB = getDateValue(b);

            // Use string comparison for dates (assumes ISO format YYYY-MM-DD)
            if (dateA > dateB) return -1;
            if (dateA < dateB) return 1;
            return 0;
          })
          .filter((album) => album.is_public === true)
          .concat(
            data_photos_albums.data?.filter(
              (album) => album.is_public === false,
            ),
          )
          .map((album, index) => {
            const imageArray = album.image_url_array ?? [];
            const imageThumbnail = album.thumbnail_url
              ? album.thumbnail_url
              : imageArray && imageArray[0];
            const is_visible = album.is_public ? true : isAdmin ?? false;
            const hiddenImages = album.image_url_array_hidden ?? [];
            const imageArrayMinusHiddenImages = imageArray.filter(
              (image) => !hiddenImages.includes(image),
            );
            return !is_visible ? null : (
              <Link
                href={`/photos/${album.album_key}`}
                key={index}
                style={{
                  cursor: "pointer",
                  alignItems: "center",
                  justifyContent: "center",
                  // textAlign: "center",
                }}
                css={css`
                  grid-row-end: span 10;
                  width: 100%;
                  height: auto;
                  opacity: 0.9;
                  // border: 1px solid red;
                  background-color: black;
                  position: relative;
                  &:hover {
                    scale: 1.02;
                    opacity: 1;
                  }
                `}
              >
                <div
                  style={{
                    width: "100",
                  }}
                  css={css`
                    position: relative;
                    overflow: hidden;
                    padding-bottom: 56.25%;
                  `}
                >
                  {!album.is_public ? (
                    <div
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "black",
                        zIndex: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0.6,
                      }}
                    >
                      <EyeInvisibleOutlined style={{ fontSize: 72 }} />
                    </div>
                  ) : null}
                  <img
                    src={
                      imageThumbnail ??
                      "https://maravianwebservices.com/images/wicf/assets/logo2.png"
                    }
                    alt="WICF Logo"
                    // width={320}
                    // height={200}
                    css={css`
                      position: absolute;
                      width: 100%;
                      height: auto;
                      object-fit: cover;
                    `}
                  />
                </div>
                <div
                  style={{
                    width: "100%",
                    // height: "100%",
                    flexGrow: 1,
                    // border: "1px solid white",
                    display: "flex",
                    // alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0px 10px",
                  }}
                >
                  <div
                    style={{
                      padding: 10,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {`Views: ${album.views}`}
                    <br />
                    {`Photos: ${
                      album.image_url_array.length -
                      (album.image_url_array_hidden.length ?? 0)
                    }`}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    <h3
                      style={{
                        paddingTop: 10,
                        marginBottom: 5,
                        color: "white",
                        textAlign: "center",
                        fontSize: 18,
                        fontWeight: "bold",
                        // capitalize
                      }}
                    >
                      {album.title ?? album.album_key}
                    </h3>
                    <p
                      style={{
                        fontSize: 12,
                        textAlign: "center",
                      }}
                    >
                      {(album?.date && new Date(album.date).toDateString()) ??
                        null}
                    </p>
                  </div>
                  <div
                    style={{
                      // border: "1px solid white",
                      minWidth: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    css={css`
                      &:hover {
                        scale: 1.2;
                      }
                    `}
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    {
                      <OptionsDropDown
                        options={[
                          ...(isAdmin
                            ? [
                                {
                                  label: album.is_public
                                    ? "Hide"
                                    : "Make Public",
                                  onClick: () => {
                                    photos_album_public_toggle(
                                      album.album_key,
                                      !album.is_public,
                                    );
                                  },
                                },
                                {
                                  label: "Edit Album",
                                  onClick: () => {
                                    modalOpen({
                                      name: "edit_details",
                                      data: album,
                                    });
                                  },
                                },
                                {
                                  label: "Download Album (Visible)",
                                  onClick: () => {
                                    utilFilesDownload5_images({
                                      images: imageArrayMinusHiddenImages,
                                      zipName: album.album_key,
                                    });
                                  },
                                },
                                {
                                  label: "Download Album (Full)",
                                  onClick: () => {
                                    utilFilesDownload5_images({
                                      images: imageArray,
                                      zipName: album.album_key,
                                    });
                                  },
                                },
                              ]
                            : []),
                          {
                            label: "Share Album",
                            onClick: () => {
                              utilShareLink({
                                window,
                                navigator,
                                url: `${window.location.origin}${router.asPath}/${album.album_key}`,
                              });
                            },
                          },
                        ]}
                      />
                    }
                  </div>
                </div>
              </Link>
            );
          })}
      </div>
    </PageWrapper>
  );
}
export async function getServerSideProps(context) {
  const perm = await permissionGet({
    session: (await getSession(context.res)) as TypeSession | null,
    routeUrl: context.resolvedUrl,
  });
  return {
    props: {
      is_admin: perm.isPhotosAdmin,
    },
  };
}

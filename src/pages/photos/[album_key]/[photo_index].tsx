/* eslint-disable @next/next/no-img-element */
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { POST_photos_album_get } from "@/requests";
import { DeviceScreen, sharedIconCss } from "@/styles/theme";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
// import Image from "next/image";
import { PageWrapper } from "@/components/PageWrapper";
// import PhotoGallery3 from "@/components/photos/PhotoGallery3";
import { permissionGet } from "@/utils/permission";
import { LeftOutlined } from "@ant-design/icons";
// import PhotoGallery4 from "@/components/photos/PhotoGallery4";
// import PhotoGallery5 from "@/components/photos/PhotoGallery5";
// import PhotoGallery3B from "@/components/photos/PhotoGallery3B";
// import PhotoGallery4 from "@/components/photos/PhotoGallery4";
import PhotoGallery5 from "@/components/photos/PhotoGallery5";
import { TypePhotosAlbum } from "@/shared/shared_types";

export default function Page(props: {
  permissions: ReturnType<typeof permissionGet>;
  photosAlbum?: TypePhotosAlbum;
}) {
  const router = useRouter();
  const { album_key, photo_index } = router.query;

  const [date, setDate] = useState<string | null>(null);
  const [thumbnail_url, setThumbnailUrl] = useState(
    "https://maravianwebservices.com/images/wicf/assets/logo2.png",
  );
  const [images, setImages] = useState<string[]>([]);
  const [imagesHidden, setImagesHidden] = useState<string[]>([]);
  const [photosAlbum, setPhotosAlbum] = useState<TypePhotosAlbum | undefined>(
    props.photosAlbum,
  );
  const data_photos_album = useQuery(
    ["photos_album_get2", album_key],
    () => POST_photos_album_get({ album_key: album_key as unknown as string }),
    {
      enabled: album_key ? (props.photosAlbum ? false : true) : false,
      keepPreviousData: false,
      // staleTime: 0,
    },
  );
  useEffect(() => {
    setImagesHidden(photosAlbum?.image_url_array_hidden ?? []);
  }, [photosAlbum]);
  useEffect(() => {
    const image_data = photosAlbum;
    if (!image_data) return;

    const { image_url_array, thumbnail_url: thumbnail_url_raw } = image_data;
    if (!image_url_array) return;
    setImages(image_url_array as unknown as string[]);

    const { date } = image_data;

    setThumbnailUrl(thumbnail_url_raw ?? image_url_array[0]);
    if (date) setDate(new Date(date).toDateString());
  }, [photosAlbum, album_key, photo_index]);

  const refGallery = useRef<HTMLDivElement>(null);
  const [isAdmin] = useState<boolean>(props?.permissions?.isAdmin ?? false);
  // const [viewCounted, setViewCounted] = useState(false);
  // const AddView = useCallback(() => {
  //   if (viewCounted) return;
  //   setViewCounted(true);
  //   POST_photos_album_views_add({
  //     album_key: album_key as unknown as string,
  //   }).catch((e) => {
  //     console.error(e);
  //     setViewCounted(false);
  //   });
  // }, [album_key, viewCounted]);
  // useEffect(() => {
  //   console.log("Run Once");
  //   AddView();
  // }, []);
  useEffect(() => {
    if (data_photos_album.data) {
      setPhotosAlbum(data_photos_album.data);
    }
  }, [data_photos_album]);
  return (
    <PageWrapper
      title={photosAlbum?.title ?? "Photos"}
      imageUrl={photosAlbum?.thumbnail_url}
      // className={FontMontserrat.className}
      isLoading={data_photos_album.isLoading ?? false}
      error={
        !data_photos_album?.error
          ? undefined
          : {
              message: (data_photos_album?.error as { message: string })
                ?.message,
            }
      }
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: 20,
          width: "100vw",
          height: "100vh",
          // height: "fit-content",
          maxHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // border: "5px solid red",
          overflow: "hidden",
          position: "relative",
          // backgroundImage: `url(${thumbnail_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          // backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
          // filter: "blur(10px)",
        }}
      >
        <LeftOutlined
          css={css(sharedIconCss)}
          style={{
            fontSize: 25,
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 1,
          }}
          onClick={() => {
            router.push("/photos");
          }}
        />
        <img
          src={thumbnail_url}
          alt="WICF Logo"
          // width={1920}
          // height={1080}
          // objectFit="cover"
          style={
            {
              // filter: "blur(2px)",
            }
          }
          css={css`
            position: absolute;
            width: 100%;
            height: auto;
            object-fit: cover;
            ${DeviceScreen.mobile} {
              width: auto;
              height: 100%;
            }
          `}
        />
        <div
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            opacity: 0.9,
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            mixBlendMode: "screen",
          }}
          css={css`
            font-size: 52px;
            box-shadow: inset 0px 0px 100px rgba(0, 0, 0, 1);

            ${DeviceScreen.mobile} {
              font-size: 39px;
            }
          `}
        >
          <h1
            style={{
              // fontSize: 72,
              fontWeight: "bold",
              marginBottom: 10,
              pointerEvents: "none",
            }}
            css={css`
              font-size: 72px;
              white-space: wrap;
              // border: 1px solid red;
              width: 100%;

              ${DeviceScreen.mobile} {
                font-size: 60px;
              }
            `}
          >
            {photosAlbum?.title ?? photosAlbum?.album_key ?? "Loading..."}
          </h1>
          <h2
            style={{
              fontSize: 22,
              fontWeight: "600",
              pointerEvents: "none",
            }}
          >
            {date}
            <br />
            {images.length
              ? `${images.length - imagesHidden.length} Photos`
              : undefined}
            <br />

            {photosAlbum?.views ? `${photosAlbum?.views} Views` : undefined}
          </h2>
          <div
            style={{
              backgroundColor: "transparent",
              borderColor: "white",
              boxShadow: "none",
              textDecoration: "none",
              fontSize: 16,
              minWidth: 150,
              height: 40,
              border: "1px solid white",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              display: images.length ? "flex" : "none",
            }}
            css={css`
              &:hover {
                scale: 0.9;
              }
            `}
            onClick={() => {
              refGallery.current?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            VIEW ALBUM
          </div>
        </div>
      </div>
      <div
        ref={refGallery}
        style={{
          width: "100%",
        }}
      >
        {/* <PhotoGallery images={images} /> */}
        {/* <PhotoGallery2 images={images} /> */}
        {/* <PhotoGallery3
          images={images}
          refetch={data_photos_album.refetch}
          imagesHidden={imagesHidden}
          isAdmin={isAdmin}
        /> */}
        {/* <PhotoGallery3B
          images={images}
          refetch={data_photos_album.refetch}
          imagesHidden={imagesHidden}
          isAdmin={isAdmin}
        /> */}
        {/* <PhotoGallery4
          image_object_array={photosAlbum?.image_object_array ?? []}
          refetch={data_photos_album.refetch}
          imagesHidden={imagesHidden}
          isAdmin={isAdmin}
        /> */}
        <PhotoGallery5
          image_object_array={photosAlbum?.image_object_array ?? []}
          refetch={data_photos_album.refetch}
          imagesHidden={imagesHidden}
          imagesDontThumbnail={
            photosAlbum?.image_url_array_dont_thumbnail ?? []
          }
          isAdmin={isAdmin}
        />
      </div>
    </PageWrapper>
  );
}

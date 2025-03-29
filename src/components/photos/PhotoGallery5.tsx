// USES NORMAL IMG TAG NOT NEXTJS IMAGE TAG

/* eslint-disable no-unused-expressions */
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import Lightbox, { SlideImage } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
// import Image from "next/image";
import { DeviceScreen, sharedIconCss } from "@/styles/theme";
import {
  BorderOutlined,
  CheckSquareOutlined,
  CloseSquareOutlined,
  DownloadOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FullscreenExitOutlined,
  // FullscreenOutlined,
  LoadingOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import {
  Counter,
  Download,
  Fullscreen,
  Thumbnails,
  Share,
  Zoom,
  Slideshow,
} from "yet-another-react-lightbox/plugins";

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/counter.css";
import { useRouter } from "next/router";
import { Button, FloatButton, Popconfirm } from "antd";
import { toast } from "react-toastify";
import { utilFilesDownload5_images, utilShareLink } from "@/utils";
import {
  POST_photos_album_hidden_images_set,
  POST_photos_album_set_thumbnail,
} from "@/requests";
import OptionsDropDown from "@/components/OptionsDropDown";
import { TypeImageObject } from "@/shared/shared_types";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";

export interface PropsPhotoGallery {
  // images: string[];
  image_object_array: TypeImageObject[];
  imagesHidden?: string[];
  imagesDontThumbnail?: string[];
  refetch?: () => void;
  isAdmin?: boolean;
}
export default function PhotoGallery5(props: PropsPhotoGallery) {
  const session = useSession();
  const request_imagesDontThumbnailUpdate =
    api.photos.imagesDontThumbnailUpdate.useMutation();
  const request_profilePictureSet = api.user.profilePictureSet.useMutation();
  const router = useRouter();
  const { isAdmin } = props;
  const { imagesHidden } = props;
  const { imagesDontThumbnail } = props;
  const { idx, album_key } = router.query as {
    idx: string;
    album_key: string;
  };
  const [images, setImages] = useState<TypeImageObject[]>([]);
  useEffect(() => {
    let imagesNew: TypeImageObject[] = [];
    imagesNew = props.image_object_array.filter(
      (img) => isAdmin || !imagesHidden?.includes(img.image_url),
    );
    setImages(imagesNew);
  }, [isAdmin, imagesHidden, props.image_object_array]);
  function imagesHiddenAdd(images: string[]) {
    const newImagesHidden = [...(imagesHidden ?? []), ...images];
    toast
      .promise(
        POST_photos_album_hidden_images_set({
          album_key: album_key,
          image_url_array_hidden: newImagesHidden,
        }),
        {
          pending: "Hiding images...",
          success: "Images successfully hidden",
          error: "Failed to hide images",
        },
      )
      .then(() => {
        // eslint-disable-next-line no-unused-expressions
        props.refetch && props.refetch();
      })
      .catch((e) => {
        console.error(e);
      });
  }
  function imagesHiddenRemove(images: string[]) {
    const newImagesHidden = (imagesHidden ?? []).filter(
      (img) => !images.includes(img),
    );
    toast
      .promise(
        POST_photos_album_hidden_images_set({
          album_key: album_key,
          image_url_array_hidden: newImagesHidden,
        }),
        {
          pending: "Unhiding images...",
          success: "Images successfully hidden",
          error: "Failed to hide images",
        },
      )
      .then(() => {
        // eslint-disable-next-line no-unused-expressions
        props.refetch && props.refetch();
      })
      .catch((e) => {
        console.error(e);
      });
  }
  function imagesHiddenToggle(image: TypeImageObject) {
    if (imagesHidden?.includes(image.image_url)) {
      imagesHiddenRemove([image.image_url]);
    } else {
      imagesHiddenAdd([image.image_url]);
    }
  }
  function imagesHiddenIsHidden(image: string) {
    return imagesHidden?.includes(image);
  }
  function imagesDontThumbnailAdd(images: string[]) {
    const newImagesDontThumbnail = [...(imagesDontThumbnail ?? []), ...images];
    toast
      .promise(
        request_imagesDontThumbnailUpdate.mutateAsync({
          album_key,
          imagesArray: newImagesDontThumbnail,
        }),
        {
          pending: "Setting images to NOT use thumbnails...",
          success: "Successfully set Images to NOT use thumbnails",
          error: "Failed to set images thumbnail usage",
        },
      )
      .then(() => {
        // eslint-disable-next-line no-unused-expressions
        props.refetch && props.refetch();
      })
      .catch((e) => {
        console.error(e);
      });
  }
  function imagesDontThumbnailRemove(images: string[]) {
    console.log(imagesDontThumbnail);
    let imagesDontThumbnail_ = imagesDontThumbnail ?? [];
    const newImagesDontThumbnail = imagesDontThumbnail_.filter(
      (img) => !images.includes(img),
    );
    toast
      .promise(
        request_imagesDontThumbnailUpdate.mutateAsync({
          album_key,
          imagesArray: newImagesDontThumbnail,
        }),
        {
          pending: "Setting images to use thumbnails...",
          success: "Successfully set Images to use thumbnails",
          error: "Failed to set images thumbnail usage",
        },
      )
      .then(() => {
        // eslint-disable-next-line no-unused-expressions
        props.refetch && props.refetch();
      })
      .catch((e) => {
        console.error(e);
      });
  }
  function imagesDontThumbnailToggle(image: TypeImageObject) {
    if (imagesDontThumbnail?.includes(image.image_url)) {
      imagesDontThumbnailRemove([image.image_url]);
    } else {
      imagesDontThumbnailAdd([image.image_url]);
    }
  }
  function imageExistsInDontThumbnail(image: string) {
    return imagesDontThumbnail?.includes(image);
  }
  function shouldImageUseThumbnail(image: string) {
    // let result = false;
    if (useThumbnails === false) {
      return false;
    } else {
      if (imageExistsInDontThumbnail(image)) {
        return false;
      } else {
        return true;
      }
    }
  }
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imagesFinished, setImagesFinished] = useState(false);
  const [useThumbnails] = useState(true);
  function setIndex(index_: number) {
    // router.push({
    //   pathname: `/photos/${album_key}`,
    //   query: { idx: index_.toString() },
    // });
    setCurrentImage(null);
    router.query["idx"] = index_.toString();
  }
  const handleClick = (
    index_: number,
    useThumbnail: boolean,
    // item: SlideImage
  ) => {
    setIndex(index_);
    setCurrentImage(
      useThumbnail
        ? images[index_].thumbnail_url ?? images[index_].image_url
        : images[index_].image_url,
    );
  };
  const divRef = useRef<HTMLDivElement>(null);

  const [indexBatchSize] = useState(10);
  const [indexMax, setIndexMax] = useState(images.length - 1);
  const [indexCurrent, setIndexCurrent] = useState(indexBatchSize);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const slides: SlideImage[] =
    images.map((img) => ({
      src: shouldImageUseThumbnail(img.image_url)
        ? img.thumbnail_url ?? img.image_url
        : img.image_url,
      // srcSet: img.thumbnail_url
      //   ? [{ src: img.thumbnail_url, width: 320, height: 213 }]
      //   : undefined,
    })) ?? [];
  function photos_album_set_thumbnail(image_url: string) {
    toast
      .promise(POST_photos_album_set_thumbnail({ album_key, image_url }), {
        pending: "Setting album poster...",
        success: "Album poster successfully set",
        error: "Failed to set poster",
      })
      .then(() => {
        // eslint-disable-next-line no-unused-expressions
        props.refetch && props.refetch();
      })
      .catch((e) => {
        console.error(e);
      });
  }
  function imagesIsAllLoaded(indexCurrent) {
    return indexCurrent + 10 > indexMax ? true : false;
  }
  function imagesLoadMore() {
    console.log("Loading more imagees!");
    setIndexCurrent((prev) =>
      imagesIsAllLoaded(indexCurrent) ? indexMax : prev + indexBatchSize,
    );
  }
  useEffect(() => {
    setIndexMax(images.length);
    setIndexCurrent(
      images.length < indexBatchSize ? images.length : indexBatchSize,
    );
  }, [indexBatchSize, images.length]);
  useEffect(() => {
    if (idx !== null) setCurrentImage(null);
  }, [idx]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && images) {
            imagesLoadMore();
          } else {
            setImagesFinished(true);
          }
        });
      },
      { threshold: 0.1 },
    );

    if (divRef.current) {
      observer.observe(divRef.current);
    }

    return () => {
      if (divRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(divRef.current);
      }
    };
  }, [indexBatchSize, indexMax, images]);

  useEffect(() => {
    if (idx) {
      const idx_ = Number(idx);
      console.log({ images, idx_ });
      if (images.length === 0 || idx_ < 0) return;
      console.log("Passes");
      const imageUrl = shouldImageUseThumbnail(images[idx_].image_url)
        ? images[idx_]?.thumbnail_url ?? images[idx_].image_url
        : images[idx_].image_url;
      setCurrentImage(imageUrl);
    }
  }, [images, idx]);

  const [selectedImages, setSelectedImages] = useState<TypeImageObject[]>([]);
  function selectedImagesAdd(image: TypeImageObject) {
    setSelectedImages([...selectedImages, image]);
  }
  function selectedImagesRemove(image: TypeImageObject) {
    setSelectedImages(selectedImages.filter((img) => img !== image));
  }
  function selectedImagesClear() {
    console.log("Clearing selected images");
    setSelectedImages([]);
  }
  function selectedImageIsSelected(image: TypeImageObject) {
    return selectedImages.includes(image);
  }
  function selectedImageToggle(image: TypeImageObject) {
    if (selectedImages.includes(image)) {
      selectedImagesRemove(image);
    } else {
      selectedImagesAdd(image);
    }
  }

  const returnImageUrls = useCallback(
    ({
      images,
      useThumbnails,
    }: {
      images: TypeImageObject[];
      useThumbnails;
    }) => {
      return images.map((img) =>
        useThumbnails ? img.thumbnail_url ?? img.image_url : img.image_url,
      );
    },
    [],
  );
  const profilePictureSet = (args: { image_url: string }) => {
    toast
      .promise(request_profilePictureSet.mutateAsync(args), {
        pending: "Setting profile picture...",
        success: "Profile picture successfully set",
        error: "Failed to set profile picture",
      })
      .then(() => {
        // eslint-disable-next-line no-unused-expressions
        // props.refetch && props.refetch();
        window.location.reload();
      })
      .catch((e) => {
        console.error(e);
      });
  };
  return (
    <>
      <FloatButton.BackTop
        visibilityHeight={1400}
        style={{
          opacity: 0.5,
          // right: 36,
          right: 15,
          bottom: selectedImages.length ? 80 : 15,
        }}
      />
      {currentImage && idx !== null ? (
        <Lightbox
          slides={slides}
          // render={{ slide: NextJsImage }}
          open={Number(idx) >= 0}
          index={Number(idx)}
          close={() => setIndex(-1)}
          plugins={[
            Download,
            Fullscreen,
            Slideshow,
            // Inline,
            Share,
            Thumbnails,
            Zoom,
            Counter,
            Counter,
          ]}
          // plugins={[Download, Fullscreen, Slideshow]}
          // carousel={{}}
          thumbnails={{
            position: "bottom",
          }}
          counter={{
            container: {
              style: {
                top: "unset",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
              },
            },
          }}
          // inline={{
          //   style: {
          //     width: "100%",
          //     maxWidth: "900px",
          //     aspectRatio: "3 / 2",
          //     margin: "0 auto",
          //   },
          // }}
          carousel={{
            spacing: 10,
            padding: 0,
            imageFit: "contain",
            preload: 5,
          }}
        />
      ) : null}
      <div
        style={{
          width: "100%",
          minHeight: images ? "100vh" : "0px",
          gap: 10,
          paddingTop: 10,
          justifyContent: "space-around",
        }}
        css={css`
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(20%, 1fr));
          gap: 20px;
          ${DeviceScreen.tablet} {
            grid-template-columns: repeat(auto-fill, minmax(30%, 1fr));
          }
          ${DeviceScreen.mobile} {
            grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
            gap: 10px;
          }
        `}
      >
        {images.slice(0, indexCurrent).map((image, index) => {
          return (
            <div
              key={index}
              style={{
                width: "100%",
                position: "relative",
                backgroundColor: "black",
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
              }}
              css={css`
                opacity: 0.9;
                &:hover {
                  opacity: 1;
                }
                ${DeviceScreen.mobile} {
                  opacity: 1;
                  &:hover {
                    opacity: 0.9;
                  }
                }
              `}
              onMouseOver={() => {
                setHoveredIndex(index);
              }}
              onMouseLeave={() => {
                setHoveredIndex(null);
              }}
            >
              <Button
                type="link"
                icon={
                  selectedImageIsSelected(image) ? (
                    <CheckSquareOutlined
                      style={{
                        fontSize: 24,
                        color: "white",
                      }}
                      css={css`
                        opacity: 0.7;
                        &:hover {
                          opacity: 1;
                        }
                      `}
                      onClick={() => {
                        selectedImagesRemove(image);
                      }}
                    />
                  ) : (
                    <BorderOutlined
                      style={{
                        fontSize: 24,
                        color: "white",
                      }}
                      css={css`
                        opacity: 0.7;
                        &:hover {
                          opacity: 1;
                        }
                      `}
                      onClick={() => {
                        selectedImagesAdd(image);
                      }}
                    />
                  )
                }
                style={{
                  backgroundColor: "transparent",
                  position: "absolute",
                  top: 5,
                  left: 5,
                  zIndex: 1,
                }}
                css={css`
                  opacity: ${index === hoveredIndex ||
                  selectedImageIsSelected(image)
                    ? 1
                    : 0};
                  ${DeviceScreen.mobile} {
                    opacity: 1;
                  }
                `}
              />
              <span
                style={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  // color: "red",
                  // opacity: 1,
                  opacity: 0.2,
                  color: "white", // Set a base color for the text
                  mixBlendMode: "difference", // Apply a blend mode
                  zIndex: 1,
                  display: "flex",
                  gap: 5,
                }}
              >
                {image.thumbnail_url ? (
                  <FullscreenExitOutlined
                    style={{
                      color: imageExistsInDontThumbnail(image.image_url)
                        ? "red"
                        : "white",
                    }}
                  />
                ) : null}
                {index + 1}
              </span>

              <div
                onClick={() => {
                  if (selectedImages.length > 0) {
                    selectedImageToggle(image);
                  } else {
                    handleClick(
                      index,
                      shouldImageUseThumbnail(image.image_url),
                    );
                  }
                }}
                css={css`
                  // border: 1px solid grey;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  grid-row-end: span 10;
                  width: 100%;
                  cursor: pointer;
                  position: relative;
                `}
              >
                {imagesHiddenIsHidden(image.image_url) ? (
                  <div
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      backgroundColor: "black",
                      zIndex: 0,
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
                    shouldImageUseThumbnail(image.image_url)
                      ? image.thumbnail_url ?? image.image_url
                      : image.image_url
                  }
                  width={320} //640
                  height={240} //480
                  alt="Failed to load image, Reload"
                  // objectFit="cover"
                  // blurDataURL={"https://maravianwebservices.com/images/wicf/assets/logo2.png"}
                  style={{
                    width: "100%",
                    height: "auto",
                  }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  width: "100%",
                  height: 40,
                  backgroundColor: "rgba(1,1,1,0.7)",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  transition: "0.5s",
                }}
                css={css`
                  opacity: ${index === hoveredIndex ? 1 : 0};
                  ${DeviceScreen.mobile} {
                    opacity: 1;
                  }
                `}
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                {/* <Button
                  type="link"
                  icon={
                    <DownloadOutlined
                      style={{ fontSize: 24, color: "white" }}
                      css={css`
                        opacity: 0.7;
                        &:hover {
                          opacity: 1;
                        }
                      `}
                    />
                  }
                  onClick={async () => {
                    if(image.thumbnail_url){
                    }else {
                      utilFilesDownload5_images({ images: [image] });
                    }
                  }}
                /> */}
                <Button
                  type="link"
                  icon={
                    <ShareAltOutlined
                      style={{ fontSize: 24, color: "white" }}
                      css={css`
                        opacity: 0.7;
                        &:hover {
                          opacity: 1;
                        }
                      `}
                    />
                  }
                  onClick={() => {
                    utilShareLink({
                      window,
                      navigator,
                      url: `${window.location.origin}${
                        router.asPath.split("?")[0]
                      }?idx=${index}`,
                    });
                  }}
                />
                {!isAdmin ? null : (
                  <>
                    <Button
                      type="link"
                      icon={
                        imagesHiddenIsHidden(image.image_url) ? (
                          <EyeOutlined
                            style={{ fontSize: 24, color: "white" }}
                            css={css`
                              opacity: 0.7;
                              &:hover {
                                opacity: 1;
                              }
                            `}
                          />
                        ) : (
                          <EyeInvisibleOutlined
                            style={{ fontSize: 24, color: "white" }}
                            css={css`
                              opacity: 0.7;
                              &:hover {
                                opacity: 1;
                              }
                            `}
                          />
                        )
                      }
                      onClick={async () => {
                        imagesHiddenToggle(image);
                      }}
                    />
                    <Button
                      type="link"
                      icon={
                        imageExistsInDontThumbnail(image.image_url) ? (
                          <FullscreenExitOutlined
                            style={{ fontSize: 24, color: "red" }}
                            css={css`
                              opacity: 0.7;
                              &:hover {
                                opacity: 1;
                              }
                            `}
                          />
                        ) : (
                          <FullscreenExitOutlined
                            style={{ fontSize: 24, color: "white" }}
                            css={css`
                              opacity: 0.7;
                              &:hover {
                                opacity: 1;
                              }
                            `}
                          />
                        )
                      }
                      onClick={async () => {
                        imagesDontThumbnailToggle(image);
                      }}
                      style={{
                        display: image.thumbnail_url ? "unset" : "none",
                      }}
                    />
                  </>
                )}
                <Popconfirm
                  title="Download full Image?"
                  okButtonProps={{ hidden: image.thumbnail_url ? false : true }}
                  okText={"Normal Image"}
                  onConfirm={() => {
                    image.thumbnail_url &&
                      utilFilesDownload5_images({
                        images: [image.thumbnail_url],
                      });
                  }}
                  cancelText="Full Image"
                  onCancel={() => {
                    utilFilesDownload5_images({ images: [image.image_url] });
                  }}
                >
                  <DownloadOutlined
                    style={{ fontSize: 24, color: "white" }}
                    css={css`
                      opacity: 0.7;
                      &:hover {
                        opacity: 1;
                      }
                    `}
                  />
                </Popconfirm>
                <OptionsDropDown
                  options={[
                    ...(isAdmin
                      ? [
                          {
                            label: "Make Album Poster (Full Image)",
                            onClick: () => {
                              photos_album_set_thumbnail(image.image_url);
                            },
                          },
                          image.thumbnail_url
                            ? {
                                label: "Make Album Poster (Thumbnail)",
                                onClick: () => {
                                  image.thumbnail_url &&
                                    photos_album_set_thumbnail(
                                      image.thumbnail_url,
                                    );
                                },
                              }
                            : undefined,
                        ]
                      : []),
                    ...(session.data
                      ? [
                          {
                            label: "Make My Profile Picture",
                            onClick: () => {
                              profilePictureSet({
                                image_url: shouldImageUseThumbnail(
                                  image.image_url,
                                )
                                  ? image.thumbnail_url ?? image.image_url
                                  : image.image_url,
                              });
                            },
                          },
                        ]
                      : []),
                  ]}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          width: "100%",
          height: "50px",
          borderTop: "1px solid grey",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: selectedImages.length > 0 ? 70 : 0,
          position: "relative",
        }}
      >
        <div
          ref={divRef}
          style={{
            position: "absolute",
            bottom: "200vh",
          }}
        ></div>
        {imagesFinished ? (
          imagesIsAllLoaded(indexCurrent) ? (
            "End of Album"
          ) : (
            <Button
              onClick={() => {
                imagesLoadMore();
              }}
            >
              Load More Images
            </Button>
          )
        ) : (
          <LoadingOutlined />
        )}
      </div>
      <div
        style={{
          width: "100vw",
          height: 70,
          display: selectedImages.length > 0 ? "flex" : "none",
          alignItems: "center",
          justifyContent: "space-evenly",
          backgroundColor: "black",
          position: "fixed",
          bottom: 0,
          zIndex: 100,
        }}
      >
        {/* <DownloadOutlined
          style={{ fontSize: 24 }}
          css={css(sharedIconCss)}
          onClick={() => {
            utilFilesDownload5_images({
              images: selectedImages,
              zipName: album_key,
            });
          }}
        /> */}
        {!isAdmin ? null : (
          <>
            <EyeOutlined
              style={{ fontSize: 24 }}
              css={css(sharedIconCss)}
              onClick={() => {
                imagesHiddenRemove(
                  returnImageUrls({
                    images: selectedImages,
                    useThumbnails: false,
                  }),
                );
              }}
            />
            <EyeInvisibleOutlined
              style={{ fontSize: 24 }}
              css={css(sharedIconCss)}
              onClick={() =>
                imagesHiddenAdd(
                  returnImageUrls({
                    images: selectedImages,
                    useThumbnails: false,
                  }),
                )
              }
            />
          </>
        )}
        <span style={{ color: "white", fontSize: 18 }} css={css(sharedIconCss)}>
          {selectedImages.length}
        </span>
        <CloseSquareOutlined
          style={{ fontSize: 24 }}
          css={css(sharedIconCss)}
          onClick={() => selectedImagesClear()}
        />
        <Popconfirm
          title="Download full Image?"
          okText="Normal Images"
          onConfirm={() => {
            utilFilesDownload5_images({
              images: returnImageUrls({
                images: selectedImages,
                useThumbnails: true,
              }),
              zipName: album_key,
            });
          }}
          cancelText="Full Images"
          onCancel={() => {
            utilFilesDownload5_images({
              images: returnImageUrls({
                images: selectedImages,
                useThumbnails: false,
              }),
              zipName: album_key,
            });
          }}
        >
          <DownloadOutlined style={{ fontSize: 24 }} css={css(sharedIconCss)} />
        </Popconfirm>
        {isAdmin ? (
          <OptionsDropDown
            options={[
              selectedImages.length !== images.length
                ? {
                    label: "Select All",
                    onClick: () => {
                      setSelectedImages(images);
                    },
                  }
                : {
                    label: "DeSelect All",
                    onClick: () => {
                      setSelectedImages([]);
                    },
                  },
              {
                label: "Use Thumbnails (On)",
                onClick: () => {
                  imagesDontThumbnailRemove(
                    returnImageUrls({
                      images: selectedImages,
                      useThumbnails: false,
                    }),
                  );
                },
              },
              {
                label: "Use Thumbnails (Off)",
                onClick: () => {
                  imagesDontThumbnailAdd(
                    returnImageUrls({
                      images: selectedImages,
                      useThumbnails: false,
                    }),
                  );
                },
              },
            ]}
          />
        ) : null}
      </div>
    </>
  );
}

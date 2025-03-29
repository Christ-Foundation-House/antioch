/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useEffect, useRef, useState } from "react";
import Lightbox, { SlideImage } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
// import { images, CustomImage } from "./Images";
// import Image from "next/image";
import { DeviceScreen, sharedIconCss } from "@/styles/theme";
import {
  BorderOutlined,
  CheckSquareOutlined,
  CloseSquareOutlined,
  DownloadOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  LoadingOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import {
  Counter,
  Download,
  Fullscreen,
  // Inline,
  // Slideshow,
  Thumbnails,
  Share,
  Zoom,
} from "yet-another-react-lightbox/plugins";

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/counter.css";
import copy from "copy-to-clipboard";
import React from "react";
import { useRouter } from "next/router";
import { Button } from "antd";
import { toast } from "react-toastify";

import {
  POST_photos_album_hidden_images_set,
  POST_photos_album_set_thumbnail,
} from "@/requests";
import OptionsDropDown from "@/components/OptionsDropDown";
// import NextJsImage from "@/components/photos/NextJsImage";
import { throttle } from "lodash";
import axios from "axios";
// import saveAs from "file-saver";
import JSZip from "jszip";
import path from "path";
export interface PropsPhotoGallery {
  images: string[];
  imagesHidden?: string[];
  refetch?: () => void;
  isAdmin?: boolean;
}
export default function PhotoGallery3(props: PropsPhotoGallery) {
  const router = useRouter();
  const { isAdmin } = props;
  const { imagesHidden } = props;
  const { idx, album_key } = router.query as {
    idx: string;
    album_key: string;
  };
  const [images, setImages] = useState<string[]>([]);
  useEffect(() => {
    let imagesNew: string[] = [];
    imagesNew = props.images.filter(
      (img) => isAdmin || !imagesHidden?.includes(img),
    );
    setImages(imagesNew);
  }, [isAdmin, imagesHidden, props.images]);
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
  function imagesHiddenToggle(image: string) {
    if (imagesHidden?.includes(image)) {
      imagesHiddenRemove([image]);
    } else {
      imagesHiddenAdd([image]);
    }
  }
  function imagesHiddenIsHidden(image: string) {
    return imagesHidden?.includes(image);
  }
  // const [index, setIndex] = useState<number | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imagesFinished, setImagesFinished] = useState(false);
  function setIndex(index_: number) {
    router.push({
      pathname: `/photos/${album_key}`,
      query: { idx: index_.toString() },
    });
  }
  const handleClick = (
    index_: number,
    // item: SlideImage
  ) => {
    setIndex(index_);
    setCurrentImage(images[index_]);
  };
  const divRef = useRef<HTMLDivElement>(null);

  const [indexBatch] = useState(10);
  const [indexMax, setIndexMax] = useState(images.length - 1);
  const [indexCurrent, setIndexCurrent] = useState(indexBatch);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const slides: SlideImage[] =
    images.map((img) => ({
      src: img,
      title: "SD",
    })) ?? [];
  function photos_album_set_thumbnail(image_url: string) {
    toast
      .promise(POST_photos_album_set_thumbnail({ album_key, image_url }), {
        pending: "Setting Thumbnail...",
        success: "Thumbnail successfully set",
        error: "Failed to set thumbnail",
      })
      .then(() => {
        // eslint-disable-next-line no-unused-expressions
        props.refetch && props.refetch();
      })
      .catch((e) => {
        console.error(e);
      });
  }
  useEffect(() => {
    setIndexMax(images.length);
    setIndexCurrent(images.length < indexBatch ? images.length : indexBatch);
  }, [indexBatch, images.length]);
  useEffect(() => {
    if (idx !== null) setCurrentImage(null);
  }, [idx]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && images) {
            console.log("Loading more imagees!");
            setIndexCurrent((prev) =>
              prev + 10 < indexMax ? prev + indexBatch : indexMax,
            );
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
  }, [indexBatch, indexMax, images]);

  useEffect(() => {
    if (idx) {
      setCurrentImage(images[Number(idx)]);
    }
  }, [images, idx]);

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  function selectedImagesAdd(image: string) {
    setSelectedImages([...selectedImages, image]);
  }
  function selectedImagesRemove(image: string) {
    setSelectedImages(selectedImages.filter((img) => img !== image));
  }
  function selectedImagesClear() {
    console.log("Clearing selected images");
    setSelectedImages([]);
  }
  function selectedImageIsSelected(image: string) {
    return selectedImages.includes(image);
  }
  function selectedImageToggle(image: string) {
    if (selectedImages.includes(image)) {
      selectedImagesRemove(image);
    } else {
      selectedImagesAdd(image);
    }
  }
  // const [progress, setProgress] = useState<number>(0);
  // const throttledSetProgress = throttle(setProgress, 200); // Update progress at most once every 200ms
  // async function utilFilesDownload5({
  //   urls,
  //   setProgress,
  // }: {
  //   urls: string[];
  //   setProgress?: (progress: number) => void;
  // }): Promise<void> {
  //   setProgress && setProgress(0);
  //   if (urls.length === 1) {
  //     // If there's only one URL, download the file directly
  //     const urlObj = new window.URL(urls[0]);
  //     const filename = decodeURIComponent(
  //       urlObj.pathname.split("/").pop() || "file"
  //     );
  //     const response = await axios.get(urls[0], {
  //       responseType: "blob",
  //       onDownloadProgress: (progressEvent) => {
  //         const percentCompleted = Math.floor(
  //           (progressEvent.loaded * 100) / (progressEvent.total ?? 1)
  //         );
  //         setProgress && setProgress(percentCompleted);
  //       },
  //     });
  //     saveAs(response.data, filename);
  //     setProgress && setProgress(100);
  //   } else {
  //     // If there are multiple URLs, download them as a zip file
  //     const zip = new JSZip();
  //     const totalFiles = urls.length;
  //     let completedFiles = 0;

  //     const filePromises = urls.map(async (url, i) => {
  //       const urlObj = new window.URL(url);
  //       const filename = decodeURIComponent(
  //         urlObj.pathname.split("/").pop() || `file${i + 1}`
  //       );
  //       const response = await axios.get(url, {
  //         responseType: "blob",
  //         onDownloadProgress: (progressEvent) => {
  //           const percentCompleted = Math.floor(
  //             (progressEvent.loaded * 100) / (progressEvent.total ?? 1)
  //           );
  //           const totalPercentCompleted = Math.floor(
  //             ((completedFiles + percentCompleted / 100) / totalFiles) * 100
  //           );
  //           setProgress && setProgress(totalPercentCompleted);
  //         },
  //       });
  //       zip.file(filename, response.data);
  //       completedFiles++;
  //     });

  //     await Promise.all(filePromises);

  //     const urlObj = new window.URL(urls[0]);
  //     const zipFolderName = decodeURIComponent(
  //       urlObj.pathname.split("/").slice(-2, -1)[0] || "files"
  //     );
  //     const zipBlob = await zip.generateAsync({ type: "blob" });
  //     saveAs(zipBlob, `${zipFolderName}.zip`);
  //     setProgress && setProgress(100);
  //   }
  // }
  // const downloadImages = useCallback(
  //   async function (images: string[]) {
  //     setProgress(0);
  //     await toast
  //       .promise(
  //         utilFilesDownload4({
  //           urls: images,
  //           setProgress: (p) => {
  //             console.log("p", p);
  //             throttledSetProgress(p);
  //           },
  //         }),
  //         {
  //           pending: `Preparing image ${progress}%`,
  //           success: "Successfully got your image",
  //           error: "Request failed",
  //         }
  //       )
  //       .then((res) => {
  //         console.log(res);
  //       })
  //       .catch((error) => {
  //         console.error("Failed to download images");
  //         console.error(error);
  //       });
  //   },
  //   [progress]
  // );

  async function downloadFile(url, onProgress) {
    const headRes = await axios.head(url);
    const totalSize = parseInt(headRes.headers["content-length"], 10);

    const response = await axios.get(url, {
      responseType: "blob",
      onDownloadProgress: (progressEvent) => {
        const percentCompleted = Math.floor(
          (progressEvent.loaded * 100) / totalSize,
        );
        onProgress(percentCompleted, progressEvent.loaded);
      },
    });
    return { data: response.data, size: totalSize };
  }
  async function downloadFiles(urls, onProgress) {
    const zip = new JSZip();
    const totalFiles = urls.length;
    let completedFiles = 0;
    let totalSize = 0;
    let downloadedSize = 0;

    const filePromises = urls.map(async (url) => {
      const { data, size } = await downloadFile(url, (progress, fileSize) => {
        downloadedSize += fileSize;
        const totalPercentCompleted = Math.floor(
          ((completedFiles + progress / 100) / totalFiles) * 100,
        );
        onProgress(
          totalPercentCompleted,
          downloadedSize,
          totalSize,
          completedFiles + 1,
          totalFiles,
        );
      });
      totalSize += Number(size);
      const fileName = path.basename(new URL(url).pathname);
      zip.file(fileName, data);
      completedFiles++;
    });

    await Promise.all(filePromises);

    const zipBlob = await zip.generateAsync({ type: "blob" });
    return { zipBlob, totalFiles, totalSize };
  }

  function downloadImages(images) {
    const throttledOnProgress = throttle(
      (progress, downloadedSize, totalSize, currentFile, totalFiles) => {
        // const downloadedSizeInMB = (downloadedSize / (1024 * 1024)).toFixed(2);
        // const totalSizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
        // const msg = `Download progress: ${progress}% (${downloadedSizeInMB}/${totalSizeInMB} MB, ${currentFile}/${totalFiles} files)`
        const msg = `Download progress: ${progress}%, ${currentFile}/${totalFiles} files)`;
        // console.log(msg)
        toast.update("download", { render: msg });
      },
      200,
    );

    toast.info("Download started", { toastId: "download" });

    downloadFiles(images, throttledOnProgress)
      .then(({ zipBlob, totalFiles, totalSize }) => {
        const url = window.URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "images.zip");
        document.body.appendChild(link);
        link.click();
        toast.dismiss("download");
        const totalSizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
        toast.success(
          `Download completed (${totalFiles} files, ${totalSizeInMB} MB)`,
        );
      })
      .catch((error) => {
        console.error("Failed to download images", error);
        toast.dismiss("download");
        toast.error("Download failed");
      });
  }
  return (
    <>
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
            // Slideshow,
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
                  // selectedImages.some((img) => img === image)
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
                style={{ position: "absolute", top: 5, right: 5, opacity: 0.2 }}
              >
                {index}
              </span>

              <div
                // onClick={handleClick.bind(null, index)}
                onClick={() => {
                  if (selectedImages.length > 0) {
                    // toast.info("Please deselect multiple images first");
                    selectedImageToggle(image);
                  } else {
                    handleClick(index);
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
                {imagesHiddenIsHidden(image) ? (
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
                  src={image}
                  width={320} //640
                  height={240} //480
                  alt="Wicf Photo"
                  // objectFit="cover"
                  // blurDataURL={
                  //   "https://maravianwebservices.com/images/wicf/assets/logo2.png"
                  // }
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
                <Button
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
                    downloadImages([image]);
                  }}
                />
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
                  onClick={async () => {
                    const url = `${window.location.origin}${
                      router.asPath.split("?")[0]
                    }?idx=${index}`;
                    try {
                      if (navigator.share) {
                        await navigator.share({
                          title: "Share Image",
                          url,
                        });
                      } else {
                        // Fallback for browsers that do not support navigator.share
                        copy(url);
                        toast.success("URL copied to clipboard");
                      }
                    } catch (error) {
                      toast.error("Failed to share or copy URL");
                    }
                  }}
                />
                {!isAdmin ? null : (
                  <>
                    <Button
                      type="link"
                      icon={
                        imagesHiddenIsHidden(image) ? (
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
                    <OptionsDropDown
                      options={[
                        {
                          label: "Make Thumbnail",
                          onClick: () => {
                            photos_album_set_thumbnail(image);
                          },
                        },
                      ]}
                    />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div
        ref={divRef}
        style={{
          width: "100%",
          height: "50px",
          borderTop: "1px solid grey",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: selectedImages.length > 0 ? 70 : 0,
        }}
      >
        {imagesFinished ? "End of Album" : <LoadingOutlined />}
      </div>
      <div
        style={{
          width: "100vw",
          height: 70,
          // borderTop: "1px solid grey",
          display: selectedImages.length > 0 ? "flex" : "none",
          alignItems: "center",
          justifyContent: "space-evenly",
          backgroundColor: "black",
          position: "fixed",
          bottom: 0,
          zIndex: 100,
        }}
      >
        <DownloadOutlined
          style={{ fontSize: 24 }}
          css={css(sharedIconCss)}
          onClick={() => {
            downloadImages(selectedImages);
          }}
        />
        {!isAdmin ? null : (
          <>
            <EyeOutlined
              style={{ fontSize: 24 }}
              css={css(sharedIconCss)}
              onClick={() => {
                imagesHiddenRemove(selectedImages);
              }}
            />
            <EyeInvisibleOutlined
              style={{ fontSize: 24 }}
              css={css(sharedIconCss)}
              onClick={() => imagesHiddenAdd(selectedImages)}
            />
          </>
        )}

        <CloseSquareOutlined
          style={{ fontSize: 24 }}
          css={css(sharedIconCss)}
          onClick={() => selectedImagesClear()}
        />
        <span style={{ color: "white", fontSize: 18 }} css={css(sharedIconCss)}>
          {selectedImages.length}
        </span>
      </div>
    </>
  );
}

/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useEffect, useRef, useState } from "react";
// import { Gallery } from "react-grid-gallery";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
// import { images, CustomImage } from "./Images";
// import Image from "next/image";
import { DeviceScreen } from "@/styles/theme";
import { Modal } from "antd";

export interface PropsPhotoGallery {
  images: string[];
}
export default function PhotoGallery(props: PropsPhotoGallery) {
  const images = props.images;
  const [index, setIndex] = useState(0);
  const currentImage = images[index];
  const nextIndex = (index + 1) % images.length;
  const nextImage = images[nextIndex] || currentImage;
  const prevIndex = (index + images.length - 1) % images.length;
  const prevImage = images[prevIndex] || currentImage;

  const handleClose = () => setIndex(-1);
  const handleMovePrev = () => setIndex(prevIndex);
  const handleMoveNext = () => setIndex(nextIndex);

  // const handleClick = (index: number, item: CustomImage) => {
  //   setIndex(index);
  // };
  const divRef = useRef<HTMLDivElement>(null);

  const [indexBatch] = useState(10);
  const [indexMax] = useState(props.images.length - 1);
  const [indexCurrent, setIndexCurrent] = useState(
    // props.images.length < indexBatch ? props.images.length : indexBatch
    indexBatch,
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && props.images) {
            console.log("Div is in view!");
            // setIndexCurrent(indexCurrent + 10);
            // if remaining images greater than 10 add indexCurrent with 10 if not add with remaining
            setIndexCurrent((prev) =>
              prev + 10 < indexMax ? prev + indexBatch : indexMax,
            );
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
  }, [divRef, indexMax, indexBatch, props.images]);

  // const Modal = useModal();
  const [
    modalIsOpen,
    // setModalIsOpen
  ] = useState(false);
  return (
    <>
      <Modal
        open={modalIsOpen}
        okButtonProps={{ hidden: true }}
        cancelButtonProps={{ hidden: true }}
        //no close
        closeIcon={null}
        style={{
          // border: "1px solid red",
          flex: 1,
          // width: "100vw",
          // height: "100vh",
          // backgroundColor: "red",
          position: "fixed",
          display: "none",
        }}
        bodyStyle={{
          backgroundColor: "blue",
        }}
      >
        <div
          style={{
            // border: "1px solid red",
            width: "100vw",
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            display: "flex",
            accentColor: "red",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <img
            src={currentImage}
            width={1920}
            height={1080}
            alt="Wicf Photo"
            // blurDataURL={
            //   "https://maravianwebservices.com/images/wicf/assets/logo2.png"
            // }
            style={{
              width: "100%",
              height: "auto",
              // maxHeight: 100,
              backgroundColor: "grey",
              objectFit: "cover",
            }}
          />
        </div>
      </Modal>
      {currentImage ? (
        <Lightbox
          mainSrc={currentImage}
          nextSrc={nextImage}
          prevSrc={prevImage}
          onCloseRequest={handleClose}
          onMovePrevRequest={handleMovePrev}
          onMoveNextRequest={handleMoveNext}
        />
      ) : null}
      <div
        style={{
          width: "100%",
          minHeight: props.images ? "100vh" : "0px",
          // display: "flex",
          gap: 10,
          // flexWrap: "wrap",
          paddingTop: 10,
          // border: "10px solid red",
          justifyContent: "space-around",
        }}
        css={css`
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          ${DeviceScreen.tablet} {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          }
          ${DeviceScreen.mobile} {
            // grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 10px;
          }
        `}
      >
        {props.images.slice(0, indexCurrent).map((image, index) => {
          return (
            <div
              // href={image}
              onClick={() => {
                setIndex(index);
                console.log("clicked", index);
              }}
              key={index}
              css={css`
                // border: 1px solid red;
                grid-row-end: span 10;
                width: 100%;
                opacity: 0.9;
                cursor: pointer;
                &:hover {
                  opacity: 1;
                }
              `}
            >
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
                  // maxHeight: 100,
                  // backgroundColor : "grey",
                }}
              />
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
          // border: "1px solid red",
        }}
        // on scroll into view
        onScrollCapture={() => console.log("scrolling")}
      />
    </>
  );
}

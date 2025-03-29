// /** @jsxImportSource @emotion/react */
// import { css } from "@emotion/react";
// import { useState } from "react";
// import { Gallery } from "react-grid-gallery";
// import Lightbox from "yet-another-react-lightbox";
// import "yet-another-react-lightbox/styles.css";
// import {
//   // images as imgs,
//   CustomImage,
// } from "./Images";
// import { useQuery } from "react-query";

// export default function PhotoGallery2(props: { images: string[] }) {
//   const images = props.images ?? [];
//   const [index, setIndex] = useState(-1);
//   // const images = imgs.map((img) => ({
//   //   src: img.src,
//   //   original: img.original,
//   // }));
//   // const data_photos_album = useQuery(["photos_albums_get"], () =>
//   //   fetch("/api/photos/album").then((res) => res.json())
//   // );
//   // const [images, setImages] = useState<[]>([
//   //   {
//   //     src: "https://c2.staticflickr.com/9/8817/28973449265_07e3aa5d2e_b.jpg",
//   //     original:
//   //       "https://c2.staticflickr.com/9/8817/28973449265_07e3aa5d2e_b.jpg",
//   //     // width: 1920,
//   //     // height: 9,
//   //     // caption: "sdsds",
//   //   },
//   //   {
//   //     src: "https://c5.staticflickr.com/9/8768/28941110956_b05ab588c1_b.jpg",
//   //     original:
//   //       "https://c5.staticflickr.com/9/8768/28941110956_b05ab588c1_b.jpg",
//   //     // width: 16,
//   //     // height: 9,
//   //   },
//   // ]);
//   const currentImage = images[index];
//   const nextIndex = (index + 1) % images.length;
//   const nextImage = images[nextIndex] || currentImage;
//   const prevIndex = (index + images.length - 1) % images.length;
//   const prevImage = images[prevIndex] || currentImage;

//   const handleClose = () => setIndex(-1);
//   const handleMovePrev = () => setIndex(prevIndex);
//   const handleMoveNext = () => setIndex(nextIndex);

//   const handleClick = (index: number, item: CustomImage) => {
//     setIndex(index);
//     // handleMoveNext();
//     // handleMovePrev();
//   };
//   // const slides = images.map(({ original, width, height }) => ({
//   //   src: original,
//   //   width,
//   //   height,
//   // }));
//   // const slides = data_photos_album.data
//   //   ? data_photos_album.data.map((img_url) => ({
//   //       src: img_url,
//   //       // width,
//   //       // height,
//   //     }))
//   //   : [];
//   const slides = images.map((img) => ({
//     src: img,
//     width: "320px",
//     height: "240px",
//   }));
//   return (
//     <div
//       style={{
//         // width: "100%",
//         // height: "100%",
//         border: "1px solid red",
//       }}
//       css={css`
//         &:hover {
//           // scale: 0.9;
//         }
//       `}
//     >
//       <Gallery
//         // images={images}
//         images={slides}
//         onClick={handleClick}
//         enableImageSelection={false}
//       />
//       {!!currentImage && (
//         <Lightbox
//           slides={slides}
//           open={index >= 0}
//           index={index}
//           close={() => setIndex(-1)}
//         />
//       )}
//     </div>
//   );
// }

import { TypeSession } from "@/shared/shared_types";
import { permissionReturnRedirectionOrProps } from "@/utils/permission";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import ImagePage from "./[photo_index]";
import { POST_photos_album_get, POST_photos_album_views_add } from "@/requests";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const photosAlbum = await POST_photos_album_get({
    album_key: context.query.album_key as string,
    timeout: 5000,
  })
    .then((album) => {
      POST_photos_album_views_add({
        album_key: album.album_key,
      }).catch((e) => {
        console.error(e);
      });
      return album;
    })
    .catch(() => null);
  return permissionReturnRedirectionOrProps({
    session: (await getSession(context.res)) as TypeSession | null,
    routeUrl: context.resolvedUrl,
    noRedirect: true,
    props: {
      photosAlbum: photosAlbum ?? null,
    },
  });
};

export default ImagePage;

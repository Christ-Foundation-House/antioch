import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const routerPhotos = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  imagesDontThumbnailUpdate: protectedProcedure
    .input(z.object({ album_key: z.string() }))
    .input(z.object({ imagesArray: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.photos_album.update({
        where: { album_key: input.album_key },
        data: {
          image_url_array_dont_thumbnail: JSON.stringify(input.imagesArray),
        },
      });
    }),
});

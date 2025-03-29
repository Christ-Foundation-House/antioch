import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { Description } from "@radix-ui/react-dialog";

export const linkRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  hello2: publicProcedure.query(({ input }) => {
    return {
      greeting: `Hello`,
    };
  }),

  create: protectedProcedure
    .input(
      z.object({
        url: z.string(),
        label: z.string().min(1),
        description: z.string().nullish(),
        image_url: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { url, label, image_url, description } = input;
      return ctx.db.link.create({
        data: {
          url,
          label,
          image_url,
          description,
          user_id: ctx.session.user.id,
        },
      });
    }),
  edit: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        url: z.string(),
        label: z.string(),
        description: z.string().nullable(),
        image_url: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, url, label, image_url, description } = input;
      return ctx.db.link.update({
        where: { id },
        data: {
          url,
          label,
          image_url,
          description,
        },
      });
    }),
  get: publicProcedure
    .input(z.object({ show_hidden: z.boolean().optional() }))
    .query(async ({ ctx, input }) => {
      return input.show_hidden
        ? await ctx.db.link.findMany({
            orderBy: { updated_at: "desc" },
            include: {
              user: {
                select: {
                  wicf_member: {
                    select: {
                      first_name: true,
                      last_name: true,
                    },
                  },
                },
              },
            },
          })
        : await ctx.db.link.findMany({
            where: {
              deleted_at: null,
            },
            include: {
              user: {
                select: {
                  wicf_member: {
                    select: {
                      first_name: true,
                      last_name: true,
                    },
                  },
                },
              },
            },
            orderBy: { updated_at: "desc" },
          });
    }),
  hide: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.link.update({
        where: { id: input.id },
        data: { deleted_at: new Date(), user_id: ctx.session.user.id },
      });
    }),
  show: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.link.update({
        where: { id: input.id },
        data: { deleted_at: null },
      });
    }),
});

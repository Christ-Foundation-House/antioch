import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const routerUser = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  profilePictureSet: protectedProcedure
    .input(z.object({ image_url: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          image: input.image_url,
        },
      });
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        first_name: true,
        last_name: true,
        image: true,
      },
    });
  }),
  getWicfMembers: protectedProcedure
    .input(
      z.object({
        only_registed_members: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.wicf_member.findMany({
        where: {
          ...(input.only_registed_members && {
              registration_completion_time: {
                isNot: null,
              },
            } && {
              registration_last_step: {
                isNot: "registration_old",
              },
            } && {
              user_id: {
                not: null,
              },
            }),
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone_number: true,
          address: true,
          registration_completion_time: true,
          user_id: true,
          user: {
            select: {
              id: true,
              image: true,
              email: true,
            },
          },
        },
      });
    }),
});

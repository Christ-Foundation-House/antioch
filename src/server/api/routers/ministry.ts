import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const ministryRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.ministry.findMany({
      include: {
        positions: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.ministry.findUnique({
        where: { id: input.id },
        include: {
          positions: true,
          members: {
            include: {
              user: true,
            },
          },
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        label: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ministry.create({
        data: { ...input, name: input.label.toLowerCase().replace(/ /g, "_") },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        label: z.string(),
        description: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.ministry.update({
        where: { id },
        data: data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ministry.delete({
        where: { id: input.id },
      });
    }),

  // Member management
  addMember: protectedProcedure
    .input(
      z.object({
        ministryId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ministry_member.create({
        data: {
          ministry_id: input.ministryId,
          user_id: input.userId,
        },
      });
    }),

  removeMember: protectedProcedure
    .input(
      z.object({
        ministryId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ministry_member.delete({
        where: {
          ministry_id_user_id: {
            ministry_id: input.ministryId,
            user_id: input.userId,
          },
        },
      });
    }),
});

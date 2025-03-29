import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { leadership_position_type } from "@prisma/client";
export const leadershipPositionRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.leadership_position.findMany({
      include: {
        ministry: true,
        appointments: {
          include: {
            user: true,
            tenure: true,
          },
        },
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.leadership_position.findUnique({
        where: { id: input.id },
        include: {
          ministry: true,
          appointments: {
            include: {
              user: true,
              tenure: true,
            },
          },
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        label: z.string(),
        leadership_type: z.nativeEnum(leadership_position_type).optional(),
        description: z.string().optional(),
        ministryId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.leadership_position.create({
        data: {
          label: input.label,
          leadership_type: input.leadership_type,
          name: input.label.toLowerCase().replace(/ /g, "_"),
          description: input.description,
          ministry_id: input.ministryId,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        leadership_type: z.nativeEnum(leadership_position_type).optional(),
        label: z.string(),
        description: z.string().optional().nullable(),
        ministryId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ministryId, ...rest } = input;
      return ctx.db.leadership_position.update({
        where: { id },
        data: {
          ...rest,
          ministry_id: ministryId,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.leadership_position.delete({
        where: { id: input.id },
      });
    }),
});

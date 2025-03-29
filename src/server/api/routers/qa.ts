import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const qaRouter = createTRPCRouter({
  getTopics: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.qa_topic.findMany({
        include: {
          _count: {
            select: {
              qa_questions: true,
            },
          },
        },
      });
    } catch (e) {
      console.error(e);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch topics",
      });
    }
  }),

  createTopic: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        Label: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.qa_topic.create({
          data: input,
        });
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create topic",
        });
      }
    }),

  updateTopic: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
        Label: z.string().min(1),
        is_open: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input;
        return await ctx.db.qa_topic.update({
          where: { id },
          data,
        });
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update topic",
        });
      }
    }),

  deleteTopic: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.qa_topic.delete({
          where: { id: input.id },
        });
        return true;
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete topic",
        });
      }
    }),

  getTopicStats: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const stats = await ctx.db.qa_topic.findUnique({
          where: { id: input.id },
          include: {
            _count: {
              select: {
                qa_questions: true,
              },
            },
            qa_questions: {
              select: {
                is_addressed: true,
                created_at: true,
                _count: {
                  select: {
                    qa_answers: true,
                  },
                },
              },
            },
          },
        });

        if (!stats) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Topic not found",
          });
        }

        const totalQuestions = stats._count.qa_questions;
        const answeredQuestions = stats.qa_questions.filter(
          (q) => q.is_addressed,
        ).length;
        const questionsWithAnswers = stats.qa_questions.filter(
          (q) => q._count.qa_answers > 0,
        ).length;

        return {
          totalQuestions,
          answeredQuestions,
          questionsWithAnswers,
          questionsPerDay: stats.qa_questions.reduce(
            (acc, q) => {
              const date = q.created_at.toISOString().split("T")[0];
              acc[date] = (acc[date] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
        };
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch topic statistics",
        });
      }
    }),

  getQuestions: publicProcedure
    .input(
      z.object({
        topicName: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db.qa_question.findMany({
          where: { qa_topic: { name: input.topicName } },
          include: {
            qa_topic: true,
            qa_answers: {
              include: {
                user: true,
              },
            },
          },
        });
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch questions",
        });
      }
    }),
  getOneQuestion: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.qa_question.findUnique({
        where: { id: input.id },
        include: {
          qa_topic: true,
          qa_answers: true,
        },
      });
    }),

  createQuestion: publicProcedure
    .input(
      z.object({
        full_name: z.string().min(1),
        subject: z.string().optional(),
        question: z.string().min(1),
        qa_topic_id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.qa_question.create({
          data: input,
        });
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create question",
        });
      }
    }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.number(), is_addressed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.qa_question.update({
          where: { id: input.id },
          data: { is_addressed: input.is_addressed },
        });
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark question as read",
        });
      }
    }),
});

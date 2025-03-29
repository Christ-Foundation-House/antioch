import prisma from "@/lib/prisma";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { handleRequestData, handleRequestError } from "@/shared/shared_actions";
import { z } from "zod";

export interface stats_update_args {
  time: "all" | "current_month" | "current_year";
}

async function createEmptyStats(years: number[], months: number[]) {
  const stats = await prisma.stats.findMany();
  for (const year of years) {
    for (const month of months) {
      const isExist = stats.some((stat) => stat.id === year * 100 + month);
      try {
        if (!isExist) {
          await prisma.stats.create({
            data: {
              id: year * 100 + month,
              year,
              month,
              count_members: 0,
              count_new_members: 0,
              count_feedback: 0,
              count_prayer_request: 0,
              count_report: 0,
            },
          });
        }
      } catch (e) {
        console.log(`Year:${year} & Month:${month} already exist`);
      }
    }
  }
}

function isDate(value: any): value is Date {
  return value instanceof Date;
}

export async function stats_update(args: stats_update_args) {
  const [wicf_members, feedback, prayer_request, report] = await Promise.all([
    prisma.wicf_member.findMany(),
    prisma.wicf_form_feedback.findMany(),
    prisma.wicf_prayer_request.findMany(),
    prisma.report.findMany(),
  ]);

  const wicf_members_new = wicf_members.filter((m) => m.is_new_member);

  const start_year = 2000;
  const current_year = new Date().getFullYear();
  const current_month = new Date().getMonth() + 1;

  const years_array = Array.from(
    { length: current_year - start_year + 1 },
    (_, i) => start_year + i,
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  await createEmptyStats(years_array, months);

  try {
    const updateStats = async (year: number, month: number) => {
      const id = year * 100 + month;
      await prisma.stats.update({
        where: { id },
        data: {
          count_members: wicf_members.filter((item) => {
            const dateValue = item.registration_start_time;
            return (
              isDate(dateValue) &&
              (dateValue.getFullYear() < year ||
                (dateValue.getFullYear() === year &&
                  dateValue.getMonth() + 1 <= month))
            );
          }).length,
          count_new_members: wicf_members_new.filter((item) => {
            const dateValue = item.registration_start_time;
            return (
              isDate(dateValue) &&
              (dateValue.getFullYear() < year ||
                (dateValue.getFullYear() === year &&
                  dateValue.getMonth() + 1 <= month))
            );
          }).length,
          count_feedback: feedback.filter((item) => {
            const dateValue = item.completion_time;
            return (
              isDate(dateValue) &&
              (dateValue.getFullYear() < year ||
                (dateValue.getFullYear() === year &&
                  dateValue.getMonth() + 1 <= month))
            );
          }).length,
          count_prayer_request: prayer_request.filter((item) => {
            const dateValue = item.completion_time;
            return (
              isDate(dateValue) &&
              (dateValue.getFullYear() < year ||
                (dateValue.getFullYear() === year &&
                  dateValue.getMonth() + 1 <= month))
            );
          }).length,
          count_report: report.filter((item) => {
            const dateValue = item.created_at;
            return (
              isDate(dateValue) &&
              (dateValue.getFullYear() < year ||
                (dateValue.getFullYear() === year &&
                  dateValue.getMonth() + 1 <= month))
            );
          }).length,
        },
      });
    };

    if (args.time === "all") {
      for (const year of years_array) {
        for (const month of months) {
          await updateStats(year, month);
        }
      }
    } else if (args.time === "current_month") {
      await updateStats(current_year, current_month);
    } else if (args.time === "current_year") {
      for (const month of months) {
        if (month > current_month) break;
        await updateStats(current_year, month);
      }
    } else {
      console.log(`Invalid time argument: ${args.time}`);
    }

    const stats = await prisma.stats.findMany();
    const firstNonZeroIndex = stats.findIndex((stat) => stat.count_members > 0);
    const filteredStats = stats
      .slice(firstNonZeroIndex)
      .sort((a, b) => a.id - b.id);
    return handleRequestData({
      data: filteredStats,
      message: "Stats updated successfully",
    });
  } catch (e) {
    return handleRequestError({ error: e, message: "Failed to update stats" });
  }
}

export const routerStats = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  get: protectedProcedure
    .input(
      z.object({
        last_number_of_months: z.number().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { last_number_of_months } = input;
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const startMonth = Math.max(1, currentMonth - last_number_of_months + 1);
      const startYear =
        currentYear - Math.floor((currentMonth - startMonth) / 12);

      // Retrieve the stats from the database
      const stats = await ctx.db.stats.findMany({
        orderBy: { id: "asc" },
      });

      const firstNonZeroIndex = stats.findIndex(
        (stat) => stat.count_members > 0,
      );
      const filteredStats = stats.slice(firstNonZeroIndex);

      // Filter the stats to include only data up to the current month and year
      const statsUpToCurrentMonth = filteredStats.filter(
        (stat) =>
          stat.year < currentYear ||
          (stat.year === currentYear && stat.month <= currentMonth),
      );

      return handleRequestData({
        data: statsUpToCurrentMonth,
        message: "Stats retrieved successfully",
      });
    }),
  update: protectedProcedure
    .input(z.object({ time: z.enum(["all", "current_month", "current_year"]) }))
    .mutation(async ({ input }) => {
      try {
        const stats = await stats_update({ time: input.time });
        return stats;
      } catch (e) {
        return handleRequestError({
          error: e,
          message: "Failed to update stats",
        });
      }
    }),
});

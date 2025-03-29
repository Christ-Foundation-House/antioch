import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { reportPostParams } from "@/components/report-page";
import { emailSend } from "@/lib/email";
import { env } from "@/env";
import { TRPCError } from "@trpc/server";
import { emailTemplateReportAcknowledgedByUserToAdmin } from "@/lib/email/emailTemplates";

export const routerReport = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  create: publicProcedure
    .input(reportPostParams)
    .mutation(async ({ ctx, input }) => {
      const report = await ctx.db.report.create({
        data: { ...input, base_url: process.env.NEXTAUTH_URL },
      });
      emailSend({
        to: env.ADMIN_EMAIL ?? "paulkachule@hotmail.com",
        subject: `WICF ${input.type.toUpperCase()} Report #${report.id}`,
        text: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #e0e0e0;">
            <h2 style="color: #333;">System Report - Issue ID: ${report.id}</h2>
            <hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;">

            <p><strong>Title:</strong> ${report.title}</p>
            <p><strong>Type:</strong> ${report.type}</p>

            <p><strong>Reported by:</strong> ${report.name} (<a href="mailto:${report.email}" style="color: #1a73e8;">${report.email}</a>)</p>
            
            <p><strong>Description:</strong></p>
            <p style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">
              ${report.description}
            </p>

            <p><strong>Related URL:</strong> <a href="${report.base_url}/${report.url}" style="color: #1a73e8;">${report.base_url}/${report.url}</a></p>

            <p><strong>User ID:</strong> ${report.user_id}</p>

            <p><strong>Addressed:</strong> ${report.is_addressed ? "Yes" : "No"}</p>

            <p><strong>Created on:</strong> ${new Date(report.created_at).toLocaleString()}</p>
            <p><strong>Last updated on:</strong> ${new Date(report.updated_at).toLocaleString()}</p>

            <hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;">
            <p style="color: #666;">Thank you for your attention.</p>
          </div>
        `,
      });
      return true;
    }),
  get: protectedProcedure.query(async ({ ctx }) => {
    const reports = await ctx.db.report.findMany();

    // Compute statistics
    const stats = {
      totalReports: reports.length,
      addressedReports: reports.filter((r) => r.is_addressed).length,
      unaddressedReports: reports.filter((r) => !r.is_addressed).length,
      closedReports: reports.filter((r) => r.is_closed_by_user).length,

      // Count unique types and their occurrences
      uniqueTypes: reports.reduce(
        (acc, report) => {
          if (report.type) {
            const existingType = acc.find((t) => t.name === report.type);
            if (existingType) {
              // Explicitly tell TypeScript that value is a number
              existingType.value = (existingType.value as number) + 1;
            } else {
              acc.push({ name: report.type, value: 1 });
            }
          }
          return acc;
        },
        [] as { name: string; value: number }[],
      ),
    };

    return { reports, stats };
  }),
  mark_as_addressed: protectedProcedure
    .input(z.object({ reportId: z.number(), value: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const report = await ctx.db.report.update({
        where: { id: input.reportId },
        data: { is_addressed: input.value ? new Date() : null },
      });

      return report;
    }),
  acknowledge_fixed: protectedProcedure
    .input(
      z.object({
        reportId: z.number(),
        value: z.boolean(),
        email: z.string().email(),
        marked_on_system: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const report = await ctx.db.report.findUnique({
          where: {
            id: input.reportId,
            email: input.email,
          },
        });

        if (!report) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "The report was not found, or the data is incorrect",
          });
        }
        if (report.is_closed_by_user && !input.marked_on_system) {
          // return true;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "The report has already been marked as complete",
          });
        }
        const report_marked = await ctx.db.report.update({
          where: { id: report.id },
          data: { is_closed_by_user: input.value ? new Date() : null },
        });

        if (report_marked && env.ADMIN_EMAIL && !input.marked_on_system) {
          emailSend({
            to: env.ADMIN_EMAIL,
            subject: `Report Id: ${report.id} Marked Fixed by User`,
            text: emailTemplateReportAcknowledgedByUserToAdmin({
              userName: report.name ?? "",
              reportTitle: `Report: #${report.id} =>` + report.title ?? "",
              reportDate: report.created_at.toString() ?? "",
              reportFixedDate: report.is_addressed?.toString() ?? "",
              reportLink: "https://wicf.maravian.com/dashboard/admin/reports",
            }),
          });
        }
        return true;
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: e.message ?? "Failed to mark report as fixed",
        });
      }
    }),
});

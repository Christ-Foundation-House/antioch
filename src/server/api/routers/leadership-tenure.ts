import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { emailSend } from "@/lib/email";
import { emailTemplateAppointmentNotification } from "@/lib/email/emailTemplates";

export const leadershipTenureRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.leadership_tenure.findMany({
      include: {
        appointments: {
          include: {
            user: {
              include: {
                wicf_member: true,
              },
            },
            position: {
              include: {
                ministry: true,
              },
            },
          },
          orderBy: [
            { position: { ministry: { name: "asc" } } },
            { position: { name: "asc" } },
          ],
          // where: {
          //   status: "active",
          // },
        },
      },
      orderBy: {
        start_date: "desc",
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.leadership_tenure.findUnique({
        where: { id: input.id },
        include: {
          appointments: {
            include: {
              user: true,
              position: {
                include: {
                  ministry: true,
                },
              },
            },
          },
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        label: z.string(),
        // name: z.string(),
        description: z.string().optional(),
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.leadership_tenure.create({
        data: {
          label: input.label,
          name: input.label.toLowerCase().replace(/ /g, "_"),
          description: input.description,
          start_date: input.startDate,
          end_date: input.endDate,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        label: z.string(),
        description: z.string().optional(),
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, startDate, endDate, ...rest } = input;
      return ctx.db.leadership_tenure.update({
        where: { id },
        data: {
          ...rest,
          description: input.description,
          start_date: startDate,
          end_date: endDate,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.leadership_tenure.delete({
        where: { id: input.id },
      });
    }),

  // Appointment management
  createAppointment: protectedProcedure
    .input(
      z.object({
        tenureId: z.string(),
        positionId: z.string(),
        userId: z.string(),
        startDate: z.date(),
        endDate: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.leadership_appointment.create({
        data: {
          tenure_id: input.tenureId,
          position_id: input.positionId,
          tenure_position_id: `${input.tenureId}-${input.positionId}-${input.startDate.toISOString()}-TO-${input.endDate?.toISOString()}`,
          user_id: input.userId,
          start_date: input.startDate,
          end_date: input.endDate,
          status: "active",
        },
      });
    }),

  updateAppointment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        startDate: z.date(),
        endDate: z.date().optional(),
        status: z.enum(["active", "completed", "terminated"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, startDate, endDate, status } = input;
      return ctx.db.leadership_appointment.update({
        where: { id },
        data: {
          start_date: startDate,
          end_date: endDate,
          status,
        },
      });
    }),

  removeAppointment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.leadership_appointment.delete({
        where: { id: input.id },
      });
    }),

  notifyAppointment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const appointment = await ctx.db.leadership_appointment.findUnique({
        where: { id: input.id },
        include: {
          user: {
            include: {
              wicf_member: true,
            },
          },
          position: true,
          tenure: true,
        },
      });
      if (!appointment) {
        throw new Error("Appointment not found");
      }
      const { user, position, tenure } = appointment;
      // const { first_name, last_name, email } = user;
      const first_name = user.wicf_member?.first_name ?? user.first_name ?? "";
      const last_name = user.wicf_member?.last_name ?? user.last_name ?? "";
      const email = user.wicf_member?.email ?? user.email ?? "";
      const { name: positionName } = position;
      const { label: tenureLabel } = tenure;
      const { start_date: tenureFrom, end_date: tenureTo } = tenure;
      const message = `You have been appointed to ${positionName} in ${tenureLabel}`;
      const res = await emailSend({
        to: email,
        subject: "WICF LeadershipAppointment Notification",
        text: emailTemplateAppointmentNotification({
          first_name,
          last_name,
          position: positionName,
          tenure_from: tenureFrom.toISOString(),
          tenure_to: tenureTo.toISOString(),
          accept_link: `${process.env.NEXT_PUBLIC_APP_URL}/leadership/appointment/${appointment.id}/accept`,
        }),
      });
      if (res.error) {
        throw new Error(res.error);
      }
      return {
        is_error: false,
        message: "Appointment notified successfully",
      };
    }),
  acceptAppointment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.leadership_appointment.update({
        where: { id: input.id, user_id: ctx.session.user.id },
        data: {
          is_accepted: new Date(),
        },
      });
    }),
});

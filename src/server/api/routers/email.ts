import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { emailSend } from "@/lib/email";
import { TRPCError } from "@trpc/server";

export const emailRouter = createTRPCRouter({
  sendEmail: protectedProcedure
    .input(
      z.object({
        to: z.string().email(),
        subject: z.string(),
        text: z.string(),
        html: z.string().optional(),
        returnResponseOrError: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (
          !ctx.session?.user?.roles?.some(
            (role) => role.name === "admin" || role.name === "leaders",
          )
        ) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You are not authorized to send emails",
          });
        }
        // Call the emailSend function to send the email
        const result = await emailSend({
          to: input.to,
          subject: input.subject,
          text: input.text ?? "",
          html: input.html ?? `<b>${input.text ?? ""}</b>`,
          returnResponseOrError: input.returnResponseOrError ?? false,
          is_from_api: true,
        });

        // Log the result of the email sending in the database
        await ctx.db.emails_sent.create({
          data: {
            to: input.to,
            subject: input.subject,
            text: input.text ?? "",
            html: input.html ?? `<b>${input.text ?? ""}</b>`,
            is_successful: result === true,
            user: {
              connect: {
                id: ctx.session.user.id,
              },
            },
          },
        });

        // Return success message
        return {
          success: result === true,
          message: "Email sent successfully",
        };
      } catch (error) {
        // Log the error in the database
        await ctx.db.emails_sent.create({
          data: {
            to: input.to,
            subject: input.subject,
            text: input.text ?? "",
            html: input.html ?? `<b>${input.text ?? ""}</b>`,
            is_successful: false,
            error: error.message ?? JSON.stringify(error),
          },
        });

        // Throw the error back to the client
        throw new Error("Failed to send email");
      }
    }),
});

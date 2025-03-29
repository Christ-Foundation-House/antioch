import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { emailSend } from "@/lib/email";
import { env } from "@/env";
import { TRPCError } from "@trpc/server";
import { form_field_type } from "@prisma/client";
import { Prisma } from "@prisma/client";

const system_redirect_link = env.NEXTAUTH_URL + "/dashboard/prayer/requests";
const formFieldTypeEnum = z.enum(
  Object.values(form_field_type) as [string, ...string[]],
);

export const routerForms = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
  get_one_form: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      try {
        return ctx.db.form.findUnique({
          where: {
            id: input.id,
          },
          include: {
            fields: {
              include: {
                options: true,
                responses: true,
              },
            },
          },
        });
      } catch (e) {
        console.error(e);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  get_forms: protectedProcedure.query(({ ctx }) => {
    try {
      return ctx.db.form.findMany({
        where: {
          user_id: ctx.session.user.id,
          is_deleted: false,
        },
      });
    } catch (e) {
      console.error(e);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  create_form: protectedProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const form = await ctx.db.form.create({
          data: {
            title: input.title,
            user: {
              connect: {
                id: ctx.session.user.id,
              },
            },
          },
        });
        return form;
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Form failed to create",
        });
      }
    }),
  delete_form: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const form = await ctx.db.form.update({
          where: {
            id: input.id,
            user_id: ctx.session.user.id,
          },
          data: {
            is_deleted: true,
          },
        });
        return form;
      } catch (e) {
        console.error(e);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  edit_form: protectedProcedure
    .input(z.object({ id: z.string(), title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const form = await ctx.db.form.update({
          where: {
            id: input.id,
            user_id: ctx.session.user.id,
          },
          data: {
            title: input.title,
          },
        });
        return form;
      } catch (e) {
        console.error(e);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  form_fields_actions: protectedProcedure
    .input(
      z.object({
        action: z.enum(["add", "remove"]),
        form_id: z.string(),
        action_add: z
          .object({
            field_label: z.string(),
            field_type: formFieldTypeEnum,
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const form = await ctx.db.form.findUnique({
          where: {
            id: input.form_id,
            user_id: ctx.session.user.id,
          },
          include: {
            fields: true,
          },
        });
        const order_array = form?.fields.map((field) => field.order) ?? [];
        const largest_order = Math.max(...order_array);

        if (!form)
          throw new TRPCError({ code: "NOT_FOUND", message: "Form Not Found" });
        switch (input.action) {
          case "add":
            if (!input.action_add) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Provide all required values",
              });
            }
            return await ctx.db.form_field.create({
              data: {
                form_id: form.id,
                label: input.action_add.field_label,
                type: input.action_add.field_type as form_field_type,
                order: largest_order + 1,
              },
            });
          default:
            throw new TRPCError({ code: "BAD_REQUEST", message: "No Action" });
        }
        return;

        return form;
      } catch (e) {
        console.error(e);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});

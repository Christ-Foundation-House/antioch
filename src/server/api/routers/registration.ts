import { z } from "zod";
import { env } from "@/env";
import { wicf_member } from "@prisma/client";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  actionUserCreate,
  handleRequestData,
  handleRequestError,
} from "@/shared/shared_actions";
import { TRPCError } from "@trpc/server";
import { GetErrorMessage } from "@/lib/errors";
import { notification_push } from "@/utils/notifications";
import { logger } from "@/lib/logger";
import { emailSend } from "@/lib/email";
import {
  emailTemplateBanned,
  emailTemplateUnbanned,
  emailTemplateWelcome,
} from "@/lib/email/emailTemplates";

export const routerRegistration = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  action: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        wicf_id: z.number().optional(),
        action: z.enum([
          "user_verify",
          "send_welcome_email",
          "ban",
          "unban",
          "acknowledge_new_member",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let user = input.id
        ? await ctx.db.user.findUnique({
            where: {
              id: input.id,
            },
            include: {
              wicf_member: true,
            },
          })
        : undefined;
      const wicf_member = input.wicf_id
        ? await ctx.db.wicf_member.findUnique({
            where: {
              id: input.wicf_id,
            },
            include: {
              user: true,
            },
          })
        : undefined;
      function send_welcome_email(args: {
        email: string;
        first_name: string;
        last_name: string;
        wicf_id: number;
      }) {
        emailSend({
          to: args.email,
          subject: "Welcome to WICF",
          text: emailTemplateWelcome({
            first_name: args.first_name,
            last_name: args.last_name,
            login_link: process.env.NEXTAUTH_URL + "/sign-in",
            feedback_link: process.env.NEXTAUTH_URL + "/forms/feedback",
          }),
        }).then((res) => {
          if (res) {
            console.log("Email sent successfully");
            console.log({ res });
            ctx.db.wicf_member
              .update({
                where: {
                  id: args.wicf_id,
                },
                data: {
                  registration_email_sent: new Date(),
                },
              })
              .catch((e) => {
                console.log("Welcome Email Failed to send");
                console.log(e);
              });
          } else {
            console.log("Welcome Email Failed to send");
            console.log({ res });
          }
        });
      }
      async function acknowledge_new_member(wicf_membership: wicf_member) {
        const acknowledged_user = await ctx.db.wicf_member.update({
          where: {
            id: wicf_membership.id,
          },
          data: {
            is_new_member_acknowledged: true,
          },
        });
        if (acknowledged_user) {
          return true;
        } else {
          new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to acknowledge new member",
          });
        }
      }
      if (!user && !wicf_member) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User not found",
        });
      }
      const wicf_membership = user?.wicf_member ?? wicf_member;
      if (!wicf_membership) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User does not have wicf membership",
        });
      }

      try {
        const { action } = input;
        // ACTIONS THAT DONT NEED USER ONLY WICF_MEMBERSSHIP
        if (!user) {
          switch (action) {
            case "acknowledge_new_member":
              acknowledge_new_member(wicf_membership);
              break;
            default:
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "No Action found",
              });
          }
          return;
        }
        // ACTIONS THAT REQUIRE USER
        switch (action) {
          case "send_welcome_email":
            send_welcome_email({
              email: wicf_membership.email ?? user.email,
              first_name: wicf_membership.first_name,
              last_name: wicf_membership.last_name,
              wicf_id: wicf_membership.id,
            });
            break;
          case "user_verify":
            const verified_user = await ctx.db.user.update({
              where: {
                id: user.id,
              },
              data: {
                is_verified: true,
              },
            });
            if (verified_user) {
              send_welcome_email({
                email: wicf_membership.email ?? user.email,
                first_name: wicf_membership.first_name,
                last_name: wicf_membership.last_name,
                wicf_id: wicf_membership.id,
              });
            }
            break;
          case "acknowledge_new_member":
            acknowledge_new_member(wicf_membership);
            break;
          case "ban":
            const banned_user = await ctx.db.user.update({
              where: {
                id: user.id,
              },
              data: {
                is_banned: true,
              },
              include: {
                wicf_member: true,
              },
            });
            if (banned_user && banned_user.email) {
              emailSend({
                to: banned_user?.wicf_member?.email ?? banned_user.email,
                subject: "WICF: Your account has been banned",
                text: emailTemplateBanned({
                  first_name: banned_user?.wicf_member?.first_name ?? "",
                  last_name: banned_user?.wicf_member?.last_name ?? "",
                  appeal_link:
                    process.env.NEXTAUTH_URL +
                    `/report?type=appeal&title=Account+Banned+Appeal&name=${banned_user.first_name}&email=${banned_user.email}&url=/`,
                }),
              });
            }
            break;
          case "unban":
            const unbanned_user = await ctx.db.user.update({
              where: {
                id: user.id,
              },
              data: {
                is_banned: false,
              },
              include: {
                wicf_member: true,
              },
            });
            if (unbanned_user && unbanned_user.email) {
              emailSend({
                to: unbanned_user?.wicf_member?.email ?? unbanned_user.email,
                subject: "WICF: Your account has been unbanned",
                text: emailTemplateUnbanned({
                  first_name: unbanned_user?.wicf_member?.first_name ?? "",
                  last_name: unbanned_user?.wicf_member?.last_name ?? "",
                  login_link: process.env.NEXTAUTH_URL + "/sign-in",
                  support_link:
                    process.env.NEXTAUTH_URL +
                    `/report?type=general&title=UnBanned+Support&name=${unbanned_user.first_name}&email=${unbanned_user.email}&url=/`,
                }),
              });
            }
            break;
          default:
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Unkown action",
            });
        }
      } catch (error) {
        const _error = handleRequestError({ error });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: _error.message ?? "Failed to get user data",
        });
      }
    }),
  is_account_exist: publicProcedure
    .input(
      z.object({
        phone_number: z.string(),
        email: z.string().email().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const phone_number_exists = await ctx.db.user.findUnique({
        where: {
          phone_number: input.phone_number,
        },
      });
      let email_exists: boolean | undefined = undefined;
      if (input.email) {
        const user = await ctx.db.user.findUnique({
          where: {
            email: input.email,
          },
        });
        if (user) email_exists = true;
      }
      return {
        phone_number_exists: !!phone_number_exists,
        email_exists: !!email_exists,
      };
    }),
  user_create: publicProcedure
    .input(
      z.object({
        first_name: z.string(),
        last_name: z.string(),
        email: z.string().email(),
        phone_number: z.string(),
        password: z.string(),
        gender: z.string().optional(),
        wechat_id: z.string().optional(),
        whatsapp_number: z.string().optional(),
        is_new_member: z.boolean().optional(),
        registration_last_step: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        first_name,
        last_name,
        email,
        phone_number,
        password,
        gender,
        wechat_id,
        whatsapp_number,
        is_new_member,
        registration_last_step,
      } = input;
      try {
        let user_input = input;
        delete user_input.gender;
        delete user_input.whatsapp_number;

        const result = await actionUserCreate({
          first_name,
          last_name,
          email,
          phone_number,
          password,
        });
        if (result.isError === false) {
          const user_id = result.data.id as string;
          if (!user_id) throw new Error("Failed to create wicf membership");
          const data = {
            // user_id,
            first_name,
            last_name,
            email,
            phone_number,
            gender: gender ?? undefined,
            wechat_id: wechat_id ?? undefined,
            whatsapp_number: whatsapp_number ?? undefined,
            is_new_member,
            registration_last_step,
            registration_start_time: new Date(),
            registration_last_update_time: new Date(),
          };
          await ctx.db.wicf_member
            .create({
              data: {
                user_id,
                ...data,
              },
            })
            .then((membership) => {
              notification_push({
                topic: "user_registration",
                title: "New User Registration",
                message: `${membership.first_name} ${membership.last_name} registered as a new user`,
              });
            })
            .catch(async (error) => {
              // IF FAILED TO CREATE WICF MEMBERSHIP BECAUSE ALREADY EXISTS
              if (String(error.message).includes("Unique constraint")) {
                console.log("WICF MEMBERSHIP EXISTS!!");
                const linked_account = await ctx.db.wicf_member.update({
                  where: {
                    phone_number: input.phone_number,
                  },
                  data: {
                    ...(data as any),
                    user: {
                      connect: {
                        id: user_id,
                      },
                    },
                  },
                });
              } else {
                throw new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: error.message,
                });
              }
            });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: result.message,
          });
        }
        console.log(result);
        return result;
      } catch (error) {
        console.error("Fetch error:", error);
        // throw new Error(`Failed to create user`);
        return error;
      }
    }),
  user_membership_create: protectedProcedure
    .input(
      z.object({
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        email: z.string().email().optional(),
        phone_number: z.string().optional(),
        gender: z.string().optional(),
        whatsapp_number: z.string().optional(),
        wechat_id: z.string().optional(),
        user_id_overide: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let data = input.user_id_overide
        ? {
            user_id: input.user_id_overide,
            first_name: input.first_name ?? "",
            last_name: input.last_name ?? "",
            phone_number: input.phone_number ?? "",
            gender: input.gender ?? undefined,
            whatsapp_number: input.whatsapp_number ?? undefined,
            wechat_id: input.whatsapp_number ?? undefined,
          }
        : {
            user_id: ctx.session.user.id,
            first_name: input.first_name ?? ctx.session.user.first_name ?? "",
            last_name: input.last_name ?? ctx.session.user.last_name ?? "",
            phone_number:
              input.phone_number ?? ctx.session.user.phone_number ?? "",
            gender: input.gender ?? undefined,
            whatsapp_number: input.whatsapp_number ?? undefined,
            wechat_id: input.whatsapp_number ?? undefined,
          };
      let member_exists: wicf_member | null = null;
      const phone_number = input.phone_number ?? ctx.session.user.phone_number;
      if (phone_number) {
        member_exists = await ctx.db.wicf_member.findUnique({
          where: {
            phone_number,
            user_id: undefined,
          },
        });
      }
      // IF WICF MEMBER EXISTS FROM OLD DATA
      try {
        if (member_exists) {
          // console.log("Eyooo works");
          console.log(`WICF Membership exists, linking instead`);
          const id = data.user_id;
          delete (data as any).user_id;
          const linked_account = await ctx.db.wicf_member.update({
            where: {
              id: member_exists.id,
            },
            data: {
              ...(data as any),
              user: {
                connect: {
                  id,
                },
              },
            },
          });
          if (linked_account) {
            return true;
          } else {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "WICF Membership exists, but failed to link to account",
            });
          }
          return;
        }
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "WICF Membership exists",
        });
      }

      // COMPLETELY NEW MEMBER
      try {
        const member = await ctx.db.wicf_member.create({
          data,
        });
        if (member) {
          console.log({
            name: "created new nembershio",
            member,
          });
          return true;
        } else {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to create membership",
          });
        }
      } catch (e) {
        console.error("Fetch error:", e);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: e.message ?? "Failed to create membership",
        });
      }
    }),
  user_get: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const id = ctx.session.user.id;
      const user = await ctx.db.user.findUnique({
        where: {
          id,
        },
        include: {
          wicf_member: true,
        },
      });
      delete (user as any).password;
      if (user) {
        // return handleRequestData({
        //   message: "User data found",
        //   data: user,
        // });
        return user;
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User not found",
        });
      }
    } catch (error) {
      console.error("Fetch error:", error.message);
      const _error = handleRequestError({ error });
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: _error.message ?? "Failed to get user data",
      });
    }
  }),
  user_wicf_membership_update: protectedProcedure
    .input(
      z
        .object({
          is_complete: z.boolean().optional(),
        })
        .passthrough(),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const is_complete = input.is_complete;
        const _input: wicf_member = JSON.parse(JSON.stringify(input)) as any;

        delete (_input as any).is_complete;

        const is_completed_just_updating = (_input as any)
          .registration_completion_time
          ? true
          : false;

        delete (_input as any).user_id;
        delete (_input as any).wicf_member_id;
        delete (_input as any).registration_start_time;
        delete (_input as any).registration_completion_time;
        // delete (_input as any).registration_last_step;

        // function containsTexts(texts: string, text: string) {
        //   return texts.includes((t) => t === text);
        // }

        String(_input.birthday).includes("undefined") &&
          delete (_input as any).birthday;
        String(_input.china_arrival_date).includes("undefined") &&
          delete (_input as any).china_arrival_date;
        String(_input.graduation_date).includes("undefined") &&
          delete (_input as any).graduation_date;
        String(_input.leaving_date).includes("undefined") &&
          delete (_input as any).leaving_date;

        _input.registration_last_update_time = new Date();

        // FIX ACCOUNTS WHERE START TIME IS NOT SET
        if (
          !_input.registration_start_time &&
          (_input.registration_last_update_time ||
            _input.registration_completion_time)
        ) {
          _input.registration_start_time = new Date();
        }

        const is_registration_completing =
          !input.registration_completion_time && is_complete === true;

        const is_registration_starting = !input.registration_start_time;

        if (is_registration_starting) {
          _input.registration_start_time = new Date();
        }

        if (is_registration_completing) {
          _input.registration_completion_time = new Date();
        }

        const user_id = ctx.session.user.id;
        console.log({
          // input,
          _input,
        });
        const membership = await ctx.db.wicf_member.update({
          where: {
            user_id,
          },
          data: {
            ..._input,
          },
        });

        // dump logs
        ctx.db.wicf_member_logs_dump
          .create({
            data: {
              wicf_member_id: membership.id,
              data: JSON.stringify(_input),
            },
          })
          .then((res) => {
            // console.log({ update: { ...res } });
          });

        if (is_registration_completing) {
          notification_push({
            topic: "user_registration",
            title: "User registration complete",
            message: `${membership.first_name} ${membership.last_name} has completed their registration`,
          });
          if (membership.email) {
          }
        }
        if (is_registration_starting) {
          notification_push({
            topic: "user_registration",
            title: "User registration started",
            message: `${membership.first_name} ${membership.last_name} has started their registration`,
          });
        }
        if (is_completed_just_updating) {
          notification_push({
            topic: "user_registration",
            title: "User information updated",
            message: `${membership.first_name} ${membership.last_name} has updated their information in stage:${membership.registration_last_step}`,
          });
        } else {
          notification_push({
            topic: "user_registration_progress",
            title: "User Registration Progress",
            message: `${membership.first_name} ${membership.last_name} has progressed to step:${membership.registration_last_step}`,
          });
        }

        return membership;
      } catch (error) {
        console.error("Fetch error:", error.message);
        const _error = handleRequestError({ error });
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: _error.message ?? "Failed to update",
        });
      }
    }),
  user_update_info: protectedProcedure
    .input(
      z.object({
        // id: z.string(),
        phone_number: z.string().optional(),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        email: z.string().email().optional(),
        gender: z.string().optional(),
        whatsapp_number: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // console.log({ input });
      let wicf_member: wicf_member | undefined = undefined;
      try {
        const user = await ctx.db.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            first_name: input.first_name ?? ctx.session.user.first_name ?? "",
            last_name: input.last_name ?? ctx.session.user.last_name ?? "",
            phone_number:
              input.phone_number ?? ctx.session.user.phone_number ?? "",
            email: input.email ?? ctx.session.user.email ?? "",
          },
          include: {
            wicf_member: true,
          },
        });
        if (user.wicf_member) {
          wicf_member = await ctx.db.wicf_member.update({
            where: {
              id: user.wicf_member.id,
            },
            data: {
              ...input,
            },
          });
        } else {
          wicf_member = await ctx.db.wicf_member.create({
            data: {
              user_id: ctx.session.user.id,
              first_name: input.first_name ?? ctx.session.user.first_name ?? "",
              last_name: input.last_name ?? ctx.session.user.last_name ?? "",
              phone_number: ctx.session.user.phone_number ?? "",
              gender: input.gender ?? undefined,
              whatsapp_number: input.whatsapp_number ?? undefined,
            },
          });
        }
        // console.log({ input, user, wicf_member });
        return handleRequestData({
          message: "User updated",
          data: {},
        });
      } catch (error) {
        console.error("Fetch error:", error.message);
        // throw new Error(`Failed to create user`);
        const _error = handleRequestError({ error });
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: _error.message ?? "Failed to update user",
        });
      }
    }),
  membership_get: protectedProcedure
    .input(
      z.object({
        page_number: z.number().optional().default(1),
        page_size: z.number().optional().default(10),
        start_date: z.number().optional(), // Add start date
        end_date: z.number().optional(), // Add end date
        notification_count: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { start_date, end_date } = input;

      // Query for notifications
      const notifications = await ctx.db.notifications.findMany({
        where: {
          topic: "user_registration",
          timestamp: {
            gte: start_date ? new Date(start_date) : undefined, // Filter for start_date if provided
            lte: end_date ? new Date(end_date) : undefined, // Filter for end_date if provided
          },
        },
        take: input.notification_count,
        ...(typeof input.notification_count !== "undefined" &&
          input.notification_count > 0 && { take: input.notification_count }),
        orderBy: {
          id: "desc",
        },
      });

      // Build the registration time filter
      const registrationTimeFilter: any = {};
      if (start_date) {
        registrationTimeFilter.gte = new Date(start_date); // Start date filter
      }
      if (end_date) {
        registrationTimeFilter.lte = new Date(end_date); // End date filter
      }

      // Query for members
      // Fetch all members
      // const members_all = await ctx.db.wicf_member.findMany({
      //   select: {
      //     id: true,
      //     first_name: true,
      //     last_name: true,
      //     phone_number: true,
      //     email: true,
      //     wechat_id: true,
      //     nationality: true,
      //     university: true,
      //     university_campus: true,
      //     is_new_member: true,
      //     is_new_member_acknowledged: true,
      //     registration_start_time: true,
      //     registration_last_update_time: true,
      //     registration_completion_time: true,
      //     registration_last_step: true,
      //     user: {
      //       select: {
      //         id: true,
      //         first_name: true,
      //         last_name: true,
      //         email: true,
      //         image: true,
      //         is_verified: true,
      //         is_banned: true,
      //         created_at: true,
      //       },
      //     },
      //   },
      //   orderBy: {
      //     id: "desc",
      //   },
      // });

      const members_all = await ctx.db.wicf_member.findMany({
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              image: true,
              is_verified: true,
              is_banned: true,
              created_at: true,
            },
          },
        },
        orderBy: {
          id: "desc",
        },
      });

      // Apply the where constraint on members_all
      const members = members_all.filter((member) => {
        const { registration_start_time } = member;
        // Check registration time constraints
        if (registration_start_time !== null) {
          if (start_date || end_date) {
            return registrationTimeFilter(member);
          }
          return true;
        }
        return false;
      });

      // Filter members where user_id is null
      const members_no_account = members_all.filter((member) => !member.user);

      const users_with_no_wicf_membership = await ctx.db.user.findMany({
        where: {
          wicf_member: null,
        },
        orderBy: { id: "desc" },
      });
      // Separate members into different categories
      const members_new =
        members.filter(
          (m) =>
            m.is_new_member === true &&
            m.is_new_member_acknowledged !== true &&
            m.user?.is_verified !== true,
        ) ?? [];
      const members_existing =
        members.filter(
          (m) => m.is_new_member !== true && m.registration_start_time,
        ) ?? [];
      const members_verified =
        members.filter((m) => m.user?.is_verified === true) ?? [];
      const members_completed_registration = members.filter(
        (m) => m.registration_completion_time,
      ).length;
      const members_banned = members.filter(
        (m) => m.user?.is_banned === true,
      ).length;

      // Return the results
      return {
        count: {
          members_new: members_new.length,
          members_verified: members_verified.length,
          members_unverified: members?.length - members_verified.length,
          members_total: members?.length,
          members_completed_registration,
          members_banned,
        },
        notifications,
        members,
        members_new,
        users_with_no_wicf_membership,
        members_no_account,
      };
    }),
  user_registration_action: protectedProcedure
    .input(
      z.object({
        user_id: z.string(),
        action: z.enum(["verify"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // check permission

        // update
        const { user_id, action } = input;
        switch (action) {
          case "verify":
            await ctx.db.wicf_member.update({
              where: {
                user_id,
              },
              data: {
                is_new_member_acknowledged: true,
              },
            });
            return handleRequestData({
              message: "User verfied",
              data: {},
            });
          default:
            throw new Error("Action not found");
        }
      } catch (e) {
        const _error = handleRequestError({ error: e });
        logger.error(_error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: _error.message ?? "Failed to perform user action",
        });
      }
    }),
});

import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { emailSend } from "@/lib/email";
import { env } from "@/env";
import { TRPCError } from "@trpc/server";

const system_redirect_link = env.NEXTAUTH_URL + "/dashboard/prayer/requests";

export const routerPrayer = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  academic_summit_question: protectedProcedure
    .input(z.object({ id: z.number() }))
    .input(z.object({ action: z.enum(["mark_as_read"]) }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;
      if (user.roles?.some((role) => role.name != "admin")) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You do not have permission",
        });
      }
      const question = await ctx.db.academic_summit_questions.findUnique({
        where: {
          id: input.id,
        },
      });
      if (!question) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Question not found",
        });
      }
      try {
        switch (input.action) {
          case "mark_as_read":
            await ctx.db.academic_summit_questions.update({
              where: {
                id: input.id,
              },
              data: {
                is_addressed: true,
              },
            });
            break;
          default:
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "No action given",
            });
        }
        return await ctx.db.academic_summit_questions.findMany();
      } catch (e) {
        console.error(e);
        throw new TRPCError(e?.message ?? "Failed to get questions");
      }
    }),
  academic_summit_question_getAll: publicProcedure.query(
    async ({ ctx, input }) => {
      try {
        return await ctx.db.academic_summit_questions.findMany();
      } catch (e) {
        console.error(e);
        throw new TRPCError(e?.message ?? "Failed to get questions");
      }
    },
  ),
  academic_summit_question_getOne: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db.academic_summit_questions.findUnique({
          where: {
            id: input.id,
          },
        });
      } catch (e) {
        console.error(e);
        throw new TRPCError(e?.message ?? "Failed to get question");
      }
    }),
  academic_summit_question_create: publicProcedure
    .input(z.object({ full_name: z.string().min(1) }))
    .input(z.object({ topic: z.string().min(1).optional() }))
    .input(z.object({ question: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await ctx.db.academic_summit_questions.create({
          data: {
            ...input,
          },
        });
        return true;
      } catch (e) {
        console.error(e);
        throw new TRPCError(e?.message ?? "");
      }
    }),
  create_bb: publicProcedure
    .input(z.object({ first_name: z.string().min(1) }))
    .input(z.object({ last_name: z.string().min(1) }))
    .input(z.object({ institution: z.string().min(1).optional() }))
    .input(z.object({ shirt_size: z.string().min(1).optional() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await ctx.db.bb_user.create({
          data: {
            ...input,
            bb_year: new Date().getFullYear(),
          },
        });
        return true;
      } catch (e) {
        console.error(e);
        throw new TRPCError(e?.message ?? "");
      }
    }),
  create: publicProcedure
    .input(z.object({ name: z.string().min(1).optional() }))
    .input(z.object({ contact: z.string().min(1).optional() }))
    .input(z.object({ request: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const result = await ctx.db.wicf_prayer_request.create({
        data: {
          name: input.name,
          contact_info: input.contact,
          request: input.request,
          userId: ctx?.session?.user.id,
        },
      });
      if (result) {
        //send email to users of role "prayer"
        const prayerMinistryUsers = await ctx.db.user.findMany({
          where: {
            roles: {
              some: {
                name: "prayer",
              },
            },
          },
          include: {
            wicf_member: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        });
        prayerMinistryUsers.forEach((user) => {
          emailSend({
            to: user.email,
            subject: "New Prayer Request",
            text: `A new prayer request has been submitted by [${input.name}] please check on the system Prayer Request ID: [${result.id}]`,
            html: `
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en" style="font-family:Montserrat, sans-serif"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta content="telephone=no" name="format-detection"><title>New email template 2024-03-14</title> <!--[if (mso 16)]><style type="text/css">     a {text-decoration: none;}     </style><![endif]--> <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--> <!--[if gte mso 9]><xml> <o:OfficeDocumentSettings> <o:AllowPNG></o:AllowPNG> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml>
<![endif]--> <!--[if !mso]><!-- --><link href="https://fonts.googleapis.com/css2?family=Krona+One&display=swap" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet"> <!--<![endif]--><style type="text/css">.rollover span { font-size:0;}.rollover:hover .rollover-first { max-height:0px!important; display:none!important;}.rollover:hover .rollover-second { max-height:none!important; display:block!important;}#outlook a { padding:0;}.es-button { mso-style-priority:100!important; text-decoration:none!important;} a[x-apple-data-detectors] { color:inherit!important; text-decoration:none!important; font-size:inherit!important; font-family:inherit!important; font-weight:inherit!important; line-height:inherit!important;}.es-desk-hidden { display:none; float:left; overflow:hidden; width:0; max-height:0; line-height:0; mso-hide:all;}
@media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:30px!important; text-align:center } h2 { font-size:26px!important; text-align:center } h3 { font-size:20px!important; text-align:center } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important } .es-menu td a { font-size:12px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:12px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important }
 .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:12px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:20px!important; display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important }
 .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0!important } .es-m-p0r { padding-right:0!important } .es-m-p0l { padding-left:0!important } .es-m-p0t { padding-top:0!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important }
 table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-m-p5 { padding:5px!important } .es-m-p5t { padding-top:5px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p5r { padding-right:5px!important } .es-m-p5l { padding-left:5px!important } .es-m-p10 { padding:10px!important } .es-m-p10t { padding-top:10px!important } .es-m-p10b { padding-bottom:10px!important } .es-m-p10r { padding-right:10px!important } .es-m-p10l { padding-left:10px!important } .es-m-p15 { padding:15px!important } .es-m-p15t { padding-top:15px!important } .es-m-p15b { padding-bottom:15px!important } .es-m-p15r { padding-right:15px!important } .es-m-p15l { padding-left:15px!important } .es-m-p20 { padding:20px!important } .es-m-p20t { padding-top:20px!important } .es-m-p20r { padding-right:20px!important }
 .es-m-p20l { padding-left:20px!important } .es-m-p25 { padding:25px!important } .es-m-p25t { padding-top:25px!important } .es-m-p25b { padding-bottom:25px!important } .es-m-p25r { padding-right:25px!important } .es-m-p25l { padding-left:25px!important } .es-m-p30 { padding:30px!important } .es-m-p30t { padding-top:30px!important } .es-m-p30b { padding-bottom:30px!important } .es-m-p30r { padding-right:30px!important } .es-m-p30l { padding-left:30px!important } .es-m-p35 { padding:35px!important } .es-m-p35t { padding-top:35px!important } .es-m-p35b { padding-bottom:35px!important } .es-m-p35r { padding-right:35px!important } .es-m-p35l { padding-left:35px!important } .es-m-p40 { padding:40px!important } .es-m-p40t { padding-top:40px!important } .es-m-p40b { padding-bottom:40px!important } .es-m-p40r { padding-right:40px!important } .es-m-p40l { padding-left:40px!important }
 .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } }@media screen and (max-width:384px) {.mail-message-content { width:414px!important } }</style>
 </head> <body style="width:100%;font-family:Montserrat, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"><div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#0D2225"> <!--[if gte mso 9]><v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#0d2225"></v:fill> </v:background><![endif]--><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#0D2225"><tr>
<td valign="top" style="padding:0;Margin:0"><table cellpadding="0" cellspacing="0" class="es-header" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top"><tr><td align="center" style="padding:0;Margin:0"><table bgcolor="#0f1011" class="es-header-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#0f1011;width:600px" role="none"><tr><td align="left" style="padding:0;Margin:0;padding-left:20px;padding-right:20px;padding-top:30px"><table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr>
<td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:560px"><table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="center" style="padding:0;Margin:0;font-size:0px"><a target="_blank" href="https://wicf.maravian.com" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#FFFFFF;font-size:14px"><img src="https://maravianwebservices.com/images/wicf/assets/wicf%20logo.png" alt="Logo" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" height="60" title="Logo"></a> </td></tr></table></td></tr></table></td></tr></table></td></tr></table>
 <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"><tr><td align="center" style="padding:0;Margin:0"><table bgcolor="#0f1011" class="es-content-body" align="center" cellpadding="0" cellspacing="0" background="https://efybzsi.stripocdn.email/content/guids/CABINET_34ad95b423c6803288e09f9a846d2be17a85b2adbe6709a3e7ea35f3ca16bd7d/images/group_sRl.png" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#0F1011;background-repeat:no-repeat;width:600px;background-image:url(https://efybzsi.stripocdn.email/content/guids/CABINET_34ad95b423c6803288e09f9a846d2be17a85b2adbe6709a3e7ea35f3ca16bd7d/images/group_sRl.png);background-position:400px 40px" role="none"><tr>
<td align="left" style="Margin:0;padding-bottom:20px;padding-left:20px;padding-right:20px;padding-top:40px"><table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="center" valign="top" style="padding:0;Margin:0;width:560px"><table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="left" class="es-m-txt-l" style="padding:0;Margin:0;padding-top:20px;padding-bottom:20px"><h1 style="Margin:0;line-height:60px;mso-line-height-rule:exactly;font-family:'Krona One', sans-serif;font-size:40px;font-style:normal;font-weight:bold;color:#FFFFFF"><font>New prayer <span style="color:#35ccd0">request</span></font></h1> </td></tr><tr>
<td align="left" class="es-m-txt-l" style="padding:0;Margin:0;padding-bottom:20px"><h3 style="Margin:0;line-height:30px;mso-line-height-rule:exactly;font-family:'Krona One', sans-serif;font-size:20px;font-style:normal;font-weight:normal;color:#FFFFFF">Hi ${
              user.wicf_member?.first_name ?? user.first_name ?? ""
            },</h3></td></tr><tr><td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:21px;color:#FFFFFF;font-size:14px">A new prayer request has been submited&nbsp;</p></td></tr></table></td></tr></table></td></tr> <tr><td align="left" style="padding:20px;Margin:0"><table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr>
<td align="center" valign="top" style="padding:0;Margin:0;width:560px"><table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-left:1px solid #35ccd0;border-right:1px solid #35ccd0;border-top:1px solid #35ccd0;border-bottom:1px solid #35ccd0;border-radius:15px" role="presentation"><tr><td align="left" class="es-m-txt-l" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px"><h3 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:'Krona One', sans-serif;font-size:20px;font-style:normal;font-weight:normal;color:#FFFFFF">The details</h3></td></tr> <tr>
<td align="left" style="padding:20px;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:24px;color:#FFFFFF;font-size:14px"><span style="font-size:16px;line-height:24px"><strong>Request Id:</strong></span><br>${
              `Please login and check on the system.<br>Click <a href='${system_redirect_link}'>here</a> to go the prayer dashboard` // result.request
            }</p></td></tr><tr><td align="center" style="padding:0;Margin:0;font-size:0"><table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td style="padding:0;Margin:0;border-bottom:1px solid #35ccd0;background:unset;height:1px;width:100%;margin:0px"></td></tr></table></td></tr> <tr>
<td align="left" style="padding:20px;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:24px;color:#FFFFFF;font-size:16px"><strong>From:</strong></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:21px;color:#FFFFFF;font-size:14px">${
              result.name
            }</p></td></tr><tr><td align="center" style="padding:0;Margin:0;font-size:0"><table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td style="padding:0;Margin:0;border-bottom:1px solid #35ccd0;background:unset;height:1px;width:100%;margin:0px"></td></tr></table></td></tr> <tr>
<td align="left" style="padding:20px;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:24px;color:#FFFFFF;font-size:14px"><strong><span style="font-size:16px;line-height:24px">Contact:</span></strong><br>${
              result.contact_info
            }</p></td></tr></table></td></tr></table></td></tr></table></td></tr></table></td></tr></table></div></body></html>
            `,
          });
        });
      }
      return result;
    }),
  assignUser: protectedProcedure
    .input(z.object({ id: z.number().min(1).optional() }))
    .input(z.object({ user_id: z.string().min(1).optional() }))
    .mutation(async ({ ctx, input }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const result = await ctx.db.wicf_prayer_request.update({
        where: {
          id: input.id,
        },
        data: {
          userId_assigned_to: input.user_id,
        },
        include: {
          user_assigned_to: {
            select: {
              id: true,
              email: true,
              first_name: true,
              wicf_member: {
                select: {
                  first_name: true,
                  last_name: true,
                },
              },
            },
          },
        },
      });
      const user = result.user_assigned_to;
      // const user = await ctx.db.user.findUnique({
      //   where: {
      //     id: input.user_id,
      //   },
      //   include: {
      //     wicf_member: {
      //       select: {
      //         first_name: true,
      //         last_name: true,
      //       },
      //     },
      //   },
      // });
      if (user) {
        emailSend({
          to: user.email,
          subject: "Prayer Request Assignment",
          text: `You have been assigned to this prayer request has been submitted by [${result.name}] with the following request: [${result.request}]`,
          html: `
          <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en" style="font-family:Montserrat, sans-serif"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta content="telephone=no" name="format-detection"><title>New email template 2024-03-14</title> <!--[if (mso 16)]><style type="text/css">     a {text-decoration: none;}     </style><![endif]--> <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--> <!--[if gte mso 9]><xml> <o:OfficeDocumentSettings> <o:AllowPNG></o:AllowPNG> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml>
<![endif]--> <!--[if !mso]><!-- --><link href="https://fonts.googleapis.com/css2?family=Krona+One&display=swap" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet"> <!--<![endif]--><style type="text/css">.rollover span { font-size:0;}.rollover:hover .rollover-first { max-height:0px!important; display:none!important;}.rollover:hover .rollover-second { max-height:none!important; display:block!important;}#outlook a { padding:0;}.es-button { mso-style-priority:100!important; text-decoration:none!important;} a[x-apple-data-detectors] { color:inherit!important; text-decoration:none!important; font-size:inherit!important; font-family:inherit!important; font-weight:inherit!important; line-height:inherit!important;}.es-desk-hidden { display:none; float:left; overflow:hidden; width:0; max-height:0; line-height:0; mso-hide:all;}
@media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:30px!important; text-align:center } h2 { font-size:26px!important; text-align:center } h3 { font-size:20px!important; text-align:center } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important } .es-menu td a { font-size:12px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:12px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important }
.es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:12px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:20px!important; display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important }
.es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0!important } .es-m-p0r { padding-right:0!important } .es-m-p0l { padding-left:0!important } .es-m-p0t { padding-top:0!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important }
table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-m-p5 { padding:5px!important } .es-m-p5t { padding-top:5px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p5r { padding-right:5px!important } .es-m-p5l { padding-left:5px!important } .es-m-p10 { padding:10px!important } .es-m-p10t { padding-top:10px!important } .es-m-p10b { padding-bottom:10px!important } .es-m-p10r { padding-right:10px!important } .es-m-p10l { padding-left:10px!important } .es-m-p15 { padding:15px!important } .es-m-p15t { padding-top:15px!important } .es-m-p15b { padding-bottom:15px!important } .es-m-p15r { padding-right:15px!important } .es-m-p15l { padding-left:15px!important } .es-m-p20 { padding:20px!important } .es-m-p20t { padding-top:20px!important } .es-m-p20r { padding-right:20px!important }
.es-m-p20l { padding-left:20px!important } .es-m-p25 { padding:25px!important } .es-m-p25t { padding-top:25px!important } .es-m-p25b { padding-bottom:25px!important } .es-m-p25r { padding-right:25px!important } .es-m-p25l { padding-left:25px!important } .es-m-p30 { padding:30px!important } .es-m-p30t { padding-top:30px!important } .es-m-p30b { padding-bottom:30px!important } .es-m-p30r { padding-right:30px!important } .es-m-p30l { padding-left:30px!important } .es-m-p35 { padding:35px!important } .es-m-p35t { padding-top:35px!important } .es-m-p35b { padding-bottom:35px!important } .es-m-p35r { padding-right:35px!important } .es-m-p35l { padding-left:35px!important } .es-m-p40 { padding:40px!important } .es-m-p40t { padding-top:40px!important } .es-m-p40b { padding-bottom:40px!important } .es-m-p40r { padding-right:40px!important } .es-m-p40l { padding-left:40px!important }
.es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } }@media screen and (max-width:384px) {.mail-message-content { width:414px!important } }</style>
</head> <body style="width:100%;font-family:Montserrat, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"><div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#0D2225"> <!--[if gte mso 9]><v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#0d2225"></v:fill> </v:background><![endif]--><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#0D2225"><tr>
<td valign="top" style="padding:0;Margin:0"><table cellpadding="0" cellspacing="0" class="es-header" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top"><tr><td align="center" style="padding:0;Margin:0"><table bgcolor="#0f1011" class="es-header-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#0f1011;width:600px" role="none"><tr><td align="left" style="padding:0;Margin:0;padding-left:20px;padding-right:20px;padding-top:30px"><table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr>
<td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:560px"><table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="center" style="padding:0;Margin:0;font-size:0px"><a target="_blank" href="https://wicf.maravian.com" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#FFFFFF;font-size:14px"><img src="https://maravianwebservices.com/images/wicf/assets/wicf%20logo.png" alt="Logo" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" height="60" title="Logo"></a> </td></tr></table></td></tr></table></td></tr></table></td></tr></table>
<table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"><tr><td align="center" style="padding:0;Margin:0"><table bgcolor="#0f1011" class="es-content-body" align="center" cellpadding="0" cellspacing="0" background="https://efybzsi.stripocdn.email/content/guids/CABINET_34ad95b423c6803288e09f9a846d2be17a85b2adbe6709a3e7ea35f3ca16bd7d/images/group_sRl.png" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#0F1011;background-repeat:no-repeat;width:600px;background-image:url(https://efybzsi.stripocdn.email/content/guids/CABINET_34ad95b423c6803288e09f9a846d2be17a85b2adbe6709a3e7ea35f3ca16bd7d/images/group_sRl.png);background-position:400px 40px" role="none"><tr>
<td align="left" style="Margin:0;padding-bottom:20px;padding-left:20px;padding-right:20px;padding-top:40px"><table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="center" valign="top" style="padding:0;Margin:0;width:560px"><table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td align="left" class="es-m-txt-l" style="padding:0;Margin:0;padding-top:20px;padding-bottom:20px"><h1 style="Margin:0;line-height:60px;mso-line-height-rule:exactly;font-family:'Krona One', sans-serif;font-size:40px;font-style:normal;font-weight:bold;color:#FFFFFF"><font>Prayer request <span style="color:#35ccd0">assignment</span></font></h1> </td></tr><tr>
<td align="left" class="es-m-txt-l" style="padding:0;Margin:0;padding-bottom:20px"><h3 style="Margin:0;line-height:30px;mso-line-height-rule:exactly;font-family:'Krona One', sans-serif;font-size:20px;font-style:normal;font-weight:normal;color:#FFFFFF">Hi ${
            user.wicf_member?.first_name ?? user.first_name ?? ""
          },</h3></td></tr><tr><td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:21px;color:#FFFFFF;font-size:14px">A new prayer request has been assigned to you&nbsp;</p></td></tr></table></td></tr></table></td></tr> <tr><td align="left" style="padding:20px;Margin:0"><table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr>
<td align="center" valign="top" style="padding:0;Margin:0;width:560px"><table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-left:1px solid #35ccd0;border-right:1px solid #35ccd0;border-top:1px solid #35ccd0;border-bottom:1px solid #35ccd0;border-radius:15px" role="presentation"><tr><td align="left" class="es-m-txt-l" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px"><h3 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:'Krona One', sans-serif;font-size:20px;font-style:normal;font-weight:normal;color:#FFFFFF">The details</h3></td></tr> <tr>
<td align="left" style="padding:20px;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:24px;color:#FFFFFF;font-size:14px"><span style="font-size:16px;line-height:24px"><strong>Request ID:${result.id} </strong></span><br>Please login on the system</a> and check the prayer point assigned to you.<br>Click <a href='${system_redirect_link}'>here</a> to go the prayer dashboard</p></td></tr><tr><td align="center" style="padding:0;Margin:0;font-size:0"><table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td style="padding:0;Margin:0;border-bottom:1px solid #35ccd0;background:unset;height:1px;width:100%;margin:0px"></td></tr></table></td></tr> <tr>
<td align="left" style="padding:20px;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:24px;color:#FFFFFF;font-size:16px"><strong>From:</strong></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:21px;color:#FFFFFF;font-size:14px">${
            result.name
          }</p></td></tr><tr><td align="center" style="padding:0;Margin:0;font-size:0"><table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr><td style="padding:0;Margin:0;border-bottom:1px solid #35ccd0;background:unset;height:1px;width:100%;margin:0px"></td></tr></table></td></tr> <tr>
<td align="left" style="padding:20px;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Montserrat, sans-serif;line-height:24px;color:#FFFFFF;font-size:14px"><strong><span style="font-size:16px;line-height:24px">Contact:</span></strong><br>${
            result.contact_info
          }</p></td></tr></table></td></tr></table></td></tr></table></td></tr></table></td></tr></table></div></body></html>
          `,
        });
      }
      return result;
    }),
  mark_addressed: protectedProcedure
    .input(z.object({ id: z.number().min(1) }))
    .input(z.object({ markUnDone: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return ctx.db.wicf_prayer_request.update({
        where: {
          id: input.id,
        },
        data: {
          is_addressed: input.markUnDone ? null : new Date(),
        },
      });
    }),
  getAll: protectedProcedure
    .input(z.object({ isAscending: z.boolean().optional() }))
    .input(z.object({ showAddressed: z.boolean().optional() }))
    .input(z.object({ search: z.string().optional() }))
    .query(({ ctx, input }) => {
      return ctx.db.wicf_prayer_request.findMany({
        where: {
          name: { contains: input.search },
          contact_info: { contains: input.search },
          request: { contains: input.search },
          is_addressed: input.showAddressed ? undefined : { equals: null },
        },
        orderBy: { completion_time: input.isAscending ? "asc" : "desc" },
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              wicf_member: {
                select: {
                  first_name: true,
                  last_name: true,
                },
              },
            },
          },
          user_assigned_to: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              wicf_member: {
                select: {
                  first_name: true,
                  last_name: true,
                },
              },
            },
          },
        },
      });
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});

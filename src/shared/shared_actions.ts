/* eslint-disable no-unused-expressions */
import prisma from "@/lib/prisma";
import { $Res, $WicfUser, type$Res } from "@/shared/shared_classes";
import { GetErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth/next";
import { NextApiRequest, NextApiResponse } from "next";
// import { TypeLiveData } from "./shared_types";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Session } from "next-auth/core/types";
// import { getSession } from "next-auth/react";
import {
  TypeAlbumRawFolders,
  TypeErrorCode,
  TypeImageObject,
  TypePhotosAlbum,
  TypeRole,
  TypeRoute,
  TypeSession,
} from "@/shared/shared_types";
import { utilParseProperty, utilRemoveSpacesAndLowercase } from "@/utils";
import { photos_album } from "@prisma/client";
import fetch from "node-fetch";
import sha256 from "crypto-js/sha256";
import { emailSend } from "@/lib/email";
import { env } from "process";
import {
  emailTemplateFeedbackSubmitted,
  emailTemplatePasswordChanged,
} from "@/lib/email/emailTemplates";
import { user, wicf_member } from "@prisma/client";

export type TypeActionName =
  | "live_get"
  | "live_create"
  | "live_delete"
  | "stream_create"
  | "streams_get"
  | "stream_update"
  | "stream_delete"
  | "location_get"
  | "location_create"
  | "users_get"
  | "routes_get"
  | "route_create"
  | "roles_get"
  | "role_user_add"
  | "role_create"
  | "role_add_route"
  | "role_delete_route"
  | "role_delete_user"
  | "bb23_users_get"
  | "bb23_teams_get"
  | "bb23_questions_get"
  | "bb23_user_set_sortable"
  | "bb23_teams_set_members"
  | "photos_album_get"
  | "photos_albums_get"
  | "photos_source_update"
  | "photos_album_view_add"
  | "photos_album_hide"
  | "photos_album_public"
  | "photos_album_edit"
  | "photos_info"
  | "photos_info_update"
  | "photos_album_hidden_images_set"
  | "photos_album_set_thumbnail"
  | "form";
export interface ArgsAction {
  req: NextApiRequest;
  res: NextApiResponse;
  body: any;
  action: TypeActionName;
  isDelete?: boolean;
}
export function handleRequestError({
  message,
  code,
  error,
}: {
  message?: string;
  code?: TypeErrorCode;
  error?: any;
}) {
  logger.error({ message, code, error });
  return new $Res({
    isError: true,
    message:
      message ?? GetErrorMessage(error?.code ?? code ?? null, null, error),
    data: null,
    code: error?.code ?? code ?? null,
  });
}
export function handleRequestData({
  message,
  code,
  data,
}: {
  message: string;
  data: {};
  code?: string | number;
}) {
  return new $Res({
    isError: false,
    message: message,
    data: data,
    code: code,
  });
}
export async function checkAuthentication(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session: Session | null = await getServerSession(req, res, authOptions);
  if (!session) {
    return null;
  } else {
    return session as unknown as TypeSession;
  }
}
export const actionGetSession = checkAuthentication;

export async function actionRequireLogin({
  res,
  req,
}: ArgsAction): Promise<TypeSession | undefined> {
  let session: TypeSession | undefined = undefined;
  if (res && req) {
    session = (await actionGetSession(req, res)) as unknown as TypeSession;
    // console.log("actionRequireLogin", session);
    if (!session?.user?.id) {
      res.status(400).json(
        handleRequestError({
          code: "login_require",
        }),
      );
    } else return session;
  } else {
    return undefined;
  }
}

export const hashPassword = (password: string) => {
  return sha256(password).toString();
};
export async function actionUserCreate(body): Promise<type$Res> {
  try {
    if (
      !body.first_name ||
      !body.last_name ||
      !body.phone_number ||
      !body.email ||
      !body.phone_number
    ) {
      return new $Res({
        isError: true,
        message: GetErrorMessage("invalid_params", null, null),
        data: null,
        code: "invalid_params",
      });
    }
    body.password = hashPassword(body.password);
    if (!body.image) {
      body.image =
        "https://maravianwebservices.com/images/wicf/assets/logo.png";
    }
    // CHECK IF BASIC ROLE USER EXISTS
    let roleBasicId: number | undefined = undefined;
    const roleBasic = await prisma.role.findUnique({
      where: {
        name: "basic",
      },
    });
    if (roleBasic) {
      roleBasicId = roleBasic.id;
    } else {
      logger.log("Creating basic role");
      const roleBasicNew = await prisma.role.create({
        data: {
          name: "basic",
          label: "Basic",
        },
      });
      if (roleBasicNew) {
        roleBasicId = roleBasicNew.id;
      } else {
        return new $Res({
          isError: true,
          message: GetErrorMessage("role_no_basic", null, null),
          data: null,
          code: "role_no_basic",
        });
      }
      // creating basic /dashboard/account route if none
      const routeBasicUrl = "/dashboard/account";
      let routeBasicId: number | undefined = undefined; // id of registered router or url /dashboard/account
      const routeBasic = await prisma.route.findUnique({
        where: {
          url: routeBasicUrl,
        },
      });
      if (routeBasic) {
        routeBasicId = routeBasic.id;
      } else {
        logger.log(`Creating Basic route: ${routeBasicUrl}`);
        const routeBasicNew = await prisma.route.create({
          data: {
            url: routeBasicUrl,
          },
        });
        if (routeBasicNew) routeBasicId = routeBasicNew.id;
      }
      // console.log({ roleBasicId, routeBasicId });
      if (routeBasicId !== undefined)
        await prisma.role.update({
          where: {
            id: roleBasicId,
          },
          data: {
            routes: {
              connect: {
                id: routeBasicId,
              },
            },
          },
        });
    }
    // CREATE USER
    logger.debug("creating user", {
      ...body,
    });
    const user = await prisma.user.create({
      data: {
        ...body,
        roles: {
          connect: {
            id: roleBasicId,
          },
        },
      },
    });
    delete (user as any).password;
    return new $Res({
      isError: false,
      message: "Successfully added you as a new member, Welcome!",
      data: user,
      code: null,
    });
  } catch (error) {
    logger.error(error);
    return new $Res({
      isError: true,
      message: GetErrorMessage(error.code, null, error),
      data: null,
      code: error.code,
    });
  }
}
interface argsUserGet {
  id?: string;
  phone_number?: string;
  email?: string;
}
export interface sessionUserType {
  id: string;
  wicf_member_id: number | null;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  emailVerified: Date | null;
  phone_number: string | null;
  phone_number_verified: Date | null;
  image: string | null;
}
export async function actionUserGet({
  id,
  phone_number,
  email,
}: argsUserGet): Promise<type$Res> {
  // VALIDATE
  if (!id && !phone_number && !email) {
    return new $Res({
      isError: true,
      message: "Please provide the id or phone_number",
      data: null,
      code: null,
    });
  }
  // PROCESS
  const where: any = {};
  if (id) where.id = String(id);
  if (phone_number) where.phone_number = phone_number;
  if (email) where.email = email;
  try {
    const user = await prisma.user.findUnique({
      where,
      include: {
        wicf_member: true,
        roles: {
          include: {
            routes: true,
            photos_info: true,
          },
        },
      },
    });
    if (!user) {
      return handleRequestError({
        message: "Could not find your user",
      });
    } else {
      if (user) delete (user as any).password;
      return handleRequestData({
        message: "Successfully got your user data",
        data: user,
      });
    }
  } catch (error) {
    // HANDLE ERROR
    console.log("--------error");
    console.log(error);
    return handleRequestError({
      error,
    });
  }
}
export async function actionUserUpdate({
  body,
}: {
  body: any;
  action?: string;
}): Promise<type$Res> {
  const { id } = body;
  // VALIDATE
  if (!id) {
    return new $Res({
      isError: true,
      message: "Please provide the id",
      data: null,
      code: null,
    });
  }
  // PROCESS
  const where: any = {};
  if (id) where.id = String(id);
  // console.log("where", where);
  const data = {
    name: body.name,
    email: body.email,
    phone_number: body.phone_number,
    image: body.image,
  };
  try {
    let user: (user & { wicf_member: wicf_member | null }) | undefined;
    switch (body.action) {
      case "user_change":
        user = await prisma.user.update({
          where,
          data,
          include: {
            wicf_member: true,
          },
        });
        break;
      case "password_change":
        if (!body.passwordNew || !body.passwordConfirm) {
          return handleRequestError({
            message: "Please provide required params",
          });
        }
        if (body.passwordNew !== body.passwordConfirm) {
          return handleRequestError({ message: "Password mismatch" });
        }
        user = await prisma.user.update({
          where,
          data: {
            password: hashPassword(body.passwordNew),
            password_change_at: new Date(),
          },
          include: {
            wicf_member: true,
          },
        });
        logger.log(`User(${user.email}) Changed password`);
        if (user) {
          const first_name = user?.wicf_member?.first_name;
          const email = user?.wicf_member?.email ?? user?.email;
          const time_changed = user?.password_change_at?.toUTCString();
          if (!email || !first_name) break;
          logger.log(`User(${user.email}) Changed password - Email sent`);
          await emailSend({
            to: email,
            subject: "Password Changed",
            text: emailTemplatePasswordChanged({
              first_name,
              time_changed,
            }),
          });
        }
        break;
      default:
        return handleRequestError({
          message: "Please provide action",
        });
    }
    if (!user) {
      return handleRequestError({
        message: "Could not find your user",
      });
    } else {
      delete (user as any)?.password;
      return handleRequestData({
        message: `Successfully updated your user data ${
          body.email ? "Email changed please login in again" : ""
        }`,
        data: user,
      });
    }
  } catch (error) {
    // HANDLE ERROR
    return handleRequestError({
      error,
    });
  }
}
interface argsWicfUserGet {
  id: number;
  phone_number?: string;
}
async function actionWicfUserGet({ id, phone_number }: argsWicfUserGet) {
  try {
    const user = await prisma.wicf_member.findUnique({
      where: {
        id: id,
        phone_number: phone_number,
      },
    });
    if (user) {
      // return new $WicfUser({ user });
      return user;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
}
export async function actionWicfUserCreate(body): Promise<type$Res> {
  try {
    // CREATE USER
    const member = await prisma.wicf_member.create({
      data: {
        ...body,
        is_new_member: true,
        registration_last_step: "registration_old",
        registration_start_time: body.completion_time ?? new Date(),
        registration_last_update_time: new Date(),
        registration_completion_time: new Date(),
      },
    });
    try {
      //LOG USER CREATION
      await prisma.wicf_member_logs.create({
        data: {
          ...member,
        },
      });
    } catch {}
    return new $Res({
      isError: false,
      message: "Successfully added you as a new member, Welcome!",
      data: member,
      code: null,
    });
  } catch (error) {
    logger.error(error);
    return new $Res({
      isError: true,
      message: GetErrorMessage(error.code, null, error),
      data: null,
      code: error.code,
    });
  }
}
export async function actionFormSummerfest(body): Promise<type$Res> {
  try {
    const member = await prisma.wicf_form_summerfest.create({
      data: {
        ...body,
      },
    });
    return new $Res({
      isError: false,
      message: "Successfully registered you for Summerfest!",
      data: member,
      code: null,
    });
  } catch (error) {
    logger.error(error);
    return new $Res({
      isError: true,
      message: GetErrorMessage(error.code, null, error),
      data: null,
      code: error.code,
    });
  }
}
export async function actionFormAcademicSummit(body): Promise<type$Res> {
  console.log("academic", body);
  try {
    const member = await prisma.wicf_form_academic_summit.create({
      data: {
        ...body,
      },
    });
    return new $Res({
      isError: false,
      message: "Successfully registered you for the academic summit!",
      data: member,
      code: null,
    });
  } catch (error) {
    logger.error(error);
    return new $Res({
      isError: true,
      message: GetErrorMessage(error.code, null, error),
      data: null,
      code: error.code,
    });
  }
}

export async function actionFormFeedback({
  body,
  res,
  req,
}: ArgsAction): Promise<type$Res> {
  const session = await actionGetSession(req, res);
  if (session) body.userId = session.user.id;
  try {
    const feedback = await prisma.wicf_form_feedback.create({
      data: {
        ...body,
        is_addressed: false,
      },
    });
    if (feedback) {
      const leaders = await prisma.role.findUnique({
        where: {
          name: "leaders",
        },
        include: {
          users: {
            select: {
              first_name: true,
              email: true,
              wicf_member: {
                select: {
                  email: true,
                  first_name: true,
                },
              },
            },
          },
        },
      });
      if (leaders) {
        leaders.users.map(async (leader) => {
          const email = leader?.wicf_member?.email ?? leader.email;
          console.log(`Sending feedback Email to leader: ${email}`);
          await emailSend({
            to: email,
            subject: `WICF: New Feedback #${feedback.id} From: ${feedback.name ?? ""}`,
            text: emailTemplateFeedbackSubmitted({
              adminName:
                leader?.wicf_member?.first_name ?? leader.first_name ?? "ADMIN",
              feedbackId: feedback.id,
              feedbackName: feedback.name,
              feedbackMessage: feedback.message,
              feedbackContact: feedback.contact,
              feedbackUserId: feedback.userId,
            }),
          });
        });
      } else if (env.ADMIN_EMAIL) {
        emailSend({
          to: env.ADMIN_EMAIL,
          subject: `WICF: New Feedback #${feedback.id} From: ${feedback.name}`,
          text: emailTemplateFeedbackSubmitted({
            adminName: "ADMIN",
            feedbackId: feedback.id,
            feedbackName: feedback.name,
            feedbackMessage: feedback.message,
            feedbackContact: feedback.contact,
            feedbackUserId: feedback.userId,
          }),
        });
      }
    }
    return new $Res({
      isError: false,
      message: "Successfully submitted your feedback!",
      data: feedback,
      code: null,
    });
  } catch (error) {
    logger.error(error);
    return new $Res({
      isError: true,
      message: GetErrorMessage(error.code, null, error),
      data: null,
      code: error.code,
    });
  }
}

export async function actionFormPrayerRequest({
  body,
  res,
  req,
}: ArgsAction): Promise<type$Res> {
  const session = await actionGetSession(req, res);
  if (session) body.userId = session.user.id;
  try {
    const member = await prisma.wicf_prayer_request.create({
      data: {
        ...body,
        is_addressed: false,
      },
    });
    return new $Res({
      isError: false,
      message: "Successfully submitted your prayer request!",
      data: member,
      code: null,
    });
  } catch (error) {
    logger.error(error);
    return new $Res({
      isError: true,
      message: GetErrorMessage(error.code, null, error),
      data: null,
      code: error.code,
    });
  }
}
export async function actionFormWorkersTraining(body): Promise<type$Res> {
  try {
    const member = await prisma.wicf_form_workers_training.create({
      data: {
        ...body,
      },
    });
    return new $Res({
      isError: false,
      message: "Successfully registered you for Workers Training!",
      data: member,
      code: null,
    });
  } catch (error) {
    logger.error(error);
    return new $Res({
      isError: true,
      message: GetErrorMessage(error.code, null, error),
      data: null,
      code: error.code,
    });
  }
}
interface argsActionMinistryJoin {
  body: any;
  ministry: string;
}
export async function actionMinistryJoin({
  ministry,
  body,
}: argsActionMinistryJoin): Promise<$Res> {
  try {
    // logger.debug("member joining worship ministry", {
    //   body,
    // });
    const wicf_member_id = body.wicf_member_id;
    const user = await actionWicfUserGet({ id: wicf_member_id });
    // console.log(" actionMinistryJoin_user", user);
    if (user) {
      switch (ministry) {
        case "worship":
          // CHECK IF MEMBER ALREADY IN MINISTRY
          const isMinistryMember = await actionIsMininstryMember({
            ministry,
            wicf_member_id,
          });
          if (isMinistryMember !== null) {
            if (isMinistryMember === true) {
              // IF ALREADY A MEMBER
              return new $Res({
                isError: true,
                message: `You are already in ${ministry} ministry`,
              });
            }
          } else {
            // IF ERROR
            return new $Res({
              isError: true,
              message: `Internal Error when joining ministry, Contact Admin`,
            });
          }
          // IF NOT ALREADY A MEMBER
          // JOIN THE MINISTRY
          const worship = await prisma.wicf_member_worship.create({
            data: { wicf_member_id },
          });

          if (worship) {
            // IF SUCCESSFULLY REGISTERED
            logger.debug(
              `Added user:${wicf_member_id} to ${ministry} ministry`,
            );
            return new $Res({
              isError: false,
              message: "You successfully joined the worship ministry",
              data: new $WicfUser({ user, worship }),
            });
          } else {
            return new $Res({
              isError: true,
              message: "Joining Ministry failed",
            });
          }
        default:
          return new $Res({
            isError: true,
            message:
              "The ministry you are trying to join is not valid or open for joining",
          });
      }
    } else {
      return new $Res({
        isError: true,
        message: `User:${wicf_member_id} does is not registered, please register first to join a ministry`,
      });
    }
  } catch (error) {
    return new $Res({
      isError: true,
      message: GetErrorMessage(error.code, null, error),
      data: null,
      code: error.code,
    });
  }
}
interface typeActionMinistryUpdate {
  ministry: string;
  body: any;
}
export async function actionMinistryUpdate({
  ministry,
  body,
}: typeActionMinistryUpdate): Promise<$Res> {
  try {
    // CHECK IF ID PROVIDED
    delete body.id;
    body = {
      ...body,
      wicf_member_id: Number(body.wicf_member_id),
    };
    const wicf_member_id = body.wicf_member_id;
    // console.log("wicf_member_id", wicf_member_id);
    if (!wicf_member_id) {
      return new $Res({
        isError: true,
        message: "Please provide wicf_member_id to update ministry data",
      });
    }
    // CHECK USER REGISTERED
    const user = await actionWicfUserGet({ id: wicf_member_id });
    if (!user) {
      return new $Res({
        isError: true,
        message: "User is not registered, please register first",
      });
    }
    // CHECK ALLOWED MINISTRY
    switch (ministry) {
      case "worship":
        break;
      default:
        return new $Res({
          isError: true,
          message:
            "Ministry you are trying to update for does not exist or is not open for update",
        });
    }
    // CHECK USER IN MINISTRY
    // const wicf_member_id = body.id;
    const tableName = `wicf_member_${ministry}`;
    const userMinistryData = await prisma[tableName].findUnique({
      where: {
        wicf_member_id,
      },
    });
    if (!userMinistryData) {
      return new $Res({
        isError: true,
        message: "You are not a member in ministry please join it first",
      });
    }
    // TRY UPDATE USER MINISTRY DATA
    const updatedData = await prisma[tableName].update({
      where: {
        wicf_member_id,
      },
      data: {
        ...body,
      },
    });
    if (!updatedData) {
      return new $Res({
        isError: true,
        message: "Unkown error at update of ministry data",
      });
    }
    logger.debug(
      `user:${wicf_member_id} updated their [${ministry}] information`,
    );
    return new $Res({
      isError: false,
      message: `Successfully updated your ${ministry} ministry information`,
      data: new $WicfUser({ user, [ministry]: updatedData }),
    });
  } catch (error) {
    return new $Res({
      isError: true,
      message: GetErrorMessage(error.code, null, error),
      data: null,
      code: error.code,
    });
  }
}

export async function actionWicfUserUpdate(body): Promise<$Res> {
  const id = body.id;
  delete body.id;
  delete body.user_id;
  try {
    const data = await prisma.wicf_member.update({
      where: {
        id,
        // phone_number: body.phone_number,
      },
      data: {
        ...body,
        registration_last_update_time: new Date(),
      },
    });
    try {
      //LOG CHANGE
      await prisma.wicf_member_logs.create({
        data: {
          ...data,
        },
      });
    } catch {}
    if (data) {
      logger.debug("updating wicf member", {
        body,
      });
      return new $Res({
        isError: false,
        message: `Successfully updated your information`,
        data: data,
        code: null,
      });
    } else {
      return new $Res({
        isError: true,
        message: "Failed to update user",
      });
    }
  } catch (error) {
    logger.error(error);
    return new $Res({
      isError: true,
      message: GetErrorMessage(error.code, null, error),
      data: null,
      code: error.code,
    });
  }
}

interface argsActionCheckIfMininstryMember {
  ministry: string;
  wicf_member_id: string | number;
}
export async function actionIsMininstryMember({
  ministry,
  wicf_member_id,
}: argsActionCheckIfMininstryMember) {
  try {
    const userMinistryData = await prisma["wicf_member_" + ministry].findUnique(
      {
        where: {
          wicf_member_id,
        },
      },
    );
    // console.log("util_isMininstryMember_userData", userData);
    if (userMinistryData) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    logger.error(error);
    return null;
  }
}

export async function actionGetFellowshipMembers(body): Promise<$Res> {
  try {
    // throw new Error("unkown result");
    const k = body.k;
    const ministry = body.ministry;
    const property = body.property;
    const university = body.university;
    const nationality = body.nationality;
    let value = body.value;
    switch (property) {
      // case "id":
      //   const id = Number(value);
      //   console.log("id", id);
      //   value = id;
      //   break;
      default:
    }
    if (k !== process.env.KEY_K) {
      throw new Error("noAuth");
    }
    if (ministry) {
      switch (ministry) {
        case "worship":
          break;
        default:
          throw new Error("noMinistry");
      }
      let members;
      // if (property && value) {
      //   members = await prisma[`wicf_member_${ministry}`].findMany({
      //     where: {
      //       [property]: {
      //         contains: value,
      //       },
      //     },
      //     include: { wicf_member: true },
      //   });
      // } else {
      //   members = await prisma[`wicf_member_${ministry}`].findMany({
      //     where: {
      //       nationality,
      //     },
      //     include: { wicf_member: true },
      //   });
      // }
      members = await prisma[`wicf_member_${ministry}`].findMany({
        where: {
          ...(nationality && { wicf_member: { nationality } }),
          ...(university && { wicf_member: { university } }),
          ...(property &&
            value && {
              [property]: {
                contains: value,
              },
            }),
        },
        // include: { wicf_member: true },
        include: { wicf_member: true },
      });
      // if(property && value){

      // }
      if (!members) {
        throw new Error("noMembers");
      }
      return new $Res({
        isError: false,
        message: "Successfully got ministry members",
        data: members,
      });
    }
    let members;
    // if (property && value) {
    //   members = await prisma.wicf_member.findMany({
    //     where: {
    //       [property]: {
    //         contains: value,
    //       },
    //     },
    //   });
    // } else {
    //   members = await prisma.wicf_member.findMany({
    //     where: {
    //       ...(nationality && { nationality }),
    //       ...(university && { university }),
    //     },
    //   });
    // }
    members = await prisma.wicf_member.findMany({
      where: {
        ...(nationality && { nationality }),
        ...(university && { university }),
        ...(property &&
          value && {
            [property]: {
              contains: value,
            },
          }),
      },
    });
    // console.log("users", users);
    if (!members) {
      throw new Error("membersNotFound");
    }
    return new $Res({
      isError: false,
      message: "Successfully found the members",
      data: members,
    });
  } catch (error) {
    logger.error(error);
    return new $Res({
      isError: true,
      message: GetErrorMessage(error.code, null, error),
      data: null,
      code: error.code,
    });
  }
}

export async function actionLiveGet({
  // body,
  action,
}: ArgsAction): Promise<$Res> {
  try {
    // const action = body.action;
    switch (action) {
      case "live_get":
        let live_data = await prisma.live.findUnique({
          where: {
            id: 0,
          },
          include: {
            stream: true,
          },
        });
        if (!live_data) {
          return handleRequestError({
            message: "no live data",
          });
        }
        return handleRequestData({
          message: "Successfully got the live data",
          data: live_data,
        });
      case "streams_get":
        let data = await prisma.stream.findMany({
          where: {
            deleted: { equals: null },
          },
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        });
        if (!data) {
          return handleRequestError({
            message: "no live list found",
          });
        }
        data = data.map((item) =>
          typeof item.links === "string"
            ? { ...item, links: JSON.parse(item.links) }
            : item,
        );
        return handleRequestData({
          message: "Successfully found the live list",
          data,
        });
      case "location_get":
        const location_data = await prisma.location.findMany({
          distinct: ["id"],
          orderBy: { id: "desc" },
        });
        if (!location_data || !location_data[0]) {
          return handleRequestError({
            message:
              "Could not find any location information, please update the location form",
          });
        }
        return handleRequestData({
          message: "Successfully found the location",
          data: location_data[0],
        });
      default:
        return handleRequestError({
          // message: "no live list action",
          code: "live-no-get-action",
        });
    }
  } catch (error) {
    logger.error(error);
    return handleRequestError({
      message: "No live list action",
      code: error?.code ?? "live-no-get-action",
      error: error,
    });
  }
}

export async function actionLivePost({
  res,
  req,
  action,
  body,
}: ArgsAction): Promise<$Res> {
  try {
    // const action = body.action;
    const session = await actionRequireLogin({ body, action, req, res });
    if (!session) return handleRequestError({ code: "login_require" });
    // if (res && req) {
    //   const session = (await actionGetSession(
    //     req,
    //     res
    //   )) as unknown as TypeSession;
    //   body.user_id = session?.user?.id ?? body.user_id;
    //   if (!body.user_id)
    //     return handleRequestError({
    //       message: "Please login and try again",
    //     });
    // }
    switch (action) {
      case "stream_create":
        delete body.action;
        if (!body.title || !body.description)
          return handleRequestError({
            message: "please provide the required parameters",
          });
        delete body.id;
        body.user_id = session.user.id;
        body.links =
          typeof body.links === "string"
            ? body.links
            : JSON.stringify(body.links);
        let data = await prisma.stream.create({
          data: body,
        });
        data =
          typeof data.links === "string"
            ? { ...data, links: JSON.parse(data.links) }
            : data;
        if (!data) {
          return handleRequestError({
            message: "no live list found",
          });
        }
        return handleRequestData({
          message: "Successfully found the live list",
          data,
        });
      case "location_create":
        delete body.action;
        const location_data = await prisma.location.create({
          data: {
            ...body,
            user_id: session.user.id,
          },
        });
        if (!location_data) {
          return handleRequestError({
            message: "Location failed to update",
          });
        }
        return handleRequestData({
          message: "Successfully found the live list",
          data: location_data,
        });
      default:
        return handleRequestError({
          message: "No live action",
          code: "live-no-post-action",
        });
    }
  } catch (error) {
    logger.error(error);
    return handleRequestError({
      code: error.code,
      error: error,
    });
  }
}

export async function actionLiveUpdate({
  action,
  body,
  res,
  req,
  isDelete,
}: ArgsAction): Promise<$Res> {
  try {
    // const action = body.action;
    const session = await actionRequireLogin({ action, body, res, req });
    if (!session) {
      return handleRequestError({
        code: "login_require",
      });
    }
    switch (action) {
      case "live_create":
        delete body.action;
        let stream;
        if (!body.stream_id)
          return handleRequestError({
            message: "Please provide the required parameters {stream_id}",
          });
        stream = await prisma.stream.findUnique({
          where: { id: body.stream_id },
        });
        if (!stream) {
          return handleRequestError({
            message: "Stream id invalid, please select valid id",
          });
        }
        const message = `Successfully set ${stream.title} to live`;
        try {
          const live = await prisma.live.findUnique({ where: { id: 0 } });
          if (live) {
            return handleRequestData({
              message,
              data: await prisma.live.update({
                where: { id: 0 },
                data: { stream_id: body.stream_id, date: new Date() },
                include: {
                  stream: true,
                },
              }),
            });
          } else {
            return handleRequestData({
              message,
              data: await prisma.live.create({
                data: { id: 0, stream_id: body.stream_id, date: new Date() },
                include: {
                  stream: true,
                },
              }),
            });
          }
        } catch {
          return handleRequestData({
            message,
            data: await prisma.live.create({
              data: { id: 0, stream_id: body.stream_id, date: new Date() },
            }),
          });
        }
      case "live_delete":
        if (!isDelete) return handleRequestError({ code: "e2" });
        let live_deleted = await prisma.live.delete({
          where: {
            id: 0,
          },
        });
        if (!live_deleted) {
          return handleRequestError({
            message: "Delete live failed",
          });
        }
        return handleRequestData({
          message: "Successfully deleted live",
          data: live_deleted,
        });
      case "stream_update":
        delete body.action;
        if (!body.title || !body.description || !body.id)
          return handleRequestError({
            message:
              "Please provide the required parameters {id, title, description}",
          });
        let id = Number(body.id);
        delete body.id;
        if (!id)
          return handleRequestError({
            message: "Invalid Id type",
          });
        let data = await prisma.stream.update({
          where: {
            id,
          },
          data: { ...body, links: JSON.stringify(body.links) },
        });
        data =
          typeof data.links === "string"
            ? { ...data, links: JSON.parse(data.links) }
            : data;
        if (!data) {
          return handleRequestError({
            message: "Update failed",
          });
        }
        return handleRequestData({
          message: "Successfully updated stream",
          data,
        });
      case "stream_delete":
        if (!isDelete) return handleRequestError({ code: "e2" });
        let delete_id = Number(body.id);
        if (!delete_id) return handleRequestError({ code: "e3" });
        let delete_data = await prisma.stream.update({
          where: {
            id: delete_id,
          },
          data: {
            deleted: new Date(),
          },
        });
        delete_data =
          typeof delete_data.links === "string"
            ? { ...delete_data, links: JSON.parse(delete_data.links) }
            : delete_data;
        if (!delete_data) {
          return handleRequestError({
            message: "Delete failed",
          });
        }
        return handleRequestData({
          message: "Successfully deleted stream",
          data: delete_data,
        });
      default:
        return handleRequestError({
          message: "No live action",
        });
    }
  } catch (error) {
    logger.error(error);
    return handleRequestError({
      code: error.code ?? undefined,
      error: error,
    });
  }
}

export async function actionAdminGet({
  action,
  body,
  res,
  req,
}: ArgsAction): Promise<$Res> {
  try {
    // const action = body.action;
    const session = actionRequireLogin({ action, body, res, req });
    if (!session) return handleRequestError({ message: "" });
    switch (action) {
      case "users_get":
        let data_users = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        });
        if (!data_users) {
          return handleRequestError({
            message: "No user data",
          });
        }
        return handleRequestData({
          message: "Successfully got the users data",
          data: data_users,
        });
      case "routes_get":
        let data_routes = await prisma.route.findMany({
          include: {
            roles: true,
          },
        });
        if (!data_routes) {
          return handleRequestError({
            message: "No route data",
          });
        }
        return handleRequestData({
          message: "Successfully got the routes data",
          data: data_routes,
        });
      case "roles_get":
        let data_roles = await prisma.role.findMany({
          include: {
            users: {
              select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
              },
            },
            routes: true,
          },
        });
        if (!data_roles) {
          return handleRequestError({
            message: "No roles data",
          });
        }
        return handleRequestData({
          message: "Successfully got the roles data",
          data: data_roles,
        });
      default:
        return handleRequestError({
          message: "no admin action",
        });
    }
  } catch (error) {
    logger.error(error);
    return handleRequestError({
      message: "no admin action",
      code: error?.code ?? "admin-no-get-action",
      error: error,
    });
  }
}

export async function actionAdminPost({
  action,
  body,
  res,
  req,
}: ArgsAction): Promise<$Res> {
  try {
    // const action = body.action;
    const session = actionRequireLogin({ action, body, req, res });
    if (!session) return handleRequestError({ code: "login_require" });
    delete body.action;
    switch (action) {
      case "role_user_add":
        if (!body.role_name && !body.user_id)
          return handleRequestError({
            message: `Please provide required params`,
          });
        let role = await prisma.role.findUnique({
          where: {
            name: body.role_name,
          },
          include: {
            users: true,
          },
        });
        if (!role) {
          return handleRequestError({
            message: "Role not found",
          });
        }
        const roleNew = await prisma.role.update({
          where: {
            id: role.id,
          },
          data: {
            users: {
              connect: {
                id: body.user_id,
              },
            },
          },
        });
        if (!roleNew) {
          return handleRequestError({
            message: "Failed to add user to role, or non-existing user",
          });
        }
        return handleRequestData({
          message: "Successfully added role",
          data: role,
        });
      case "role_create":
        if (typeof body.name === "string")
          body.name = utilRemoveSpacesAndLowercase({ string: body.name });
        const role_create = await prisma.role.create({
          data: {
            ...body,
          },
        });
        if (!role_create) {
          return handleRequestError({
            message: "Role failed to create",
          });
        }
        return handleRequestData({
          message: "Successfully created role",
          data: role_create,
        });
      case "route_create":
        let { url } = body;
        if (!url) return handleRequestError({ code: "invalid_params" });
        if (typeof url === "string")
          url = utilRemoveSpacesAndLowercase({ string: url });
        const route_create = await prisma.route.create({
          data: {
            url,
          },
        });
        if (!route_create) {
          return handleRequestError({
            message: "Route failed to create",
          });
        }
        return handleRequestData({
          message: "Successfully created route",
          data: route_create,
        });
      default:
        return handleRequestError({
          message: "No admin action",
        });
    }
  } catch (error) {
    logger.error(error);
    return handleRequestError({
      code: error.code,
      error: error,
    });
  }
}

export async function actionAdminUpdate({
  // action,
  body,
  res,
  req,
  isDelete,
}: ArgsAction): Promise<$Res> {
  try {
    const action = body.action;
    const session = await actionRequireLogin({ action, body, res, req });
    if (!session) {
      return handleRequestError({
        code: "login_require",
      });
    }
    delete body.action;
    const route = body.route as TypeRoute;
    const role = body.role as TypeRole;
    let message_success = ``;
    let messaga_failed = ``;
    switch (action) {
      case "role_add_route":
        message_success = `Successfully added ${route.url} to ${role.name}`;
        messaga_failed = `Failed to add route to role, please provide params and previlages or contact admin`;
        if (!route || !role) {
          return handleRequestError({
            message: "Please provide the required parameters",
          });
        }
        try {
          const role_add_route = await prisma.role.update({
            where: { id: role.id },
            data: {
              routes: {
                connect: {
                  id: route.id,
                },
              },
            },
          });
          if (!role_add_route) {
            return handleRequestError({
              message: messaga_failed,
            });
          }
          return handleRequestData({
            message: message_success,
            data: role_add_route,
          });
        } catch (error) {
          return handleRequestError({
            code: "action_error",
            error,
          });
        }
      case "role_delete_route":
        message_success = `Successfully deleted ${route.url} from ${role.name}`;
        messaga_failed = `Failed to delete route from role, please provide params and previlages or contact admin`;
        if (!route || !role) {
          return handleRequestError({
            message: "Please provide the required parameters",
          });
        }
        try {
          const role_delete_route = await prisma.role.update({
            where: { id: role.id },
            data: {
              routes: {
                disconnect: {
                  id: route.id,
                },
              },
            },
          });
          if (!role_delete_route) {
            return handleRequestError({
              message: messaga_failed,
            });
          }
          return handleRequestData({
            message: message_success,
            data: role_delete_route,
          });
        } catch (error) {
          return handleRequestError({
            code: "action_error",
            error,
          });
        }
      case "role_delete_user":
        message_success = `Successfully removed user from role`;
        messaga_failed = `Failed to remove user from role`;
        if (!isDelete) return handleRequestError({ code: "e2" });
        try {
          const { role_id, user_id } = body;
          if (!role_id || !user_id) {
            return handleRequestError({
              message: "Please provide the required parameters",
            });
          }
          const role_delete_user = await prisma.role.update({
            where: { id: Number(role_id) },
            data: {
              users: {
                disconnect: {
                  id: user_id,
                },
              },
            },
          });
          if (!role_delete_user) {
            return handleRequestError({
              message: messaga_failed,
            });
          }
          return handleRequestData({
            message: message_success,
            data: role_delete_user,
          });
        } catch (error) {
          return handleRequestError({
            code: "action_error",
            error,
          });
        }
      default:
        return handleRequestError({
          message: `No admin update action , action: ${action}`,
        });
    }
  } catch (error) {
    logger.error(error);
    return handleRequestError({
      code: error.code ?? undefined,
      error: error,
    });
  }
}

export async function actionBB23Post({
  action,
  body,
}: // res,
// req,
ArgsAction): Promise<$Res> {
  try {
    // console.log(action);
    // const session = actionRequireLogin({ action, body, req, res });
    // if (!session) return handleRequestError({ code: "login_require" });
    delete body.action;
    switch (action) {
      case "bb23_users_get":
        let users_get: any = undefined;
        if (body.onlyIsSortable === true) {
          users_get = await prisma.bb_user.findMany({
            where: {
              is_sortable: true,
            },
            include: {
              bb_team: true,
            },
          });
        } else {
          users_get = await prisma.bb_user.findMany({
            include: {
              bb_team: true,
            },
          });
        }

        if (!users_get) {
          return handleRequestError({ message: "No BB23 members found" });
        }
        return handleRequestData({
          message: "Successfully got bb23 users",
          data: users_get,
        });
      case "bb23_teams_get":
        let teams_get = await prisma.bb_team.findMany({
          include: {
            members: true,
            bb_questions: true,
          },
        });
        if (!teams_get) {
          return handleRequestError({ message: "No BB23 members found" });
        }
        return handleRequestData({
          message: "Successfully got bb23 teams",
          data: teams_get,
        });
      case "bb23_questions_get":
        let bb23_questions_get = await prisma.bb_question.findMany({
          include: {
            bb_team: true,
          },
        });
        if (!bb23_questions_get) {
          return handleRequestError({ message: "No BB23 questions found" });
        }
        return handleRequestData({
          message: "Successfully got bb23 teams",
          data: bb23_questions_get,
        });
      case "bb23_user_set_sortable":
        if (!body.user_id || body.is_sortable === undefined) {
          return handleRequestError({ code: "invalid_params" });
        }
        const id = body.user_id;
        const is_sortable = Boolean(body.is_sortable);
        const user_set_sortable = await prisma.bb_user.update({
          where: {
            id,
          },
          data: {
            is_sortable,
          },
        });

        if (!user_set_sortable) {
          handleRequestError({
            message: "Failed to update member",
          });
        }
        return handleRequestData({
          message: `Successfully updated member`,
          data: user_set_sortable,
        });
      case "bb23_teams_set_members":
        if (!body.team_id || !body.members_id_array) {
          return handleRequestError({ code: "invalid_params" });
        }
        // const clean = await prisma.bb_team.update({
        //   where: {
        //     id: Number(body.team_id),
        //   },
        //   data: {
        //     members: {
        //       set: [],
        //     },
        //   },
        // });
        const bb23_teams_set_members = await prisma.bb_team.update({
          where: {
            id: Number(body.team_id),
          },
          data: {
            members: {
              connect: body.members_id_array.map((id) => ({ id: Number(id) })),
            },
          },
        });
        if (!bb23_teams_set_members) {
          return handleRequestError({ code: "action_no_result" });
        }
        return handleRequestData({
          message: "Successfully updated member to team",
          data: bb23_teams_set_members,
        });
        break;
      default:
        return handleRequestError({
          message: "No bb23 action",
        });
    }
  } catch (error) {
    logger.error(error);
    return handleRequestError({
      code: error.code,
      error: error,
    });
  }
}
const actionGetPhotoAlbumData = ({
  photos_data,
  album_key,
  thumbnail_url,
}: {
  photos_data: TypeAlbumRawFolders;
  album_key: string;
  thumbnail_url?: string;
}) => {
  // const thumbnail_url = photos_data[album_key].thumbnail_urls[0];
  const image_object_array: TypeImageObject[] = [];
  photos_data[album_key].image_urls.map((image_url: string) => {
    const imageName = image_url.split("/").pop(); // Extract the image name from the URL
    image_object_array.push({
      image_url,
      thumbnail_url: photos_data[album_key].thumbnail_urls.find(
        (thumbnail_url: string) =>
          thumbnail_url.split("/thumbnails/")[1] === `tn_${imageName}`,
      ),
    });
  });
  const data = {
    thumbnail_url: thumbnail_url ?? photos_data[album_key].thumbnail_urls[0],
    album_key,
    image_url_count: photos_data[album_key].image_urls.length,
    image_url_array: JSON.stringify(photos_data[album_key].image_urls),
    thumbnail_url_count: photos_data[album_key].thumbnail_count,
    thumbnail_url_array: JSON.stringify(photos_data[album_key].thumbnail_urls),
    image_object_array: JSON.stringify(image_object_array),
  };
  return data;
};
export async function actionPhotosPost({
  action,
  body,
  res,
  req,
}: ArgsAction): Promise<$Res> {
  function parsePhotosAlbum({ photos_album: photos_album }): TypePhotosAlbum {
    return {
      ...photos_album,
      image_url_array: utilParseProperty(photos_album, "image_url_array"),
      image_url_array_hidden: utilParseProperty(
        photos_album,
        "image_url_array_hidden",
      ),
      image_url_array_dont_thumbnail: utilParseProperty(
        photos_album,
        "image_url_array_dont_thumbnail",
      ),
      thumbnail_url_array: utilParseProperty(
        photos_album,
        "thumbnail_url_array",
      ),
      image_object_array: utilParseProperty(photos_album, "image_object_array"),
    };
  }
  try {
    delete body.action;
    const { album_key } = body;
    switch (action) {
      case "photos_album_view_add":
        // const { album_key } = body;
        if (!album_key) {
          return handleRequestError({
            message: "Please provide an album_key",
          });
        }
        let photos_view_album = await prisma.photos_album.findUnique({
          where: {
            album_key,
          },
        });
        if (!photos_view_album) {
          return handleRequestError({
            message: "Please provide valid id",
          });
        }
        let photos_album_view_updated = await prisma.photos_album.update({
          where: {
            album_key,
          },
          data: {
            views: {
              increment: 1,
            },
          },
        });
        return handleRequestData({
          message: "Successfully updated album view count",
          data: photos_album_view_updated.views,
        });
      case "photos_albums_get":
        let photos_albums = await prisma.photos_album.findMany();
        if (!photos_albums) {
          return handleRequestError({ message: "No Photo albums found" });
        }
        const photos_albums_data: TypePhotosAlbum[] = [];
        photos_albums.map((photos_album) => {
          photos_albums_data.push(parsePhotosAlbum({ photos_album }));
        });
        return handleRequestData({
          message: "Successfully got photo albums",
          data: photos_albums_data,
        });
      case "photos_info":
        let photos_info = await prisma.photos_info.findFirst({
          include: {
            admin_roles: true,
          },
        });
        if (!photos_info) {
          // return handleRequestError({ message: "No Photos info" });
          return handleRequestData({
            message: "No Photos info",
            data: {},
          });
        }
        return handleRequestData({
          message: "Successfully got photo info",
          // data: photos_info[photos_info.length - 1],
          data: photos_info,
        });
      case "photos_info_update":
        const session = await actionRequireLogin({ body, action, req, res });
        if (!session) return handleRequestError({ code: "login_require" });
        let roles: number[] = [];
        if (body.admin_roles) {
          body.admin_roles.map((role) => {
            roles.push(Number(role));
          });
        }
        delete body.admin_roles;
        // let photos_info_id: number = undefined;
        const photos_info_current = await prisma.photos_info.findFirst();

        if (!photos_info_current) {
          const photos_info_new = await prisma.photos_info.create({
            data: {
              ...body,
              user_id: session.user.id,
            },
          });
          if (!photos_info_new) {
            return handleRequestError({
              message: "Photos Info failed to be created",
            });
          }
          return handleRequestData({
            message:
              "Successfully created Photo Info, please reupdate the roles",
            data: photos_info_new,
          });
        }
        // AM TIRED HERE, DO BETTER CHECK IF ROLES CHANGED IF NOT DONT CLEAR
        const roleUpdate1 = await prisma.photos_info.update({
          where: {
            id: photos_info_current.id,
          },
          data: {
            admin_roles: {
              set: [],
            },
          },
        });
        const roleUpdate2 = await prisma.photos_info.update({
          where: {
            id: photos_info_current.id,
          },
          data: {
            admin_roles: {
              connect: roles.map((roleId) => ({ id: roleId })),
            },
          },
        });

        const photos_info_update = await prisma.photos_info.update({
          where: {
            id: photos_info_current.id,
          },
          data: {
            ...body,
            user_id: session.user.id,
          },
          include: {
            admin_roles: true,
          },
        });

        if (!photos_info_update) {
          return handleRequestError({
            message: "Photos Info failed to update",
          });
        }
        return handleRequestData({
          message:
            "Successfully updated Photos info" + (roleUpdate1 || roleUpdate2)
              ? "But failed to update roles"
              : "",
          data: photos_info_update,
        });
      case "photos_album_get":
        let id = body.id ? Number(body.id) : undefined;
        if (Number.isNaN(id)) id = undefined;
        // const album_key = body.album_key;
        if (!album_key && !id) {
          return handleRequestError({
            message: "Please provide an album_key or id",
          });
        }
        let photos_album = await prisma.photos_album.findUnique({
          where: {
            id,
            album_key,
          },
        });
        if (!photos_album) {
          return handleRequestError({ message: "No Photo album found" });
        }
        const data: TypePhotosAlbum = parsePhotosAlbum({ photos_album });
        return handleRequestData({
          message: "Successfully got photo album",
          data,
        });
      case "photos_source_update":
        const response = await fetch(
          "https://maravianwebservices.com/images/wicf/",
        );
        const photos_data: TypeAlbumRawFolders | null =
          (await response.json()) as any;
        if (!photos_data) {
          return handleRequestError({
            message: "Failed to fetch data from image server",
          });
        }
        const updates_photos_successfully: photos_album[] = [];
        await Promise.all(
          Object.keys(photos_data).map(async (album_key) => {
            if (!photos_data[album_key].image_urls.length) return;
            // CHECK IF ALBULM EXISTS
            const album = await prisma.photos_album.findUnique({
              where: {
                album_key,
              },
            });
            const thumbnail_url =
              album?.thumbnail_url ?? photos_data[album_key].image_urls[0];
            // IF NOT EXIST CREATE ALBUM
            if (!album) {
              logger.info(`Creating new photo album album_key:${album_key}`);
              const new_album = await prisma.photos_album.create({
                data: actionGetPhotoAlbumData({
                  photos_data,
                  album_key,
                  thumbnail_url,
                }),
              });
              if (!new_album) {
                return handleRequestError({
                  error: `Failed to create photo album album_key:${album_key}`,
                });
              }
            } else {
              // UPDATE IMAGES
              const album_updated = await prisma.photos_album.update({
                where: {
                  album_key,
                },
                // data: {
                //   thumbnail_url,
                //   image_url_array: JSON.stringify(photos_data[album_key]),
                // },
                data: actionGetPhotoAlbumData({
                  photos_data,
                  album_key,
                  thumbnail_url,
                }),
              });
              if (!album_updated) {
                return handleRequestError({
                  error: `Failed to update photo album album_key:${album_key}`,
                });
              } else {
                updates_photos_successfully.push(album_updated);
              }
            }
          }),
        );
        return handleRequestData({
          message: "Successfully fetched data",
          data: updates_photos_successfully,
        });
      case "photos_album_hide":
        if (!album_key) {
          return handleRequestError({
            message: "Please provide an album_key",
          });
        }
        let photos_album_hide = await prisma.photos_album.update({
          where: {
            album_key,
          },
          data: {
            is_public: false,
          },
        });
        if (!photos_album_hide) {
          return handleRequestError({
            message: "Failed to hide album",
          });
        }
        return handleRequestData({
          message: "Successfully hidden album",
          data: [],
        });
      case "photos_album_public":
        if (!album_key) {
          return handleRequestError({
            message: "Please provide an album_key",
          });
        }
        let photos_album_public = await prisma.photos_album.update({
          where: {
            album_key,
          },
          data: {
            is_public: true,
          },
        });
        if (!photos_album_public) {
          return handleRequestError({
            message: "Failed to hide album",
          });
        }
        return handleRequestData({
          message: "Successfully hidden album",
          data: [],
        });
      case "photos_album_edit":
        if (!album_key) {
          return handleRequestError({
            message: "Please provide an album_key",
          });
        }
        let photos_album_edit = await prisma.photos_album.update({
          where: {
            album_key,
          },
          data: {
            ...body,
          },
        });
        if (!photos_album_edit) {
          return handleRequestError({
            message: "Failed to update album",
          });
        }
        return handleRequestData({
          message: "Successfully updated album",
          data: [],
        });
      case "photos_album_hidden_images_set":
        if (!album_key) {
          return handleRequestError({
            message: "Please provide an album_key",
          });
        }
        let photos_album_hidden_images_set = await prisma.photos_album.update({
          where: {
            album_key,
          },
          data: {
            ...body,
          },
        });
        if (!photos_album_hidden_images_set) {
          return handleRequestError({
            message: "Failed to update hidden images",
          });
        }
        return handleRequestData({
          message: "Successfully updated hidden images",
          data: [],
        });
      case "photos_album_set_thumbnail":
        if (!album_key || !body.thumbnail_url) {
          return handleRequestError({
            message: "Please provide an album_key and thumbnail_url",
          });
        }
        let photos_album_set_thumbnail = await prisma.photos_album.update({
          where: {
            album_key,
          },
          data: {
            thumbnail_url: body.thumbnail_url,
          },
        });
        if (!photos_album_set_thumbnail) {
          return handleRequestError({
            message: "Failed to update thumbnail",
          });
        }
        return handleRequestData({
          message: "Successfully updated thumbnail",
          data: [],
        });
      default:
        return handleRequestError({
          message: "No Photos action",
        });
    }
  } catch (error) {
    logger.error(error);
    return handleRequestError({
      code: error.code,
      error: error,
    });
  }
}

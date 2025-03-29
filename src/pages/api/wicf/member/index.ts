import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { GetErrorMessage } from "@/lib/errors";
// import { wicf_member, wicf_member_worship } from "@prisma/client";
import {
  $Res,
  $WicfUser,
  // type$Res
} from "@/shared/shared_classes";
import {
  actionMinistryJoin,
  actionMinistryUpdate,
  actionWicfUserCreate,
  actionWicfUserUpdate,
} from "@/shared/shared_actions";
import { TypeErrorCode } from "@/shared/shared_types";
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    await handlePOST(res, req);
  } else if (req.method === "GET") {
    await handleGET(res, req);
  } else if (req.method === "PATCH") {
    await handleUPDATE(res, req);
  } else {
    res.status(500).json({ message: "API Endpoint Only" });
  }
}
function getErrorMessage(code: TypeErrorCode, errorObject) {
  switch (code) {
    case "P2002":
      return "Your phone number is already registered with, update your information instead";
    case "P2003":
      return "Invalid Phone number";
    case "P2025":
      return "The User you are trying to update doesnt exists";
    default:
      // Call shared getErrorMessage()
      return GetErrorMessage(
        code,
        "Please fill the required fields, use a unique phone number or register if you are new",
        errorObject,
      );
  }
}
async function handlePOST(res, req) {
  const wicf_member_id = Number(req.body.wicf_member_id ?? req.body.id);
  delete req.body.id;
  delete req.body.wicf_member_id;
  const ministry = req.body.ministry;
  delete req.body.ministry;
  if (ministry) {
    // JOIN MINISTRY
    if (!wicf_member_id) {
      res.status(400).json({
        isError: true,
        message: "Please Provide a valid wicf_member_id to join ministry",
        data: null,
        code: null,
      });
      return;
    }
    const body = {
      ...req.body,
      wicf_member_id,
    };
    const result = await actionMinistryJoin({ ministry, body });
    if (result.data) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } else {
    // GENERAL USER CREATION
    const body = {
      ...req.body,
    };
    if (!body.first_name || !body.last_name || !body.phone_number) {
      res.status(400).json({
        isError: true,
        message: "Please Provide first_name, last_name and phone_number",
        data: null,
        code: null,
      });
      return;
    }
    logger.debug("adding new wicf member", {
      body,
    });
    const result = await actionWicfUserCreate(body);
    if (result.data) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  }
}

async function handleGET(res, req) {
  const query = {
    id: req.query.id ? Number(req.query.id) : req.query.id,
    phone_number: req.query.phone_number,
    user_id: req.query.user_id,
    ministry: req.query.ministry,
  };

  logger.debug("getting wicf member", {
    query,
  });
  try {
    const user = await prisma.wicf_member.findUnique({
      where: {
        id: query.id,
        phone_number: query.phone_number,
        user_id: query.user_id,
      },
    });
    if (user !== null) {
      const worship =
        query.ministry === "worship"
          ? await prisma.wicf_member_worship.findUnique({
              where: {
                wicf_member_id: user.id,
              },
            })
          : null;
      // console.log("worship", worship);
      res.json({
        isError: false,
        message: `Successfully found your information`,
        data: new $WicfUser({ user, worship }),
        code: null,
      });
    } else {
      res.json({
        isError: true,
        message: `You are not registered with this number, please register as WICF member first`,
        data: null,
        code: null,
      });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      isError: true,
      message: getErrorMessage(error.code, error),
      data: null,
      code: error.code,
    });
  }
}

async function handleUPDATE(res, req) {
  const id = req.body.id;
  const ministry = req.body.ministry;
  delete req.body.ministry;
  if (!ministry && !id) {
    res.status(400).json(
      new $Res({
        isError: true,
        message: "Please provide an id of the entity to update",
      }),
    );
    return;
  }
  const body = {
    ...req.body,
    id: req.body.id ? Number(req.body.id) : req.body.id,
    // is_requesting_salvation_rededication: req.body
    //   .is_requesting_salvation_rededication
    //   ? Boolean(req.body.is_requesting_salvation_rededication)
    //   : req.body.is_in_china,
    // is_requesting_prayer: req.body.is_requesting_prayer
    //   ? Boolean(req.body.is_requesting_prayer)
    //   : req.body.is_in_china,
    // is_in_china: req.body.is_in_china
    //   ? Boolean(req.body.is_in_china)
    //   : req.body.is_in_china,
  };
  try {
    if (ministry) {
      // UPDATE USER MINISTRY DATA
      let result = await actionMinistryUpdate({ ministry, body });
      if (result.data) {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
      return;
    }
    // UPDATE USER NORMALLY
    let result = await actionWicfUserUpdate(body);
    if (result.data) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      isError: true,
      message: getErrorMessage(error.code, error),
      data: null,
      code: error.code,
    });
  }
}

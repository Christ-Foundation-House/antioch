import type { NextApiRequest, NextApiResponse } from "next";
import { logger } from "@/lib/logger";
import { GetErrorMessage } from "@/lib/errors";
import { actionGetFellowshipMembers } from "@/shared/shared_actions";

// function getErrorMessage(code: string, errorObject) {
//   switch (code) {
//     case "custom":
//       return "Custom Error";
//     default:
//       return GetErrorMessage(
//         code,
//         "Please fill the required fields, use a unique phone number or register if you are new",
//         errorObject
//       );
//   }
// }

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

async function handlePOST(res, req) {
  try {
    const body = req.body;
    console.log("handlePOST", body);
    res.json({
      isError: false,
      message: `Tempalate.Post Works Fine`,
      data: {
        isWorking: true,
        ...body,
      },
      code: null,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      isError: true,
      message: GetErrorMessage(error.code, "POST error, contact Admin", error),
      data: null,
      code: error.code,
    });
  }
}

async function handleGET(res, req) {
  try {
    const query = req.query;
    console.log("handleGET", query);
    const users = await actionGetFellowshipMembers(query);
    if (users.data && users.isError == false) {
      res.status(200).json(users);
      return;
    } else {
      res.status(400).json(users);
      return;
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      isError: true,
      message: GetErrorMessage(error.code, "GET error, contact Admin", error),
      data: null,
      code: error.code,
    });
  }
}

async function handleUPDATE(res, req) {
  try {
    const body = req.body;
    console.log("handlePOST", body);
    res.json({
      isError: false,
      message: `Tempalate.Post Works Fine`,
      data: {
        isWorking: true,
        ...body,
      },
      code: null,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      isError: true,
      message: GetErrorMessage(
        error.code,
        "UPDATE error, contact Admin",
        error,
      ),
      data: null,
      code: error.code,
    });
  }
}

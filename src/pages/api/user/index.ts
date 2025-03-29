import type { NextApiRequest, NextApiResponse } from "next";
// import prisma from "@/lib/prisma";
// import sha256 from "crypto-js/sha256";
import { logger } from "@/lib/logger";
// import { GetErrorMessage } from "@/lib/errors";
import {
  actionUserCreate,
  actionUserGet,
  actionUserUpdate,
} from "@/shared/shared_actions";

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

// export const hashPassword = (password: string) => {
//   return sha256(password).toString();
// };
async function handlePOST(res, req) {
  const { first_name, last_name, email, phone_number, password } = req.body;
  if (!first_name || !last_name || !email || !phone_number || !password) {
    res.status(400).json({
      isError: true,
      message: "Please make sure you provide the required fields",
      data: null,
      code: "CredentialsSignup",
    });
  }
  const body = {
    first_name,
    last_name,
    email,
    phone_number,
    // password: hashPassword(password),
    password,
    image: "https://maravianwebservices.com/images/wicf/assets/logo.png",
  };
  // logger.debug("creating user", {
  //   ...body,
  // });
  const result = await actionUserCreate(body);
  if (result.data) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
}
async function handleGET(res, req) {
  logger.debug("getting user", {
    ...req.query,
  });
  const user = await actionUserGet(req.query);
  if (user.data) {
    res.json(user);
  } else {
    res.status(400).json(user);
  }
}
async function handleUPDATE(res, req) {
  logger.debug("updating user", {
    ...req.body,
  });
  const user = await actionUserUpdate({ body: req.body });
  if (user.data) {
    res.json(user);
  } else {
    res.status(400).json(user);
  }
}

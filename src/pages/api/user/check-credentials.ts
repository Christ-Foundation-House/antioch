import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import sha256 from "crypto-js/sha256";
import { logger } from "@/lib/logger";
import { omit } from "lodash";
import { GetErrorMessage } from "@/lib/errors";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    await handlePOST(res, req);
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`,
    );
  }
}

const hashPassword = (password: string) => {
  return sha256(password).toString();
};

// POST /api/user
async function handlePOST(res, req) {
  console.log("CREDS", req.body);
  try {
    const user = await prisma.user.findUnique({
      // where: { email: req.body.username },
      where: { phone_number: req.body.phone_number },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone_number: true,
        password: true,
      },
    });
    if (user && user.password == hashPassword(req.body.password)) {
      logger.debug("password correct");
      const usr = omit(user, "password");
      res.json({
        isError: false,
        message: "Credentials Valid",
        data: {
          user: usr,
        },
        code: null,
      });
    } else {
      logger.debug("incorrect credentials for =>" + req.body.email);
      // res.status(400).end("Invalid credentials");
      res.status(400).json({
        isError: true,
        message: GetErrorMessage("CredentialsSignin", "Credentials Invalid"),
        data: null,
        code: "CredentialsSignin",
      });
    }
  } catch (error) {
    console.log("@check-credentials_fail", error);
    res.status(400).json({
      isError: true,
      message: GetErrorMessage(error.code, null, error),
      data: null,
      code: error.code,
    });
  }
}

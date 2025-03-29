import type { NextApiRequest, NextApiResponse } from "next";
// import prisma from "@/lib/prisma";
// import sha256 from "crypto-js/sha256";
// import { logger } from "@/lib/logger";
// import { omit } from "lodash";
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

// const hashPassword = (password: string) => {
//   return sha256(password).toString();
// };

// POST /api/user
// const password = "112233";
export const k = process.env.KEY_K;
async function handlePOST(res, req) {
  // console.log(req.body.password, password);
  try {
    if (req.body.password === k) {
      res.json({
        isError: false,
        message: "Welcome Admin",
        data: {
          k,
        },
        code: null,
      });
    } else {
      res.status(400).json({
        isError: true,
        message: "Wrong password, please get permission",
        data: null,
        code: "CredentialsSignin",
      });
    }
  } catch (error) {
    console.log("@check-credentials_fail", error);
    res.status(500).json({
      isError: true,
      message: GetErrorMessage(error.code, null, error),
      data: null,
      code: error.code,
    });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import { logger } from "@/lib/logger";
import { GetErrorMessage } from "@/lib/errors";
import { actionPhotosPost } from "@/shared/shared_actions";
import { $Res } from "@/shared/shared_classes";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    let data: $Res | undefined;
    // const { action } =
    //   req.method === "GET" || req.method === "DELETE"
    //     ? (req.query as any)
    //     : (req.body as any);
    const { action } = { ...req.query, ...req.body } as any;
    if (req.method === "GET") req.body = req.query;
    switch (req.method) {
      case "POST":
      case "GET":
        data = await actionPhotosPost({ action, body: req.body, res, req });
        break;
      default:
        res.status(400).json({
          isError: true,
          message: GetErrorMessage("unSupportedRequestType"),
          data: null,
          code: "unSupportedRequestType",
        });
        return;
    }
    if (data?.data && data?.isError == false) {
      res.status(200).json(data);
      return;
    } else {
      res.status(400).json(data);
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

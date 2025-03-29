import type { NextApiRequest, NextApiResponse } from "next";
import { logger } from "@/lib/logger";
import { GetErrorMessage } from "@/lib/errors";
import { actionBB23Post } from "@/shared/shared_actions";
import { $Res } from "@/shared/shared_classes";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    let data: $Res | undefined;
    const { action } =
      req.method === "GET" || req.method === "DELETE"
        ? (req.query as any)
        : (req.body as any);
    switch (req.method) {
      case "POST":
        data = await actionBB23Post({ action, body: req.body, res, req });
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

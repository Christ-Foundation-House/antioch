import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { GetErrorMessage } from "@/lib/errors";
// import { wicf_member, wicf_member_worship } from "@prisma/client";
import {
  type$Res,
  // type$Res
} from "@/shared/shared_classes";
import {
  actionFormAcademicSummit,
  actionFormFeedback,
  actionFormPrayerRequest,
  actionFormSummerfest,
  actionFormWorkersTraining,
} from "@/shared/shared_actions";
import {
  wicf_form_academic_summit,
  wicf_form_feedback,
  wicf_form_summerfest,
  wicf_form_workers_training,
  wicf_prayer_request,
} from "@prisma/client";
import { k } from "../manage/check-credentials";
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
  const body = {
    ...req.body,
  };
  const form = body.form ?? null;
  if (
    !body.form
    // !body.first_name ||
    // !body.last_name ||
    // !body.nationality ||
    // !body.phone_number ||
    // !body.passport_number ||
    // !body.passport_expiry_date
  ) {
    res.status(400).json({
      isError: true,
      message: "Please Provide all required fields",
      data: null,
      code: null,
    });
    return;
  }
  logger.debug(`submitting ${form} form`, {
    body,
  });
  delete body.form;
  let result: type$Res | null = null;
  switch (form) {
    case "summerfest":
      result = await actionFormSummerfest(body);
      break;
    case "academic_summit":
      result = await actionFormAcademicSummit(body);
      break;
    case "workers_training":
      result = await actionFormWorkersTraining(body);
      break;
    case "feedback":
      result = await actionFormFeedback({ body, res, req, action: "form" });
      break;
    case "prayer_request":
      result = await actionFormPrayerRequest({
        body,
        res,
        req,
        action: "form",
      });
      break;
    default:
      console.log("form not found");
      res.status(400).json({
        isError: true,
        message: "Form does not exist",
        data: null,
        code: null,
      });
  }
  if (result?.data) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
}

async function handleGET(res, req) {
  interface resErrorArgs {
    message?: string;
    code?: string;
    error?: any;
    status?: number;
  }
  const resError = ({ message, code, error, status }: resErrorArgs) => {
    res.status(status ?? 500).json({
      isError: true,
      message: message ?? getErrorMessage(error.code ?? code ?? null, error),
      data: null,
      code: error?.code ?? null,
    });
  };
  try {
    if (req.query.k !== k) {
      resError({ message: "Not authorized to get form data", status: 401 });
    }
    const form = req.query.form;
    if (!form) resError({ message: "Please provide the form name" });
    logger.debug(`Getting ${form} Entries`);
    switch (form) {
      case "summerfest":
        let entries: wicf_form_summerfest[] | null = null;
        entries = await prisma.wicf_form_summerfest.findMany();
        res.json({
          isError: false,
          message: `Successfully found entries`,
          data: entries,
          code: null,
        });
        break;
      case "academic_summit":
        let academic_summit: wicf_form_academic_summit[] | null = null;
        academic_summit = await prisma.wicf_form_academic_summit.findMany();
        res.json({
          isError: false,
          message: `Successfully found entries`,
          data: academic_summit,
          code: null,
        });
        break;
      case "workers_training":
        let workers_training: wicf_form_workers_training[] | null = null;
        workers_training = await prisma.wicf_form_workers_training.findMany();
        res.json({
          isError: false,
          message: `Successfully found entries`,
          data: workers_training,
          code: null,
        });
        break;
      case "feedback":
        let feedback: wicf_form_feedback[] | null = null;
        feedback = await prisma.wicf_form_feedback.findMany({
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                phone_number: true,
                wicf_member: {
                  select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                  },
                },
              },
            },
          },
        });
        res.json({
          isError: false,
          message: `Successfully found entries`,
          data: feedback.reverse(),
          code: null,
        });
        break;
      case "prayer_request":
        let prayer_request: wicf_prayer_request[] | null = null;
        prayer_request = await prisma.wicf_prayer_request.findMany({
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                phone_number: true,
                wicf_member: {
                  select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                  },
                },
              },
            },
          },
        });
        res.json({
          isError: false,
          message: `Successfully found entries`,
          data: prayer_request.reverse(),
          code: null,
        });
        break;
      default:
        resError({ message: "Form requested does not exist" });
    }
  } catch (error) {
    logger.error(error);
    resError({ error });
  }
}

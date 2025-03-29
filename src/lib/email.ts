import { env } from "@/env";
import nodemailer from "nodemailer";
import prisma from "./prisma";
// import { env } from "~/env";

export interface TypeSendEmail {
  // from?: string,
  to: string;
  subject: string;
  text: string;
  html?: string;
  returnResponseOrError?: boolean;
  is_from_api?: boolean; // email not send from backend but from an API Call possibly by user
}
export async function emailSend(args: TypeSendEmail) {
  const mailOptions: TypeSendEmail & {
    from: { name: string; address: string };
  } = {
    from: {
      name: process.env.EMAIL_SERVER_FROM_NAME ?? "WICF SYSTEM",
      address:
        process.env.EMAIL_SERVER_FROM ?? "no-reply@maravianwebservices.com",
    },
    to: args.to,
    subject: args.subject,
    text: args.text,
    html: args.html ?? `<b>${args.text}</b>`,
  };
  try {
    const transporter = await nodemailer.createTransport({
      name: "WICF SYSTEM",
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      tls: {
        // servername: "mail.maravianwebservices.com",
        rejectUnauthorized: env.NODE_ENV === "development" ? false : true,
      },
    });

    const info = await transporter.sendMail(mailOptions);
    // console.log(info);
    // console.log(`Message sent: ${info.messageId}`);
    const { to, subject, text, html } = args;
    if (info.accepted) {
      // !args.is_from_api &&
      await prisma.emails_sent.create({
        data: { to, subject, text, html, is_successful: true },
      });
      return args.returnResponseOrError ? info : true;
    }
    await prisma.emails_sent.create({
      data: { to, subject, text, html, is_successful: false },
    });
    throw new Error(`Email failed to send to: ${to}, subject:${subject}`);
  } catch (error) {
    console.error(error);
    const { to, subject, text, html } = args;
    // !args.is_from_api &&
    await prisma.emails_sent.create({
      data: {
        to,
        subject,
        text,
        html,
        is_successful: false,
        error: error.message ?? JSON.stringify(error) ?? "",
      },
    });
    return args.returnResponseOrError ? error : false;
  }
}

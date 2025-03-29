import NextAuth, { AuthOptions, getServerSession } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
import prisma from "@/lib/prisma";
import { actionUserGet } from "@/shared/shared_actions";
import EmailProvider from "next-auth/providers/email";
import { emailSend } from "@/lib/email";
import { db } from "@/server/db";
import { GetServerSidePropsContext } from "next";
import { env } from "@/env";
import { TypeSession } from "@/shared/shared_types";
import { permissionReturnRoutesAllowed } from "@/utils/permission";
// import { authOptions } from "@/server/auth";
// import { emailSend } from "@/utils/email";

export const authOptions: AuthOptions = {
  callbacks: {
    // async jwt({ token, user, account }) {
    //   console.log({
    //     name: "jwt",
    //     token,
    //     user,
    //     account,
    //   });
    //   return token;
    // },
    async signIn({
      user,
      account,
      // profile,
      // email,
      // credentials
    }) {
      try {
        // if (account) {
        if (true) {
          const roleBasic = await prisma.role.findFirst({
            where: {
              name: "basic",
            },
          });
          if (!roleBasic) {
            await prisma.role.create({
              data: {
                name: "basic",
                label: "Basic",
              },
            });
          }
          console.log("nextauth-user", user, account);
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              roles: {
                connect: {
                  name: "basic",
                },
              },
            },
          });
        }
      } catch (e) {
        console.error(e);
      }
      return true;
    },
    async session({
      session,
      token,
      // user
    }) {
      // const { email } = session.user;
      const email = session.user?.email ?? token?.email;
      if (!email) return { ...session };
      const res = await actionUserGet({
        email,
      });
      const userData = res.data as TypeSession["user"];
      const routes_allowed = await permissionReturnRoutesAllowed(
        userData?.roles,
      );
      session.user = { ...userData, routes_allowed } as any;
      return { ...session };
    },
  },
  // debug: true,
  // database: process.env.DATABASE_URL,
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    // signIn: env.NEXTAUTH_URL + "/sign-in",
    // error: env.NEXTAUTH_URL + "/sign-in",
    signIn: "/sign-in",
    error: "/sign-in",
    verifyRequest: "/verify",
    // signOut: "/auth/signout",
  },
  // site: process.env.NEXTAUTH_URL,
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_SERVER_FROM,
      async sendVerificationRequest(params) {
        const { identifier, url, provider, theme } = params;
        const { host } = new URL(url);
        const result = await emailSend({
          to: identifier,
          subject: `Sign in to ${host}`,
          text: text({ url, host }),
          html: html({ url, host, theme }),
          returnResponseOrError: true,
        });
        const failed = result.rejected.concat(result.pending).filter(Boolean);
        if (failed.length) {
          throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
        }
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      id: "credentials",
      name: "credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: {
          label: "email",
          type: "email",
          placeholder: "",
          required: true,
          value: "admin@hivemaster.com",
        },
        password: {
          label: "Password",
          type: "password",
          required: true,
        },
      },
      authorize: async (
        credentials,
        // req
      ) => {
        try {
          const response = await fetch(
            `${process.env.NEXTAUTH_URL}/api/user/check-credentials`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
              },
              body: Object.entries(credentials ?? {})
                .map(
                  ([key, value]) =>
                    `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
                )
                .join("&"),
            },
          );

          const authRes = await response.json();

          if (response.ok && authRes?.data?.user) {
            const user = authRes.data.user;
            console.log("nextauth-user-credentials", user);
            return user;
          } else {
            console.error("Authentication failed:", authRes);
            throw new Error(authRes?.code ?? "Authentication failed");
          }
        } catch (err) {
          console.error("Error in authorization:", err);
          return null;
        }
      },
    }),
  ],
  // jwt: {
  //   signingKey: process.env.JWT_SIGNING_PRIVATE_KEY,
  // },
};
export default NextAuth(authOptions);

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

function html(params) {
  const { url, host, theme } = params;

  const escapedHost = host.replace(/\./g, "&#8203;.");

  const brandColor = theme.brandColor || "#346df1";
  const color = {
    background: "#f9f9f9",
    text: "#444",
    mainBackground: "#fff",
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText: theme.buttonText || "#fff",
  };

  return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Sign in to <strong>${escapedHost}</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
                in</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`;
}

/** Email Text body (fallback for email clients that don't render HTML, e.g. feature phones) */
function text({ url, host }) {
  return `Sign in to ${host}\n${url}\n\n`;
}

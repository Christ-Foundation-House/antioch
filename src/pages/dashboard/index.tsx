/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useSession } from "next-auth/react";
import { LayoutDashboard } from "@/layouts/layoutDashboard";
import { Typography } from "antd";
// import Image from "next/image";
// import { permissionReturnRedirectionOrProps } from "@/utils/permission";
// import { TypeSession } from "@/shared/shared_types";

// export async function getServerSideProps(context) {
//   const session = await getSession(context);
//   // console.log(session);
//   if (!session) {
//     return {
//       redirect: {
//         destination: "/sign-in",
//         permanent: false,
//       },
//     };
//   }
//   return {
//     props: { session: "sdsds" },
//   };
// }

// export async function getServerSideProps(context) {
//   return permissionReturnRedirectionOrProps({
//     session: (await getSession(context.res)) as TypeSession | null,
//     routeUrl: "/dashboard",
//     notAllowedUrl: "/403",
//   });
// }
export default function Page() {
  const { data: session } = useSession();
  return (
    <LayoutDashboard title="Dashboard">
      <div
        css={css`
          // flex-grow: 1;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        `}
      >
        {session ? (
          // <span css={css``}>{JSON.stringify(session)}</span>
          <>
            <img
              src={
                "https://maravianwebservices.com/images/wicf/assets/logo2.png"
              }
              alt="WICF Logo"
              width={150}
              height={150}
              css={css`
                padding: 0px;
                margin: 0px;
                background-size: contain;
              `}
            />
            <Typography.Title level={3}>
              Welcome to the WICF Dashboard {session?.user?.name}
            </Typography.Title>
          </>
        ) : (
          <span>You are NOT logged in!</span>
        )}
      </div>
    </LayoutDashboard>
  );
}

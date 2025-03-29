import Info from "@/components/Info";
import { logger } from "@/lib/logger";
import { GETLocation } from "@/requests";
import { TypeLocation, TypeSession } from "@/shared/shared_types";
import { permissionReturnRedirectionOrProps } from "@/utils/permission";
import { Button, Typography } from "antd";
import moment from "moment";
import { getSession } from "next-auth/react";
// import Image from "next/image";
import Link from "next/link";
// import { useEffect } from "react";

export async function getServerSideProps(context) {
  let location: TypeLocation | undefined = undefined;
  await GETLocation()
    .then((res) => {
      location = res as TypeLocation;
    })
    .catch((error) => {
      logger.error(error);
    });
  return permissionReturnRedirectionOrProps({
    session: (await getSession(context.res)) as TypeSession | null,
    routeUrl: context.resolvedUrl,
    notAuthenticatedUrl: "/403?code=location_auth_required",
    // notAllowedUrl: "/403?code=verification_required",
    permissionType: "verification_required",
    props: {
      location,
    },
  });
}
interface PageProps {
  location?: TypeLocation;
}
export default function Page(props: PageProps) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url("https://maravianwebservices.com/images/wicf/assets/invite1.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundBlendMode: "color-burn",
          backdropFilter: "revert",
          opacity: 0.03,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          width: "100%",
          maxWidth: "420px",
          padding: "20px 5px",
          height: "fit-content",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          backgroundBlendMode: "luminosity",
          filter: `blur(1)`,
          textAlign: "center",
        }}
      >
        <img
          alt="logo"
          src="https://maravianwebservices.com/images/wicf/assets/logo2.png"
          width={150}
          height={150}
        />
        <Typography.Title level={1}>{props.location?.title}</Typography.Title>
        <Info label="Location" value={props.location?.location} />
        <br />
        <Info label="Time" value={props.location?.time} />
        <Info
          label="Last updated"
          isCopyable={false}
          value={
            moment(props.location?.last_updated)
              .add(8, "hour")
              .toISOString()
              .split(".")[0]
          }
        />
        <br />
        <Link href={`/live`} passHref>
          <Button ghost>JOIN US LIVE</Button>
        </Link>
      </div>
    </div>
  );
}

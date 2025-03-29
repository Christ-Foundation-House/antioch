import { routing_permission_type } from "@/utils/permission";
import { Button } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
// import Image from "next/image";

export default function Page(props: { code?: string }) {
  const router = useRouter();
  const { query } = router;
  const Message = () => {
    const code: routing_permission_type | undefined =
      (props.code as routing_permission_type | undefined) ??
      (query.code as routing_permission_type | undefined);
    switch (code) {
      case "verification_required":
        return (
          <>
            <span>You need to be verified to see the current location</span>
            <Link
              href={`/report?url=/403?code=verification_required&type=appeal&title=Request+for+verification`}
            >
              <Button>Request for verification</Button>
            </Link>
          </>
        );
      case "membership_required":
        return (
          <>
            <span>
              You need to be a wcif member to see the current location
            </span>
            <Link href={`/dashboard/account#settings`}>
              <Button>Go to your account to join wicf</Button>
            </Link>
          </>
        );
      case "location_auth_required":
        return (
          <>
            <span>You need to log in to view the page</span>
            <Link href={`/sign-in`}>
              <Button>Login</Button>
            </Link>
          </>
        );
      case "live":
        return <span>You are not authorized to change live contact admin</span>;
      case "leaders_only":
        return <span>You need leaders permission to can access this page</span>;
      default:
        return <span>You are not authorized to access this page</span>;
    }
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      <img
        src={"https://maravianwebservices.com/images/wicf/assets/logo2.png"}
        alt="WICF Logo"
        width={120}
        height={120}
        style={{
          padding: 0,
          margin: 0,
          backgroundSize: "contain",
        }}
      />
      <Message />
    </div>
  );
}

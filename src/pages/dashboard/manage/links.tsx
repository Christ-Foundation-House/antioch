import LayoutDashboard from "@/layouts/layoutDashboard";
import { MembershipAnalytics } from "@/components/component/MembershipAnalytics";
import { permissionReturnRedirectionOrProps } from "@/utils/permission";
import { getSession } from "next-auth/react";
import { TypeSession } from "@/shared/shared_types";
import { LinkManager } from "@/components/LinkManager";

export default function page() {
  return (
    <LayoutDashboard title={"Link Management"}>
      <LinkManager />
    </LayoutDashboard>
  );
}

export async function getServerSideProps(context) {
  return permissionReturnRedirectionOrProps({
    session: (await getSession(context.res)) as TypeSession | null,
    routeUrl: context.resolvedUrl,
  });
}

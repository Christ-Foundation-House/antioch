import LayoutDashboard from "@/layouts/layoutDashboard";
import { permissionReturnRedirectionOrProps } from "@/utils/permission";
import { getSession } from "next-auth/react";
import { TypeSession } from "@/shared/shared_types";
import React from "react";
import { ReportManagement } from "@/components/report-management";

export default function page() {
  return (
    <LayoutDashboard title={"Report Management"}>
      <ReportManagement />
    </LayoutDashboard>
  );
}

export async function getServerSideProps(context) {
  return permissionReturnRedirectionOrProps({
    session: (await getSession(context.res)) as TypeSession | null,
    routeUrl: context.resolvedUrl,
  });
}

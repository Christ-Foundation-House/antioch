// import { PrayerManagment } from "@/components/component/prayer-managment";
import { PrayerManagement2 } from "@/components/component/prayer-management2";
import LayoutDashboard from "@/layouts/layoutDashboard";
import { TypeSession } from "@/shared/shared_types";
import { permissionReturnRedirectionOrProps } from "@/utils/permission";
import { getSession } from "next-auth/react";
import { ReactElement } from "react";

function Page() {
  return (
    <LayoutDashboard title={"Prayer Requests"}>
      <PrayerManagement2 />
    </LayoutDashboard>
  );
}

// Page.getLayout = function getLayout(page: ReactElement) {
//   return <LayoutDashboard title={"Prayer Requests"}>{page}</LayoutDashboard>;
// };

export async function getServerSideProps(context) {
  return permissionReturnRedirectionOrProps({
    session: (await getSession(context.res)) as TypeSession | null,
    routeUrl: context.resolvedUrl,
  });
}

export default Page;

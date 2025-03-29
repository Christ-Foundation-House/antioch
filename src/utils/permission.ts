import { TypeSession } from "@/shared/shared_types";
import { storageWriteItem } from "./localStorage";
export const GLOBAL_ADMIN_ROLE_NAME = "admin";

export type routing_permission_type =
  | "verification_required"
  | "membership_required"
  | "location_auth_required"
  | "live"
  | "leaders_only";
export const GLOBAL_ROLES = {
  admin: {
    name: "admin",
    label: "Admin",
  },
  basic: {
    name: "basic",
    label: "Basic",
  },
  leaders: {
    name: "leaders",
    label: "Leaders",
  },
};
export function permissionGet({
  session,
  routeUrl,
}: // checkIsPhotosAdmin,
{
  session: TypeSession | null;
  routeUrl: string;
  // checkIsPhotosAdmin?: boolean;
}): {
  session: TypeSession | null;
  isAuthenticated: boolean;
  isRouteAllowed: boolean;
  isPhotosAdmin: boolean;
  routeUrl: string | null;
  isAdmin: boolean;
  isBanned: boolean;
  isVerified: boolean;
  isLeader?: boolean;
  routesAllowed?: string[];
} {
  if (!session || !routeUrl) {
    return {
      session: null,
      isAuthenticated: false,
      isRouteAllowed: false,
      isPhotosAdmin: false,
      routeUrl: null,
      isAdmin: false,
      isBanned: false,
      isVerified: false,
      isLeader: false,
    };
  }
  let isRouteAllowed = false;
  let isPhotosAdmin = false;
  let isAdmin = false;
  let isBanned = false;
  let isVerified = false;
  let isLeader = false;
  session?.user?.roles?.map((role) => {
    role.routes.map((route) => {
      if (routeUrl === route.url) {
        isRouteAllowed = true;
        // return;
      }
      if (role.name === "leaders") isLeader = true;
    });
    // console.log("role", role.photos);
    if (role.photos_info.length > 0) isPhotosAdmin = true;
    if (role.name === GLOBAL_ADMIN_ROLE_NAME) isAdmin = true;
  });
  const routesAllowed = permissionReturnRoutesAllowed(session.user.roles);
  if (session.user?.is_banned) isBanned = true;
  if (session.user?.is_verified) isVerified = true;
  return {
    session,
    isAuthenticated: true,
    isRouteAllowed,
    routeUrl,
    isPhotosAdmin,
    isAdmin,
    isBanned,
    isVerified,
    isLeader,
    routesAllowed,
  };
}
export function permissionReturnRedirectionOrProps({
  session,
  routeUrl,
  props,
  notAuthenticatedUrl,
  notAllowedUrl,
  noRedirect,
  permissionType,
}: {
  session: TypeSession | null;
  routeUrl: string;
  props?: any;
  notAuthenticatedUrl?: string;
  notAllowedUrl?: string;
  noRedirect?: boolean;
  permissionType?: routing_permission_type;
}) {
  const permissions = permissionGet({ session, routeUrl });
  const returnAuthorized = {
    props: { ...props, permissions },
  };
  // IF AUTH=FALSE, URL_ALLOWED=FALSE
  if (!permissions.isAuthenticated && noRedirect !== true)
    return {
      redirect: {
        destination: notAuthenticatedUrl ?? "/sign-in",
        permanent: false,
      },
    };
  // IF AUTH=TRUE, URL_ALLOWED=FALSE
  if (permissions.isAdmin) noRedirect = true;
  if (permissions.isBanned && noRedirect !== true) {
    return {
      redirect: {
        destination: "/banned",
        permanent: false,
      },
    };
  }
  if (
    permissions.isAuthenticated &&
    !permissions.isRouteAllowed &&
    noRedirect !== true
  )
    switch (permissionType) {
      case "verification_required":
        return permissions.isVerified
          ? returnAuthorized
          : {
              redirect: {
                destination: notAllowedUrl ?? "/403?code=verification_required",
                permanent: false,
              },
            };
      case "leaders_only":
        return permissions.isLeader
          ? returnAuthorized
          : {
              redirect: {
                destination: notAllowedUrl ?? "/403?code=leaders_only",
                permanent: false,
              },
            };
      default:
        return {
          redirect: {
            destination: notAllowedUrl ?? "/dashboard/403",
            permanent: false,
          },
        };
    }
  // IF AUTH=FALSE, URL_ALLOWED=TRUE
  // console.log({ permissions, props });
  return returnAuthorized;
}

export function permissionReturnRoutesAllowed(
  roles: TypeSession["user"]["roles"],
) {
  const allowedRoutes: string[] = [];
  roles?.map((role) => {
    role.routes.map((route) => {
      allowedRoutes.push(route.url);
    });
  });
  return allowedRoutes;
}

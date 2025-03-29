// import prisma from "@/lib/prisma";
import { $Res } from "@/shared/shared_classes";
import {
  ReqRoleAddRemoveRoute,
  ReqRoleDeleteUser,
  TypeBBTeam,
  TypeBBUser,
  TypeLiveData,
  TypeLiveStream,
  TypeLocation,
  TypePhotosAlbum,
  TypeRole,
  TypeRoute,
  TypeSession,
} from "@/shared/shared_types";
import { photos_info, photos_album } from "@prisma/client";
import axios, { AxiosRequestConfig } from "axios";

const RequestGenerate = (config?: AxiosRequestConfig) => {
  const instance = axios.create(config);
  return instance;
};

export const Request = RequestGenerate({ baseURL: process.env.NEXTAUTH_URL });

export const GETLiveList = async () => {
  interface Res extends $Res {
    data: TypeLiveData[];
  }
  const res = await Request.get<Res>("/api/live", {
    params: { action: "streams_get" },
  });
  return res.data;
};

export const GETLiveStream = async () => {
  interface Res extends $Res {
    data: TypeLiveStream;
  }
  const res = await Request.get<Res>("/api/live", {
    params: { action: "live_get" },
  });
  return res.data;
};

export const GETLocation = async () => {
  interface Res extends $Res {
    data: TypeLocation;
  }
  const res = await Request.get<Res>("/api/live", {
    params: { action: "location_get" },
  });
  return res.data.data;
};

export const GETRoutes = async () => {
  interface Res extends $Res {
    data: TypeRoute[];
  }
  const res = await Request.get<Res>("/api/admin?action=routes_get", {
    // params: { action: "routes_get" },
  });
  const data_ = res.data.data;
  const data: TypeRoute[] = data_.reverse();
  return data;
};

export const GETRoles = async () => {
  interface Res extends $Res {
    data: TypeRole[];
  }
  const res = await Request.get<Res>("/api/admin", {
    params: { action: "roles_get" },
  });
  return res.data.data;
};

export const GETUsers = async () => {
  interface Res extends $Res {
    data: TypeSession["user"][];
  }
  const res = await Request.get<Res>("/api/admin", {
    params: { action: "users_get" },
  });
  return res.data.data;
};

export const PATCHroleAddRemoveRoute = async (
  params: ReqRoleAddRemoveRoute,
) => {
  interface Res extends $Res {
    data: TypeRole;
  }
  const res = await Request.patch<Res>("/api/admin", {
    ...params,
  });
  return res.data;
};

export const DELETEroleDeleteUser = async (params: ReqRoleDeleteUser) => {
  interface Res extends $Res {
    data: TypeRole;
  }
  const res = await Request.delete<Res>("/api/admin", {
    params,
  });
  return res.data;
};
// export const PATCHroleDeleteRoute = async (body: ReqRoleAddRemoveRoute) => {
//   interface Res extends $Res {
//     data: TypeRole;
//   }
//   const res = await Request.patch<Res>("/api/admin", {
//     params: { action: "role_delete_route" },
//   });
//   return res.data.data;
// };

export const POST_bb23_users_get = async (params: {
  onlyIsSortable?: boolean;
}) => {
  interface Res extends $Res {
    data: TypeBBUser[];
  }
  const res = await Request.post<Res>("/api/wicf/bb23", {
    action: "bb23_users_get",
    ...params,
  });
  return res.data.data;
};

export const POST_bb23_teams_get = async () => {
  interface Res extends $Res {
    data: TypeBBTeam[];
  }
  const res = await Request.post<Res>("/api/wicf/bb23", {
    action: "bb23_teams_get",
  });
  return res.data.data;
};

export const POST_bb23_questions_get = async () => {
  interface Res extends $Res {
    data: TypeBBTeam[];
  }
  const res = await Request.post<Res>("/api/wicf/bb23", {
    action: "bb23_questions_get",
  });
  return res.data.data;
};

export const POST_bb23_user_set_sortable = async (params: {
  user_id: number;
  is_sortable?: boolean;
}) => {
  interface Res extends $Res {
    data: TypeBBUser;
  }
  const res = await Request.post<Res>("/api/wicf/bb23", {
    action: "bb23_user_set_sortable",
    ...params,
  });
  return res.data.data;
};

export const POST_bb23_teams_set_members = async (params: {
  team_id: number;
  members_id_array: number[];
}) => {
  interface Res extends $Res {
    data: TypeBBTeam;
  }
  const res = await Request.post<Res>("/api/wicf/bb23", {
    action: "bb23_teams_set_members",
    ...params,
  });
  return res.data.data;
};

export const POST_photos_albums_get = async () => {
  interface Res extends $Res {
    data: TypePhotosAlbum[];
  }
  const res = await Request.post<Res>("/api/photos", {
    action: "photos_albums_get",
  });
  return res.data.data;
};

export const POST_photos_album_get = async (args: {
  id?: number;
  album_key?: string;
  timeout?: number;
}) => {
  console.log({ args });
  interface Res extends $Res {
    data: TypePhotosAlbum;
  }
  const res = await Request.post<Res>(
    "/api/photos",
    {
      action: "photos_album_get",
      id: args.id,
      album_key: args.album_key,
    },
    { timeout: args.timeout },
  );
  return res.data.data;
};

export const POST_photos_info = async () => {
  interface Res extends $Res {
    data: photos_info;
  }
  const res = await Request.post<Res>("/api/photos", {
    action: "photos_info",
  });
  return res.data.data;
};

export const POST_photos_source_update = async () => {
  interface Res extends $Res {
    message: string;
    data: photos_album[];
  }
  const res = await Request.post<Res>("/api/photos", {
    action: "photos_source_update",
  });
  return res.data.data;
};

export const POST_photos_album_public_toggle = async (args: {
  is_public: boolean;
  album_key: string;
}) => {
  interface Res extends $Res {
    message: string;
    data: [];
  }
  const res = args.is_public
    ? await Request.post<Res>("/api/photos", {
        action: "photos_album_public",
        album_key: args.album_key,
      })
    : await Request.post<Res>("/api/photos", {
        action: "photos_album_hide",
        album_key: args.album_key,
      });
  return res.data.data;
};

export const POST_photos_album_views_add = async (args: {
  album_key: string;
}) => {
  interface Res extends $Res {
    message: string;
    data: [];
  }
  const res = await Request.post<Res>("/api/photos", {
    action: "photos_album_view_add",
    album_key: args.album_key,
  });
  return res.data.data;
};

export const POST_photos_album_hidden_images_set = async (args: {
  album_key: string;
  image_url_array_hidden: string[];
}) => {
  interface Res extends $Res {
    message: string;
    data: [];
  }
  const res = await Request.post<Res>("/api/photos", {
    action: "photos_album_hidden_images_set",
    album_key: args.album_key,
    image_url_array_hidden: JSON.stringify(args.image_url_array_hidden),
  });
  return res.data.data;
};

export const POST_photos_album_set_thumbnail = async (args: {
  album_key: string;
  image_url: string;
}) => {
  interface Res extends $Res {
    message: string;
    data: [];
  }
  const res = await Request.post<Res>("/api/photos", {
    action: "photos_album_set_thumbnail",
    album_key: args.album_key,
    thumbnail_url: args.image_url,
  });
  return res.data.data;
};

import { photos_album, photos_info, role, wicf_member } from "@prisma/client";
import dayjs from "dayjs";

export interface typeSharedFilters {
  text: string;
  value: string;
}

export interface typeSharedOptions {
  label: string;
  value: string;
}

export type TypeLiveDataLinks = "youtube" | "fcc" | "zoom";
export interface TypeLiveData {
  id?: number;
  title?: string;
  description?: string;
  status?: "pre_live" | "live" | "waiting_live" | "post_live";
  views?: string;
  password?: string;
  online?: string;
  start_time?: string;
  end_time?: string;
  notice?: string;
  links?: {
    youtube?: {
      url: string;
    };
    fcc?: {
      code: string;
      password: string;
    };
    zoom?: {
      code: string;
      password: string;
      url?: string;
    };
  };
}

export type TypeStorageItem =
  | "live-username"
  | "routes_allowed"
  | "prayer_submit_show"
  | "password"
  | "remember"
  | "phone_number";

export interface TypeDatesState {
  [key: string]: dayjs.Dayjs | null;
}
export interface TypeBoolState {
  [key: string]: boolean | null;
}
export interface TypeSessionRoute {
  id: number;
  name: string;
  url: string;
}
export interface TypeSessionRole {
  id: number;
  name: string;
  label: string;
  routes: TypeSessionRoute[];
  photos_info: photos_info & { admin_roles?: role[] }[];
}

export interface TypeSessionWicf {
  id: number;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

export interface TypeSession {
  user: {
    id: string;
    // wicf_member_id: string;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    emailVerified?: string;
    phone_number?: string;
    phone_number_verified?: string;
    image?: string;
    roles?: TypeSessionRole[];
    // wicf_member?: TypeSessionWicf;
    wicf_member?: wicf_member;
    routes_allowed?: string[];
    is_verified?: Boolean;
    is_banned?: Boolean;
  };
  expires: string;
}

export type TypeFetchMethods = "GET" | "POST" | "PATCH";

export interface TypeLiveStream {
  id: number;
  stream_id?: number;
  date?: Date;
  stream?: TypeLiveData;
}

export interface TypeLocation {
  id: number;
  title: string;
  location: string;
  time: string;
  user_id: string;
  last_updated: string;
}

export interface TypeRoute {
  id: number;
  url: string;
}

export interface TypeRole {
  id: number;
  name: string;
  label: string;
  users?: TypeSession["user"][];
  routes?: TypeRoute[];
}

export interface ReqRoleAddRemoveRoute {
  action: "role_add_route" | "role_delete_route";
  role: TypeRole;
  route: TypeRoute;
}

export interface ReqRoleDeleteUser {
  action: "role_delete_user";
  role_id: TypeRole["id"];
  user_id: TypeSession["user"]["id"];
}

export type TypeErrorCode =
  | "e1"
  | "e2"
  | "e3"
  | "e4"
  | "login_require"
  | "unSupportedRequestType"
  | "signInFailed"
  | "OAuthAccountNotLinked"
  | "CredentialsSignin"
  | "CredentialsSignup"
  | "P1000"
  | "P1001"
  | "P2002"
  | "P2003"
  | "P2025"
  | "P2024"
  | "noAuth"
  | "noMembers"
  | "membersNotFound"
  | "noMinistry"
  | "live-no-action"
  | "live-no-get-action"
  | "live-no-post-action"
  | "action_no_result"
  | "action_error"
  | "invalid_params"
  | "role_no_basic"
  | "EmailSignin"
  | "general"
  | "account_no_membership";

export interface TypeBBUser {
  id: number;
  first_name: string;
  last_name?: string;
  is_sortable?: boolean;
  institution?: string;
  bb_team_id: number | null;
  bb_team: TypeBBTeam | null;
}

export interface TypeBBTeam {
  id: number;
  name: string;
  password: string;
  color_hex: string;
  members: TypeBBUser[];
  bb_questions?: TypeBBQuestion[];
}

export interface TypeBBQuestion {
  id: number;
  question: string;
  answer: string;
  bb_teamId?: number;
  bb_team?: TypeBBTeam;
}
export interface TypeImagesFetch {}

export interface TypeAlbumRaw {
  image_count: number;
  thumbnail_count: number;
  image_urls: string[];
  thumbnail_urls: string[];
}

export interface TypeAlbumRawFolders {
  [album_key: string]: TypeAlbumRaw;
}
export interface TypeImageObject {
  image_url: string;
  thumbnail_url?: string;
}
export type TypePhotosAlbum = Omit<photos_album, "image_object"> & {
  image_object_array?: TypeImageObject[];
  image_url_array: string[];
  image_url_array_hidden: string[];
  image_url_array_dont_thumbnail: string[];
  thumbnail_url_array: string[];
};
export interface TypeAlbums {
  [album_key: string]: TypePhotosAlbum;
}

export interface TypeFormValuesChanged {
  changedValues?: any;
  allValues?: any;
  values: any;
  form_name: string;
}

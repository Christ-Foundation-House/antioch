import { wicf_member, wicf_member_worship } from "@prisma/client";
import { TypeErrorCode } from "./shared_types";
export interface type$Res {
  isError: boolean;
  message: string;
  data?: any;
  code?: number | null | string | TypeErrorCode;
}
export class $Res implements type$Res {
  isError: boolean;
  message: string;
  data: any;
  code?: type$Res["code"];
  constructor({ isError, message, data, code }: type$Res) {
    this.isError = isError ?? null;
    this.message = message ?? null;
    this.data = data ?? null;
    this.code = code ?? null;
  }
}

export interface type$WicfUser {
  user: wicf_member;
  worship?: wicf_member_worship | null;
}
export class $WicfUser {
  user: wicf_member;
  user_ministries: {
    worship?: wicf_member_worship;
  };
  constructor({ user, worship }: type$WicfUser) {
    this.user = user;
    this.user_ministries = {};
    if (worship) {
      this.user_ministries.worship = worship;
    }
  }
}

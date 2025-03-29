/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import LayoutDashboard from "@/layouts/layoutDashboard";
import { Card, Avatar, Form } from "antd";
import { getSession, useSession } from "next-auth/react";
import { shared_countries_options } from "@/shared/shared_countries";
import { shared_marital_status } from "@/shared/shared_marital_status";
import { DeviceScreen } from "@/styles/theme";
import { SettingsChange } from "@/components/SettingsChange";
import { useEffect } from "react";
// import { actionUserGet, sessionUserType } from "@/shared/shared_actions";
import { permissionReturnRedirectionOrProps } from "@/utils/permission";
import { TypeSession } from "@/shared/shared_types";
import { toast } from "react-toastify";
import UserProfilePicture from "@/components/UserProfilePicture";
export const dateFormat = "YYYY-MM-DD";

interface ProfileAvatarProps {
  name?: string | null;
  image?: string | null;
  email?: string | null;
}
function ProfileAvatar(props: ProfileAvatarProps) {
  // const { data: session } = useSession();
  return (
    <Card
      bordered={false}
      css={css`
        background-color: transparent;
        width: 100%;
        padding: 0px;
      `}
      bodyStyle={{ border: "0px", padding: 10 }}
    >
      <Avatar.Group
        css={css`
          width: 100%;
          display: flex;
          // flex-direction: row-reverse;
          gap: 20px;
          padding-bottom: 10px;
          ${DeviceScreen.mobile} {
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
        `}
      >
        {/* <Avatar size={74} shape="circle" src={props.image} css={css``} /> */}
        <UserProfilePicture src={props.image ?? undefined} />
        <div
          css={css`
            width: fit-content;
            ${DeviceScreen.mobile} {
              text-align: center;
            }
          `}
        >
          <h2>{props.name}</h2>
          <p>{props.email}</p>
        </div>
      </Avatar.Group>
    </Card>
  );
}

export async function getServerSideProps(context) {
  return permissionReturnRedirectionOrProps({
    session: (await getSession(context.res)) as TypeSession | null,
    routeUrl: context.resolvedUrl,
  });
}

function Page({}) {
  const { data: session, update } = useSession();
  // const user = session?.user as sessionUserType;
  const user = session?.user as TypeSession["user"];
  const [form_profile] = Form.useForm();
  const [form_password] = Form.useForm();
  const [form_wicf] = Form.useForm();
  useEffect(() => {
    // console.log("SESSION", session);
    // console.log("userData", userData);
  }, [user]);
  return (
    <LayoutDashboard title="Account">
      <ProfileAvatar {...user} />
      <SettingsChange
        form={form_profile}
        // isEditable={false}
        name={"profile"}
        title={"Profile"}
        initialData={{ ...user, action: "user_change" }}
        // getData={{
        //   getDataKeys: ["data"],
        //   getDataUrl: `/api/user?email=${user?.email}`,
        //   getDataThen(data) {
        //     console.log("getDataThen", data);
        //   },
        // }}
        properties={[
          {
            name: "id",
            title: "Id",
            type: "string",
            isRequired: true,
            isHidden: true,
          },
          {
            name: "action",
            title: "action",
            type: "string",
            isRequired: true,
            isHidden: true,
            isEditable: false,
            forceValue: "user_change",
          },
          {
            name: "name",
            title: "Username",
            type: "string",
            isRequired: true,
          },
          {
            name: "email",
            title: `Email`,
            type: "email",
            isRequired: true,
            // isEditable: false,
          },
          { name: "phone_number", title: "PhoneNumber", type: "phoneNumber" },
        ]}
        onSubmit={{
          onSubmitUrl: {
            url: "/api/user",
            method: "PATCH",
            onSuccess() {
              update();
            },
          },
        }}
      />
      <SettingsChange
        form={form_password}
        name={"password"}
        title={"Change Password"}
        initialData={{ id: user?.id, action: "password_change" }}
        properties={[
          {
            name: "id",
            title: "Id",
            type: "string",
            isRequired: true,
            isEditable: false,
            isHidden: true,
          },
          {
            name: "action",
            title: "action",
            type: "string",
            isRequired: true,
            isEditable: false,
            isHidden: true,
            forceValue: "password_change",
          },
          {
            name: "passwordNew",
            title: "New Password",
            type: "password",
            isRequired: true,
            ruleMessage: "Password should have atleast 6 characters",
          },
          {
            name: "passwordConfirm",
            title: "Confirm Password",
            type: "password",
            isRequired: true,
            ruleMessage: "Password should have atleast 6 characters",
          },
        ]}
        onSubmit={{
          onSubmitUrl: {
            url: "/api/user",
            method: "PATCH",
            onSubmitCondition: ({ data }) => {
              if (data.passwordNew === data.passwordConfirm) {
                return {};
              }
              toast.error(
                "Please make your new password and confirm password match",
              );
              return null;
            },
          },
        }}
      />
      {/* <SettingsChange
        name={"phone_number"}
        title={"Phone Number"}
        isEditable={false}
        properties={[
          { name: "phone_number", title: "PhoneNumber", type: "phoneNumber" },
        ]}
      /> */}
      <span id="settings" style={{ width: "100%", height: "fit-content" }}>
        <SettingsChange
          form={form_wicf}
          name={"wicf_membership"}
          title={`${
            user?.wicf_member?.id
              ? `WICF Membership`
              : `WICF Membership (Not A Member)`
          }`}
          editButtonText={user?.wicf_member?.id ? "Edit" : "Join"}
          userData={user}
          getData={
            user?.wicf_member?.id
              ? {
                  getDataKeys: ["data", "user"],
                  getDataUrl: `/api/wicf/member?user_id=${user?.id}`,
                }
              : undefined
          }
          initialData={{
            user_id: user?.id,
          }}
          properties={[
            {
              name: "user_id",
              title: "User Id",
              type: "string",
              isRequired: true,
              isEditable: false,
              forceValue: user?.id,
              isHidden: true,
            },
            {
              name: "id",
              title: "WICF ID",
              type: "number",
              // isRequired: true,
              isEditable: false,
              isHidden: true,
            },
            {
              name: "first_name",
              title: "First Name",
              type: "string",
              isRequired: true,
            },
            {
              name: "last_name",
              title: "Last Name",
              type: "string",
              isRequired: true,
            },
            {
              name: "nationality",
              title: "Country",
              type: "options",
              options: { list: shared_countries_options },
            },
            {
              name: "phone_number",
              title: "PhoneNumber",
              type: "phoneNumber",
              isRequired: true,
            },
            { name: "wechat_id", title: "Wechat ID", type: "string" },
            { name: "birthday", title: "Birthday", type: "dateTime" },
            {
              name: "marital_status",
              title: "Marital_status ",
              type: "options",
              options: { list: shared_marital_status },
            },
            {
              name: "is_in_china",
              title: "Are you in China",
              type: "boolean",
              boolean: { text: true },
            },
            {
              name: "is_baptised",
              title: "Are you Baptised by immersion",
              type: "boolean",
              boolean: { text: true },
            },
          ]}
          onSubmit={{
            onSubmitUrl: {
              url: "/api/wicf/member",
              method: "PATCH",
              onSuccess: () => {
                update();
              },
              onSubmitCondition: ({ data }) => {
                return { overideFetchMethod: data.id ? "PATCH" : "POST" };
              },
            },
          }}
        />
      </span>
    </LayoutDashboard>
  );
}

export default Page;

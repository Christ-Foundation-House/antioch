/** @jsxImportSource @emotion/react */
import LayoutDashboard from "@/layouts/layoutDashboard";
import { Form } from "antd";
import { SettingsChange } from "@/components/SettingsChange";
import { permissionReturnRedirectionOrProps } from "@/utils/permission";
import { getSession } from "next-auth/react";
import { TypeSession } from "@/shared/shared_types";
import { useQuery } from "react-query";
import { GETRoles } from "@/requests";

export default function Page() {
  const [form] = Form.useForm();
  const data_roles = useQuery("roles", () => GETRoles(), {
    keepPreviousData: false,
  });
  return (
    <LayoutDashboard title="Photos">
      <SettingsChange
        form={form}
        name={"photos"}
        title={"Photos"}
        // initialData={{ action: "location_create" }}
        getData={{
          getDataKeys: ["data"],
          getDataUrl: `/api/photos?action=photos_info`,
          // getDataThen(data) {
          //   console.log("getDataThen", data);
          // },
        }}
        properties={[
          // {
          //   name: "action",
          //   title: "action",
          //   type: "string",
          //   isRequired: true,
          //   isHidden: true,
          //   isEditable: false,
          //   forceValue: "photos_info_update",
          // },
          {
            name: "title",
            title: "Title",
            type: "string",
            isRequired: true,
          },
          {
            name: "description",
            title: "Description",
            type: "string",
            isRequired: true,
          },
          {
            name: "admin_roles",
            title: "Roles",
            type: "options",
            options: {
              selectMultiple: {
                labelKey: "label",
                valueKey: "id",
              },
              list:
                data_roles?.data?.map((role) => ({
                  label: role.label,
                  value: JSON.stringify(role.id),
                })) || [],
            },
            // isRequired: true,
          },
        ]}
        onSubmit={{
          onSubmitUrl: {
            url: "/api/photos?action=photos_info_update",
            method: "POST",
          },
        }}
      />
    </LayoutDashboard>
  );
}

export async function getServerSideProps(context) {
  console.log(context.resolvedUrl);
  return permissionReturnRedirectionOrProps({
    session: (await getSession(context.res)) as TypeSession | null,
    routeUrl: context.resolvedUrl,
  });
}

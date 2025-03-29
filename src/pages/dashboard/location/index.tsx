/** @jsxImportSource @emotion/react */
import LayoutDashboard from "@/layouts/layoutDashboard";
import { Form } from "antd";
import { SettingsChange } from "@/components/SettingsChange";
import { permissionReturnRedirectionOrProps } from "@/utils/permission";
import { getSession } from "next-auth/react";
import { TypeSession } from "@/shared/shared_types";

export default function Page() {
  const [form_location] = Form.useForm();
  return (
    <LayoutDashboard title="Location">
      <SettingsChange
        form={form_location}
        name={"location"}
        title={"Location"}
        initialData={{ action: "location_create" }}
        getData={{
          getDataKeys: ["data"],
          getDataUrl: `/api/live?action=location_get`,
          getDataThen(data) {
            console.log("getDataThen", data);
          },
        }}
        properties={[
          {
            name: "action",
            title: "action",
            type: "string",
            isRequired: true,
            isHidden: true,
            isEditable: false,
            forceValue: "location_create",
          },
          {
            name: "title",
            title: "Title",
            type: "string",
            isRequired: true,
          },
          {
            name: "location",
            title: "Location",
            type: "string",
            isRequired: true,
          },
          {
            name: "time",
            title: "Time",
            type: "string",
            isRequired: true,
          },
        ]}
        onSubmit={{
          onSubmitUrl: {
            url: "/api/live?action=location_create",
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

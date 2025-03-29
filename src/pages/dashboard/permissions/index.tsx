/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import React, { useCallback, useEffect, useState } from "react";
// import { DownOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import { Button, Form, Modal, Space, Table } from "antd";
import LayoutDashboard from "@/layouts/layoutDashboard";
import {
  ReqRoleAddRemoveRoute,
  ReqRoleDeleteUser,
  TypeRole,
  TypeSession,
} from "@/shared/shared_types";
import { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import { SettingsChange } from "@/components/SettingsChange";
import { UsersSearch } from "@/components/UsersSearch";
import { useQuery } from "react-query";
import {
  DELETEroleDeleteUser,
  GETRoles,
  GETRoutes,
  PATCHroleAddRemoveRoute,
} from "@/requests";
import { toast } from "react-toastify";
import { permissionReturnRedirectionOrProps } from "@/utils/permission";
import { getSession } from "next-auth/react";

//TYPES
interface TypeData extends TypeRole {
  key: string | number;
}
interface ExpandedDataType {
  key: React.Key;
  date: string;
  name: string;
  upgradeNum: string;
}

const items = [
  { key: "1", label: "Action 1" },
  { key: "2", label: "Action 2" },
];

const Permissions: React.FC = () => {
  // QUERIES
  const data_routes = useQuery("routes", () => GETRoutes(), {
    keepPreviousData: false,
  });
  const data_roles = useQuery("roles", () => GETRoles(), {
    keepPreviousData: false,
  });

  // STATES
  const [columns, setColumns] = useState<TableColumnsType<TypeRole>>([]);
  const [form_role_add] = Form.useForm();
  const [form_role_user_add] = Form.useForm();
  form_role_user_add.setFields([{ name: "role_name" }]);
  const [roleName, setRoleName] = useState<string>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modal, setModal] = useState<EmotionJSX.Element>();
  const [modalTitle, setModalTitle] = useState<string>();
  const [userAdding, setUserAdding] = useState(false);
  const [data, setData] = useState<TypeData[]>([]);

  // FUNCTIONS
  const modalOpen = useCallback(
    (args: {
      name: "user_add" | "role_add" | "route_create";
      title?: string;
    }) => {
      switch (args.name) {
        case "user_add":
          // if (form_user_add) form_user_add.resetFields();
          setModalTitle(args.title ?? "Add user to role");
          const options: { value: string; label: string }[] = [];
          data_roles?.data?.map((role) => {
            console.log("role", role);
            options.push({
              label: role.label,
              value: role.name,
            });
          });
          const element = (
            <Form
              style={{ background: "#161E27", minWidth: 320 }}
              form={form_role_user_add}
              onFinish={async (values) => {
                await toast
                  .promise(
                    fetch(`/api/admin`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        ...values,
                      }),
                    }),
                    {
                      pending: "Adding user to role....",
                      error: "Request failed",
                    },
                  )
                  .then((response) => response.json())
                  .then((res) => {
                    console.log("res", res);
                    if (res.isError === true) {
                      toast.error(res.message ?? `Failed to set role for user`);
                      return;
                    }
                    toast.success(
                      res.message ?? `Successfully set role for user`,
                    );
                    data_roles.refetch();
                    modalClose();
                  })
                  .catch((reason) => {
                    console.log("reason", reason);
                  })
                  .finally(() => {
                    setUserAdding(false);
                  });
              }}
              // bordered={false}
              // loading={userAdding}
            >
              {/* <Typography.Title level={3}>Add to role</Typography.Title> */}
              <Form.Item name={"role_name"}>
                {/* <Select options={options} /> */}
              </Form.Item>
              <Form.Item
                name="action"
                initialValue={"role_user_add"}
              ></Form.Item>
              <Form.Item name={"user_id"}>
                <UsersSearch
                  onSelect={async (user) => {
                    console.log(user);
                    form_role_user_add.setFieldValue("user_id", user.id);
                    form_role_user_add.submit();
                  }}
                />
              </Form.Item>
            </Form>
          );
          setModal(element);
          setIsModalOpen(true);
          break;
        case "role_add":
          if (form_role_add) form_role_add.resetFields();
          setModalTitle("Create New Role");
          setModal(
            <div
              style={{ background: "#161E27", minWidth: 500, minHeight: 200 }}
            >
              <SettingsChange
                startEditable={true}
                form={form_role_add}
                name={"role_create"}
                title={"Add role"}
                initialData={{
                  action: "role_create",
                }}
                properties={[
                  {
                    name: "action",
                    title: "Action",
                    type: "string",
                    isEditable: false,
                    isHidden: true,
                    isRequired: true,
                    forceValue: "role_create",
                  },
                  {
                    name: "name",
                    title: "Name",
                    type: "string",
                    isRequired: true,
                  },
                  {
                    name: "label",
                    title: "Label",
                    type: "string",
                    isRequired: true,
                  },
                ]}
                // isEditing={{
                //   isEditing: form_live_new_is_open,
                //   setIsEditing: set_form_live_new_is_open,
                // }}
                onSubmit={{
                  onSubmitUrl: {
                    url: "/api/admin",
                    method: "POST",
                    onSuccess: () => {
                      modalClose();
                      data_roles.refetch();
                    },
                  },
                }}
              />
            </div>,
          );
          setIsModalOpen(true);
          break;
        case "route_create":
          if (form_role_add) form_role_add.resetFields();
          setModalTitle("Create New Route");
          setModal(
            <div
              style={{ background: "#161E27", minWidth: 500, minHeight: 200 }}
            >
              <SettingsChange
                startEditable={true}
                form={form_role_add}
                name={"route_create"}
                title={"Create Route"}
                initialData={{
                  action: "route_create",
                }}
                properties={[
                  {
                    name: "action",
                    title: "Action",
                    type: "string",
                    isEditable: false,
                    isHidden: true,
                    isRequired: true,
                    // forceValue: "route_create",
                  },
                  {
                    name: "url",
                    title: "Url",
                    type: "string",
                    isRequired: true,
                  },
                ]}
                onSubmit={{
                  onSubmitUrl: {
                    url: "/api/admin",
                    method: "POST",
                    onSuccess: () => {
                      modalClose();
                      data_routes.refetch();
                      data_roles.refetch();
                    },
                  },
                }}
              />
            </div>,
          );
          setIsModalOpen(true);
          break;
        default:
      }
    },
    [form_role_user_add, form_role_add, userAdding],
  );
  function modalClose() {
    setModalTitle(undefined);
    setModal(undefined);
    setIsModalOpen(false);
  }
  async function roleAddOrDeleteRoute(args: ReqRoleAddRemoveRoute) {
    console.log("buttonRolePageToggle", args);
    const res = await toast
      .promise(PATCHroleAddRemoveRoute({ ...args }), {
        pending: `Role Updating ${args.route.url}....`,
        // success: "Successfully updated your information",
        error: "Request failed",
      })
      .then((response) => {
        console.log("roleAddOrDeleteRoute", response);
        if (!response.data.id) {
          toast.error(
            response.message ?? `Error may have occured updating role`,
          );
          return;
        }
        toast.success(
          response.message ??
            `Successfully updated ${response.data.label} role`,
        );
        data_roles.refetch();
      })
      .catch((error) => {
        console.log("roleAddOrDeleteRoute", error);
      });
    console.log(res);
  }
  async function roleDeleteUser(args: ReqRoleDeleteUser) {
    const res = await toast
      .promise(DELETEroleDeleteUser({ ...args }), {
        pending: `Role removing user....`,
        // success: "Successfully updated your information",
        error: "Removing user failed",
      })
      .then((response) => {
        if (!response?.data?.id) {
          toast.error(
            response?.message ?? `Error may have occured updating role`,
          );
          return;
        }
        toast.success(
          response.message ??
            `Successfully updated ${response?.data?.label} role`,
        );
        data_roles.refetch();
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message ?? "Removing user failed");
        console.log("roleAddOrDeleteRoute", error);
      });
    console.log(res);
  }
  function expandedRowRender(role) {
    const columns: TableColumnsType<TypeRole[]> = [
      // { title: "Id", dataIndex: "id", key: "id" },
      { title: "Email", dataIndex: "email", key: "email" },
      { title: "First Name", dataIndex: "first_name", key: "first_name" },
      { title: "Last Name", dataIndex: "last_name", key: "last_name" },
      {
        title: "Action",
        dataIndex: "id",
        key: "id",
        render: (user_id: TypeSession["user"]["id"]) => (
          <Space size="middle">
            <Button
              size="small"
              type="link"
              danger
              onClick={() => {
                // console.log(rowData);
                // console.log(item);
                roleDeleteUser({
                  action: "role_delete_user",
                  user_id,
                  role_id: role.id,
                });
              }}
            >
              Remove
            </Button>
          </Space>
        ),
      },
    ];

    return (
      <Table
        columns={columns}
        key={"email"}
        dataSource={role?.users}
        pagination={false}
      />
    );
  }
  // USE_EFFECT
  useEffect(() => {
    const roles = data_roles.data;
    const routes = data_routes.data;
    const columnsNew: TableColumnsType<TypeRole> = [];
    columnsNew.push(
      { title: "Id", dataIndex: "id", key: "id", width: "5%" },
      { title: "Roles", dataIndex: "label", key: "label" },
    );
    columnsNew.push({
      title: "Actions",
      key: "operation",
      render: (record) => (
        <Button
          danger
          onClick={async () => {
            console.log("record", record);
            await setRoleName(record.name);
            form_role_user_add.setFieldValue("role_name", record.name);
            modalOpen({
              name: "user_add",
              title: `Add user to ${record.label} role`,
            });
          }}
        >
          Add user
        </Button>
      ),
    });
    if (routes) {
      routes.map((route) => {
        columnsNew.push({
          title: route.url,
          // dataIndex: "routes.id",
          key: "routes.id",
          render: (role: TypeRole) => {
            let isRoute: boolean = false;
            role.routes?.map((route_) => {
              if (route_.id === route.id) {
                isRoute = true;
              }
            });
            return isRoute ? (
              <Button
                type="primary"
                onClick={() => {
                  roleAddOrDeleteRoute({
                    action: "role_delete_route",
                    route,
                    role,
                  });
                }}
              >
                Allowed
              </Button>
            ) : (
              <Button
                onClick={() => {
                  roleAddOrDeleteRoute({
                    action: "role_add_route",
                    route,
                    role,
                  });
                }}
              >
                Give access
              </Button>
            );
          },
        });
      });
    }

    setColumns(columnsNew);
    console.log({
      ...roles,
      // routes,
    });
    const dataNew: TypeData[] = [];
    if (roles) {
      roles.map((role, index) => {
        dataNew.push({
          key: index,
          ...role,
        });
      });
      setData(dataNew);
    }
  }, [data_roles.data, data_routes.data]);
  return (
    <LayoutDashboard title="Permissions">
      <Modal
        title={modalTitle}
        open={isModalOpen}
        footer={null}
        centered
        onCancel={modalClose}
        css={css({
          background: "transparent",
          span: {
            // color: "white",
          },
          ".ant-modal-title": {
            color: "white",
          },
          ".ant-modal-header": {
            background: "transparent",
          },
          ".ant-modal-content": {
            width: "fit-content",
            // overflow: "hidden",
            // maxWidth: "100%",
            background: "#161E27",
          },
        })}
      >
        {modal}
      </Modal>
      <div style={{ width: "100%", display: "flex", gap: 10 }}>
        <Button
          onClick={() => {
            data_roles.refetch();
            data_routes.refetch();
          }}
          type="primary"
          style={{ marginBottom: 16 }}
        >
          Refresh
        </Button>
        <Button
          onClick={() => {
            modalOpen({ name: "role_add" });
          }}
          type="primary"
          style={{ marginBottom: 16 }}
        >
          Add Role
        </Button>
        <Button
          onClick={() => {
            modalOpen({ name: "route_create" });
          }}
          type="primary"
          style={{ marginBottom: 16 }}
        >
          Add Route
        </Button>
      </div>
      <Table
        loading={data_roles.isLoading || data_routes.isLoading}
        columns={columns}
        expandable={{ expandedRowRender }}
        dataSource={data}
        key="id"
        style={{ width: "100%" }}
        css={css({
          width: "100%",
          // border: "1px solid red;",
          overflow: "auto",
          ".ant-table-tbody": {
            background: "white",
          },
        })}
      />
    </LayoutDashboard>
  );
};

export default Permissions;

export async function getServerSideProps(context) {
  return permissionReturnRedirectionOrProps({
    session: (await getSession(context.res)) as TypeSession | null,
    routeUrl: context.resolvedUrl,
  });
}

/** @jsxImportSource @emotion/react */
import { DeviceScreen } from "@/styles/theme";
import { css } from "@emotion/react";
import { Layout, Menu, Typography } from "antd";
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { TypeSession } from "@/shared/shared_types";
import { StorageReadItem, storageWriteItem } from "@/utils/localStorage";
import { GLOBAL_ROLES } from "@/utils/permission";
import { NextSeo } from "next-seo";

const {
  // Header,
  Content,
  Sider,
} = Layout;

interface MenuItemsType {
  key: string;
  icon?: ReactNode;
  label: string;
  page?: string;
  children?: MenuItemsType[];
}
const MenuItems: MenuItemsType[] = [
  { key: `account`, icon: null, label: `Account`, page: `/dashboard/account` },
  {
    key: `media`,
    icon: null,
    label: `Media`,
    // page: `/dashboard/manage`,
    children: [
      {
        key: `live`,
        icon: null,
        label: `Live`,
        page: `/dashboard/live`,
      },
      {
        key: `location`,
        icon: null,
        label: `Location`,
        page: `/dashboard/location`,
      },
      {
        key: `photos`,
        icon: null,
        label: `Photos`,
        page: `/dashboard/photos`,
      },
      {
        key: `questions`,
        icon: null,
        label: `Questions`,
        page: `/dashboard/questions`,
      },
    ],
  },
  {
    key: `leaders`,
    icon: null,
    label: `Leaders`,
    // page: `/dashboard/manage`,
    children: [
      {
        key: `manage`,
        icon: null,
        label: `Manage`,
        page: `/dashboard/manage`,
      },
      {
        key: `registration_analytics`,
        icon: null,
        label: `Membership`,
        page: `/dashboard/manage/membership_analytics`,
      },
      {
        key: `statistics`,
        icon: null,
        label: `Statistics`,
        page: `/dashboard/manage/statistics`,
      },
      {
        key: `notifications`,
        icon: null,
        label: `Notifications`,
        page: `/dashboard/manage/notifications`,
      },
      {
        key: `links`,
        icon: null,
        label: `Links`,
        page: `/dashboard/manage/links`,
      },
    ],
  },
  {
    key: `prayer`,
    icon: null,
    label: `Prayer`,
    children: [
      {
        key: `requests`,
        icon: null,
        label: `Requests`,
        page: `/dashboard/prayer/requests`,
      },
    ],
  },
  {
    key: `admins`,
    icon: null,
    label: `Admins`,
    children: [
      {
        key: `permissions`,
        icon: null,
        label: `Permissions`,
        page: `/dashboard/permissions`,
      },
      {
        key: `reports`,
        icon: null,
        label: `Reports`,
        page: `/dashboard/admin/reports`,
      },
      {
        key: `leadership`,
        icon: null,
        label: `Leadership`,
        page: `/dashboard/leadership`,
      },
    ],
  },
];
// function MenuItemsFilteredByUrls(
function MenuItemsFilteredByUrls(
  menuItems: MenuItemsType[],
  urls: string[],
): MenuItemsType[] {
  return menuItems.reduce((acc: MenuItemsType[], item) => {
    let newItem = { ...item };
    if (item.children) {
      newItem.children = MenuItemsFilteredByUrls(item.children, urls);
    }
    if (newItem.children?.length || urls.includes(item.page || "")) {
      acc.push(newItem);
    }
    return acc;
  }, []);
}
const getItemByKey = <T extends { key: string }>(
  key: string,
  items: T[],
): T | undefined => {
  return items.find((item) => item.key === key);
};

interface DashbordMenuArgs {
  isTop?: boolean;
  selectedKeys: string[];
  setSelectedKeys: Dispatch<SetStateAction<string[]>>;
  routes_allowed: string[];
  isAdmin?: boolean;
}

const DashboardMenu = (props: DashbordMenuArgs) => {
  const router = useRouter();
  useEffect(() => {
    const key = router.pathname.split("dashboard/")[1];
    props.setSelectedKeys([key]);
  }, [router.pathname]);
  return (
    <Menu
      theme="dark"
      selectedKeys={props.selectedKeys}
      mode={props.isTop === true ? "horizontal" : "inline"}
      // defaultSelectedKeys={["1"]}
      // defaultOpenKeys={["sub1"]}
      css={css`
        background-color: transparent;
        color: white;
        // height: 50px;
      `}
      // items={MenuItems}
      items={
        props.isAdmin === true
          ? MenuItems
          : MenuItemsFilteredByUrls(MenuItems, props.routes_allowed)
      }
      onSelect={(item) => {
        // console.log(item);
        props.setSelectedKeys([item.key]);
        const item_ = getItemByKey(item.key, MenuItems);
        if (item_ && item_.page) {
          router.push(item_.page);
        } else {
          const path = (item.item as any).props.page;
          if (path) router.push(path);
        }
      }}
    />
  );
};

interface PropsLayoutDashboard {
  title: string;
  description?: string;
  titleIsHidden?: boolean;
}
export const LayoutDashboard: React.FC<
  React.PropsWithChildren<PropsLayoutDashboard>
> = (props) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const session = useSession();
  const [routesAllowed, setRoutesAllowed] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!session.data?.user)
      setRoutesAllowed(StorageReadItem("routes_allowed") ?? []);
    async function getUrls() {
      // console.log({ session });
      const user = session.data?.user as TypeSession["user"];
      const urls = user?.routes_allowed || [];
      setIsAdmin(
        user?.roles?.some((role) => role.name === GLOBAL_ROLES.admin.name) ??
          false,
      );
      storageWriteItem("routes_allowed", urls);
      setRoutesAllowed(urls);
      console.log(urls);
    }
    getUrls();
  }, [session]);
  return (
    <Layout
      css={css`
        padding: 0 50px;
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: 30px 30px 0px 0px;
        display: flex;
        flex-direction: column;
        border-top: 1px solid grey;
        border-radius: 20px;
        flex-grow: 1;
        ${DeviceScreen.mobile} {
          padding: 0px 5px;
        }
        // border: 1px solid white;
        height: 100%;
      `}
    >
      <NextSeo
        title={`Wuhan ICF - ${props.title}`}
        description={props.description ?? undefined}
      />
      {/* <Breadcrumb
        css={css`
          margin: 16px 0;
          color: white;
        `}
      >
        <Breadcrumb.Item>Home</Breadcrumb.Item>
        <Breadcrumb.Item>List</Breadcrumb.Item>
        <Breadcrumb.Item>App</Breadcrumb.Item>
      </Breadcrumb> */}
      <div
        css={css`
          display: none;
          ${DeviceScreen.tablet} {
          }
          ${DeviceScreen.mobile} {
            display: inline;
          }
        `}
      >
        <DashboardMenu
          isTop={true}
          selectedKeys={selectedKeys}
          setSelectedKeys={setSelectedKeys}
          routes_allowed={routesAllowed}
          isAdmin={isAdmin}
        />
      </div>
      <Layout
        css={css`
          padding: 24px 0;
          background: transparent;
          // border: 1px solid red;
          flex-grow: 1;
          display: flex;
          flex-direction: row;
        `}
      >
        <Sider
          collapsible
          collapsedWidth={0}
          breakpoint="sm"
          theme="dark"
          style={{ background: "transparent" }}
          width={200}
          zeroWidthTriggerStyle={{
            top: 10,
            background: "transparent",
            borderRadius: "25px",
            opacity: 0.7,
          }}
          css={css`
            ${DeviceScreen.mobile} {
              display: none;
            }
          `}
        >
          <DashboardMenu
            selectedKeys={selectedKeys}
            setSelectedKeys={setSelectedKeys}
            routes_allowed={routesAllowed}
            isAdmin={isAdmin}
          />
        </Sider>
        <Content
          css={css`
            padding: 15px 34px;
            min-height: 280;
            display: flex;
            flex-direction: column;
            // overflow: hidden;
            // border: 1px solid red;
            overflow-wrap: break-word;
            word-wrap: break-word;
            hyphens: auto;
            white-space: normal;
            border-top: 1px solid grey;
            border-radius: 20px;
            display: flex;
            align-items: center;
            // justify-content: center;
            overflow: hidden;
            position: relative;
            ${DeviceScreen.mobile} {
              padding: 15px 15px;
            }
          `}
        >
          {props.title && props.titleIsHidden !== true ? (
            <Typography.Title style={{ color: "white", textAlign: "center" }}>
              {props.title}
            </Typography.Title>
          ) : null}

          {props.children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutDashboard;

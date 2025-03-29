/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

import LayoutDashboard from "@/layouts/layoutDashboard";
import {
  shared_countries_filters,
  shared_countries_returnName,
} from "@/shared/shared_countries";
import { DeviceScreen } from "@/styles/theme";
import { api } from "@/utils/api";
import { Button, Card, List, Menu, Skeleton, TableProps, Tooltip } from "antd";
import { useState } from "react";
import { GraphSimpleLineChart } from "@/components/Graphs";
import { permissionReturnRedirectionOrProps } from "@/utils/permission";
import { getSession } from "next-auth/react";
import { TypeSession } from "@/shared/shared_types";

export default function page() {
  const api_stats_get = api.stats.get.useQuery({
    last_number_of_months: 5,
  });

  return (
    <LayoutDashboard title={"Statistics"}>
      <div
        style={{
          width: "100%",
        }}
      >
        <Card
          title="Activity logs"
          bordered={false}
          style={{
            color: "black",
            backgroundColor: "transparent",
          }}
          extra={[
            <Button size="small" loading={false} onClick={() => {}}>
              Refresh
            </Button>,
          ]}
        >
          <List
            // loading={false}
            key={"id"}
            itemLayout="horizontal"
            dataSource={[
              {
                id: "id",
                title: "title",
                message: "message",
                timestamp: "2024/01/01",
              },
            ]}
            style={{
              color: "white",
            }}
            renderItem={(item, index) => (
              <List.Item key={index} actions={[]}>
                {/* <Skeleton title={false} loading={false} active>
                <List.Item.Meta
                  key={index}
                  title={<h2>{item?.title}</h2>}
                  description={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <p>{item.message}</p>
                      <p>{item.timestamp}</p>
                    </div>
                  }
                />
                </Skeleton> */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <p>{item.message}</p>
                  <p>{item.timestamp}</p>
                </div>
              </List.Item>
            )}
          />
        </Card>
        <Card
          style={{
            // width: "100%",
            backgroundColor: "transparent",
          }}
        >
          <GraphSimpleLineChart
            title={"Feedback & Prayer Requests"}
            data={api_stats_get.data?.data ?? []}
            // typeShown={["count_feedback", "count_prayer_request"]}
            typeShown={[
              { key: "count_feedback", label: "Feedback", color: "#dc143c" },
              {
                key: "count_prayer_request",
                label: "Prayer Requests",
                color: "#004d0",
              },
            ]}
          />
        </Card>
      </div>
    </LayoutDashboard>
  );
}

export async function getServerSideProps(context) {
  return permissionReturnRedirectionOrProps({
    session: (await getSession(context.res)) as TypeSession | null,
    routeUrl: context.resolvedUrl,
  });
}

import { Card, Col, Row, Typography } from "antd";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { getSession } from "next-auth/react";
import { TypeSession } from "@/shared/shared_types";
import { permissionReturnRedirectionOrProps } from "@/utils/permission";
import LayoutDashboard from "@/layouts/layoutDashboard";

const { Title } = Typography;

export default function LeadershipDashboard() {
  const router = useRouter();
  const { data: tenures } = api.leadershipTenure.getAll.useQuery();
  const { data: ministries } = api.ministry.getAll.useQuery();
  const { data: positions } = api.leadershipPosition.getAll.useQuery();

  const stats = [
    {
      title: "TotalTenures",
      // value:
      //   tenures?.filter((t) => new Date(t.end_date) > new Date()).length ?? 0,
      value: tenures?.length ?? 0,
      link: "/dashboard/leadership/tenures",
    },
    {
      title: "Total Ministries",
      value: ministries?.length ?? 0,
      link: "/dashboard/leadership/ministries",
    },
    {
      title: "Leadership Positions",
      value: positions?.length ?? 0,
      link: "/dashboard/leadership/positions",
    },
  ];

  return (
    <LayoutDashboard title="Leadership Management Dashboard">
      <div className="p-6" style={{ color: "black !important" }}>
        <Title level={2}>Leadership Management Dashboard</Title>

        <Row gutter={[16, 16]} className="mb-8">
          {stats.map((stat, index) => (
            <Col key={index} xs={24} sm={12} md={8}>
              <Card
                hoverable
                onClick={() => void router.push(stat.link)}
                className="text-center"
                style={{ backgroundColor: "transparent" }}
              >
                <Title level={3} style={{ color: "black" }}>
                  {stat.value}
                </Title>
                <p>{stat.title}</p>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={24}>
            <Card
              title="Current Leadership Tenure"
              style={{ backgroundColor: "transparent" }}
            >
              {tenures
                ?.filter((t) => new Date(t.end_date) > new Date())
                .map((tenure) => (
                  <div key={tenure.id} className="mb-4">
                    <Title level={4}>{tenure.name}</Title>
                    <p>
                      {new Date(tenure.start_date).toLocaleDateString()} -{" "}
                      {new Date(tenure.end_date).toLocaleDateString()}
                    </p>
                    {tenure.description && <p>{tenure.description}</p>}
                  </div>
                ))}
            </Card>
          </Col>

          <Col xs={24} lg={24}>
            <Card
              title="Ministry Overview"
              style={{ backgroundColor: "transparent" }}
            >
              {ministries?.map((ministry) => (
                <div key={ministry.id} className="mb-4">
                  <Title level={4}>{ministry.label}</Title>
                  <p>
                    Members: {ministry.members.length} | Positions:{" "}
                    {ministry.positions.length}
                  </p>
                </div>
              ))}
            </Card>
          </Col>
        </Row>
      </div>
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

import { MembershipAnalytics } from "@/components/component/MembershipAnalytics";
import { Card, Tooltip, Typography } from "antd";

const { Text, Title } = Typography;

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// export type typeGraphTypes =
//   | "count_feedback"
//   | "count_new_member"
//   | "count_prayer_request"
//   | "count_members";

export interface typeGraphObject {
  // key: typeGraphTypes;
  key: string;
  label: string;
  color: string;
}

export function GraphSimpleLineChart({
  title,
  data,
  typeShown,
}: {
  title?: string;
  data: any[];
  typeShown: typeGraphObject[];
}) {
  return (
    <div
      className="w-full aspect-[16/9]"
      style={{
        // border: "1px solid white",
        // backgroundColor: "#161E27",
        padding: "5px 0px",
        borderRadius: 25,
        margin: "10px 0px",
      }}
    >
      <Title level={5} style={{ textAlign: "center" }}>
        {title}
      </Title>
      <ResponsiveContainer
        width="100%"
        height="100%"
        // style={{ border: "1px solid red" }}
      >
        <LineChart
          // width={500}
          // height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="id"
            // label={"Height"}
          />
          <YAxis />
          <Tooltip />
          <Legend
            // verticalAlign="top"
            height={36}
          />
          <>
            {typeShown.map((item) => (
              <Line
                type={"monotone"}
                name={item.label}
                dataKey={item.key}
                stroke={item.color}
                activeDot={{ r: 8 }}
              />
            ))}
          </>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function GraphLinechartChart(props: { data: any[] }) {
  return (
    <div className="w-full aspect-[16/9]">
      <ChartContainer
        config={{
          desktop: {
            label: "Desktop",
            color: "hsl(var(--chart-1))",
          },
        }}
      >
        <LineChart
          accessibilityLayer
          data={props.data}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey={"id"}
            // tickLine={false}
            // axisLine={false}
            tickMargin={8}
            // tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip
            cursor={true}
            content={<ChartTooltipContent hideLabel />}
          />
          <Line
            dataKey="count_prayer_request"
            type="monotone"
            stroke="white"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}

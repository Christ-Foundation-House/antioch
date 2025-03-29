/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import React, { useEffect } from "react";
import { Avatar, Card, List, Skeleton } from "antd";
import Info, { PropsInfo } from "./Info";
const { Meta } = Card;

// interface DataType {
//   gender?: string;
//   name: {
//     title?: string;
//     first?: string;
//     last?: string;
//   };
//   email?: string;
//   picture: {
//     large?: string;
//     medium?: string;
//     thumbnail?: string;
//   };
//   nat?: string;
//   loading: boolean;
// }

// const count = 3;
// const fakeDataUrl = `https://randomuser.me/api/?results=${count}&inc=name,gender,email,nat,picture&noinfo`;

export interface PropsSharedList {
  dataFetch?: () => {};
  dataIsLoading?: boolean;
  data: {
    title: string;
    description?: string;
    imageUrl?: string;
    actions?: React.ReactNode[];
    item: any;
    info?: PropsInfo[];
  }[];
}
export default function SharedList(props: PropsSharedList) {
  // const [initLoading, setInitLoading] = useState(true);
  //   const [loading, setLoading] = useState(false);
  // const [data, setData] = useState<DataType[]>([]);
  // const [list, setList] = useState<DataType[]>([]);

  useEffect(() => {
    // console.log("SharedList-data", props.data);
  }, [props]);
  useEffect(() => {
    // fetch(fakeDataUrl)
    //   .then((res) => res.json())
    //   .then((res) => {
    //     setInitLoading(false);
    //     setData(res.results);
    //     setList(res.results);
    //   });
  }, []);

  return (
    <List
      css={css({
        width: "100%",
        color: "white",
        padding: "10px 0px",
        background: "transparent",
      })}
      loading={props.dataIsLoading}
      itemLayout="horizontal"
      dataSource={props.data.reverse()}
      renderItem={(item) => (
        <Card actions={item.actions} style={{ marginBottom: 5 }}>
          <Skeleton loading={props.dataIsLoading} avatar active>
            <Meta
              avatar={item.imageUrl ? <Avatar src={item.imageUrl} /> : null}
              title={item.title}
              description={item.description}
            />
            <div>
              {item.info?.map((info, index) => {
                return <Info key={index} color="black" {...info} />;
              })}
            </div>
          </Skeleton>
        </Card>
      )}
    />
  );
}

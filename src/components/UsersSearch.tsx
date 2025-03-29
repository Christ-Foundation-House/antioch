/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { GETUsers } from "@/requests";
import { TypeSession } from "@/shared/shared_types";
import { Button, Card, Input, Space, Table } from "antd";
import { useQuery } from "react-query";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { DeviceScreen } from "@/styles/theme";

interface PropsUserSearch {
  onSelect: (user: TypeSession["user"]) => void;
  isLoading?: boolean;
}

function UsersSearchAccess(props: PropsUserSearch) {
  const data_users = useQuery("users", () => GETUsers(), {
    keepPreviousData: false,
  });
  const [data, setData] = useState<TypeSession["user"][]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const columns: ColumnsType<TypeSession["user"]> = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "First name",
      dataIndex: "first_name",
      key: "first_name",
      filterSearch: true,
    },
    {
      title: "Last name",
      dataIndex: "last_name",
      key: "last_name",
    },
    {
      title: "Action",
      key: "action",
      render: (
        _,
        // record
      ) => (
        <Space size="middle">
          <Button size="small" onClick={() => props.onSelect(_)}>
            Select
          </Button>
        </Space>
      ),
    },
  ];
  useEffect(() => {
    if (data_users.data) {
      const dataOld = data_users.data;
      if (!searchTerm || searchTerm === "") {
        setData(data_users.data);
        return;
      }
      const dataNew: TypeSession["user"][] = [];
      dataOld.map((item) => {
        Object.keys(item).map((key) => {
          const item_: string = item[key];
          if (
            item_?.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
          ) {
            const isAlreadyAdded = dataNew.find((itm) => itm === item);
            !isAlreadyAdded && dataNew.push(item);
            return;
          }
        });
      });
      setData(dataNew);
    }
  }, [data_users.data, searchTerm]);
  return (
    <div
      css={css({
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minWidth: 520,
        minHeight: 520,
        width: "fit-content",
        maxHeight: "80vh",
        [DeviceScreen.mobile]: {
          minWidth: 300,
          width: "100%",
        },
        // overflow: "hidden",
      })}
    >
      <Input.Search
        value={searchTerm}
        disabled={data_users.isLoading || props.isLoading}
        loading={data_users.isLoading || props.isLoading}
        onChange={(value) => setSearchTerm(value.target.value)}
        onSearch={() => data_users.refetch()}
      />
      <Table
        loading={data_users.isFetching || props.isLoading}
        dataSource={data}
        columns={columns}
        // style={{ width: "100%" }}
        // css={css`
        //   width: 100%;
        // `}
      />
    </div>
  );
}
function UsersSearchNoAccess() {
  return <div>No Permission</div>;
}

export function UsersSearch(props: PropsUserSearch) {
  return (
    <Card
      css={css({
        background: "transparent",
        display: "flex",
        width: "fit-content",
        overflow: "hidden",
      })}
    >
      {true ? <UsersSearchAccess {...props} /> : <UsersSearchNoAccess />}
    </Card>
  );
}

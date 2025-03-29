import React, { useEffect, useState } from "react";
import { Button, Card, DatePicker, GetProps, Input } from "antd";

type SearchProps = GetProps<typeof Input.Search>;
const { Search } = Input;

export interface SearchFilterProps<T> {
  title?: string;
  titleShow?: boolean;
  data: T[]; // List of items to search through
  onSearch: (filteredData: T[]) => void; // Function to return filtered data
  // filterKey: keyof T;  // The key in the data object that should be searched on
}

export function SearchFilter<T extends Record<string, any>>(
  props: SearchFilterProps<T>,
) {
  const { title, titleShow = true, data, onSearch } = props;
  const [input, setInput] = useState<string>(""); // Search input value
  const [uniqueKeys, setUniqueKeys] = useState<Array<keyof T>>([]); // T

  const handleSearch = (value: string) => {
    setInput(value);
    const lowerCaseValue = value.toLowerCase();

    // Filter the data by checking each key
    const filteredData = data.filter((item) =>
      uniqueKeys.some((key) =>
        item[key]?.toString().toLowerCase().includes(lowerCaseValue),
      ),
    );

    // Call onSearch with the filtered data
    onSearch(filteredData);
  };

  useEffect(() => {
    if (data.length > 0) {
      const keys = Object.keys(data[0]) as Array<keyof T>;
      setUniqueKeys(keys); // Store unique keys from the data
    }
  }, [data]);
  return (
    <Card
      title={
        props.titleShow === false ? undefined : props.title ?? "Search & Filter"
      }
      bordered={false}
      style={{
        backgroundColor: "transparent",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <Search
          placeholder="Enter search text"
          allowClear
          enterButton={
            <Button
              size="small"
              style={{ backgroundColor: "black", color: "white" }}
            >
              Search
            </Button>
          }
          size="large"
          onSearch={handleSearch}
        />
      </div>
    </Card>
  );
}

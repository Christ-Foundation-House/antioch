import { Tooltip, Dropdown, Menu } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import React from "react";

interface Option {
  label: string;
  onClick?: () => void;
}

interface MyComponentProps {
  options: (Option | undefined)[];
  title?: string;
}

const OptionsDropDown: React.FC<MyComponentProps> = ({ options, title }) => {
  const menu = (
    <Menu>
      {options.map((option, index) =>
        option ? (
          <Menu.Item key={index} onClick={option.onClick}>
            {option.label}
          </Menu.Item>
        ) : undefined,
      )}
    </Menu>
  );

  return options.length ? (
    <Tooltip title={title}>
      <Dropdown overlay={menu}>
        <MoreOutlined style={{ fontSize: 20 }} />
      </Dropdown>
    </Tooltip>
  ) : null;
};

export default OptionsDropDown;

import React, { useState, useEffect } from "react";
import { Form, Select, Button } from "antd";

const { Option } = Select;

const instruments = [
  "Guitar",
  "Piano",
  "Drums",
  "Bass Guitar",
  "Violin",
  "Saxophone",
  "Trumpet",
  "Clarinet",
  "Flute",
  "Harmonica",
  "Ukulele",
  "Banjo",
  "Mandolin",
  "Accordion",
  "Harmonium",
  "Tabla",
  "Sitar",
  "Dholak",
  "Dhol",
  "Tambourine",
];

const levels = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

const FormComponent = () => {
  const [selectedInstruments, setSelectedInstruments] = useState([]);
  const [
    levelData,
    // setLevelData
  ] = useState({});

  const onFinish = (values) => {
    console.log("Received values of form:", values);
  };

  const handleInstrumentChange = (value) => {
    setSelectedInstruments(value);
  };

  useEffect(() => {
    const fetchData = async () => {
      // const response = await fetch("https://example.com/levels");
      // const data = await response.json();
      // setLevelData(data);
    };

    fetchData();
  }, []);

  return (
    <Form onFinish={onFinish}>
      <Form.Item name="instruments_i_play" label="Instruments I Play">
        <Select mode="multiple" onChange={handleInstrumentChange}>
          {instruments.map((instrument) => (
            <Option key={instrument} value={instrument}>
              {instrument}
            </Option>
          ))}
        </Select>
      </Form.Item>
      {selectedInstruments.map((instrument) => (
        <Form.Item
          key={instrument}
          name={["level_of_instrument", instrument]}
          label={`Level of ${instrument}`}
        >
          <Select>
            {levelData[instrument] &&
              levelData[instrument].map((level) => (
                <Option key={level.value} value={level.value}>
                  {level.label}
                </Option>
              ))}
            {!levelData[instrument] &&
              levels.map((level) => (
                <Option key={level.value} value={level.value}>
                  {level.label}
                </Option>
              ))}
          </Select>
        </Form.Item>
      ))}
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default FormComponent;

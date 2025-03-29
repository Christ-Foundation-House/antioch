/** @jsxImportSource @emotion/react */
import {
  shared_instruments,
  shared_instruments_levels,
} from "@/shared/shared_instruments";
import { css } from "@emotion/react";
// import React, { useState } from "react";
import {
  Input,
  Button,
  Typography,
  Form,
  // TreeSelect,
  // Radio,
  Select,
  // Cascader,
  // DatePicker,
} from "antd";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { shared_vocal_range } from "@/shared/shared_vocal_range";
import { shared_frequency_options } from "@/shared/shared_frequency";
import { shared_harmony_options } from "@/shared/shared_harmony";
import { tools_valuesToString, tools_valuesToJson } from "@/scripts/tools";

const { Option } = Select;

const { Title, Paragraph } = Typography;

function FormComponent({ initialFormValues }) {
  const [form] = Form.useForm();
  const [selectedInstruments, setSelectedInstruments] = useState([]);
  // const [
  //   selectedInstrumentsLevels,
  //   setSelectedInstrumentsLevels
  // ] = useState({});
  // const [phoneNumber, setPhoneNumber] = useState(null);

  function onFormChange() {
    // console.log(values);
  }
  // function valuesToString(values) {
  //   const newValues = {
  //     ...values,
  //     vocal_range: values.vocal_range
  //       ? JSON.stringify(values.vocal_range)
  //       : "[]",
  //     instruments_able_to_play: values.instruments_able_to_play
  //       ? JSON.stringify(values.instruments_able_to_play)
  //       : "[]",
  //     instruments_able_to_play_level: values.instruments_able_to_play_level
  //       ? JSON.stringify(values.instruments_able_to_play_level)
  //       : "{}",
  //   };
  //   console.log("dataToString", newValues);
  //   return newValues;
  // }
  function valuesToJson(values) {
    // const newValues = {
    //   ...values,
    //   vocal_range: values.vocal_range ? JSON.parse(values.vocal_range) : [],
    //   instruments_able_to_play: values.instruments_able_to_play
    //     ? JSON.parse(values.instruments_able_to_play)
    //     : [],
    //   instruments_able_to_play_level:
    //     values.instruments_able_to_play_level !== null
    //       ? JSON.parse(values.instruments_able_to_play_level)
    //       : {},
    //   confortable_harmony: values.confortable_harmony
    //     ? JSON.parse(values.confortable_harmony)
    //     : [],
    // };
    const newValues = tools_valuesToJson("worship", values, true);
    setSelectedInstruments(newValues.instruments_able_to_play);
    console.log("dataToJson", newValues);
    return newValues;
  }
  async function onFormSubmit(values_) {
    console.log("submit", values_);
    // values = valuesToString(values);
    console.log("@new-string-values-BEFORE", values_);
    const values = tools_valuesToString({
      type: "worship",
      values: values_,
      isOneObject: true,
    });
    console.log("@new-string-values", values);
    try {
      const response = await toast.promise(
        fetch(`/api/wicf/member`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ministry: "worship",
            ...values,
          }),
        }),
        {
          pending: "Updating....",
          // success: "Successfully updated your information",
          error: "Request failed",
        },
      );
      const res = await response.json();
      if (res.isError === true) {
        toast.error(res.message);
        // form.resetFields();
      } else if (res.data.user_ministries.worship.id !== undefined) {
        const memberData = res.data.user_ministries.worship;
        toast.success(res.message);
        // setPhoneNumber(member.phone_number ?? null);
        // setIsNewMember(false);
        form.setFieldsValue({ ...valuesToJson(memberData) });
      } else {
        toast.error("General error, contact admin");
      }
    } catch (e) {
      toast.error("An Error occurred try reload the page");
      console.log(e);
    }
  }
  function onFormSubmitFailed(formData) {
    console.log("Form failed", formData);
    if (formData.values.firstname === undefined) {
      // formRef.current.scrollTop = 0;
      // formTopRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }
  useEffect(() => {
    console.log(
      "initilaFormValues",
      initialFormValues["worship"] && initialFormValues["worship"],
    );
    form.setFieldsValue(
      valuesToJson(
        initialFormValues["worship"] && initialFormValues["worship"],
      ),
    );
  }, [form, initialFormValues]);
  return (
    <Form
      // labelCol={{
      //   span: 5,
      // }}
      // wrapperCol={{
      //   span: 14,
      // }}
      scrollToFirstError={true}
      form={form}
      layout="vertical"
      onFinish={onFormSubmit}
      onFinishFailed={onFormSubmitFailed}
      onValuesChange={onFormChange}
      css={css`
        // border: 1px solid red;
        // flex-grow: 1;
        min-height: 100%;
        padding: 0px 40px;
        // overflow: scroll;
        width: 100%;
        max-width: 1200px;
        // height: 100vh;
      `}
    >
      <Paragraph
        css={css`
          width: 100%;
          padding: 15px 0px;
          text-align: center;
        `}
      >
        Please fill / change your information accurately
      </Paragraph>
      <Title level={2}>Part 1</Title>
      <Form.Item
        name="wicf_member_id"
        label="wicf_member_id"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Input disabled />
      </Form.Item>
      <Form.Item
        name="is_vocalist"
        label="Are you a vocalist?"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Select
          options={[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ]}
        />
      </Form.Item>
      <Form.Item
        name="is_instrumentalist"
        label="Are you Instrumentalist?"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Select
          options={[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ]}
        />
      </Form.Item>
      <Form.Item
        name="is_born_again"
        label="Are you born again?"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Select
          options={[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ]}
        />
      </Form.Item>
      <Form.Item
        name="is_baptized"
        label="Have you been baptized?"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Select
          options={[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ]}
        />
      </Form.Item>
      <Form.Item
        name="has_completed_workers_training"
        label="Have you completed the WICF workers training?"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Select
          options={[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ]}
        />
      </Form.Item>
      <Form.Item
        name="reason_for_joining"
        label="What made you join WICF worship team?"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="has_music_theory"
        label="Do you have any music theory?"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Select
          options={[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ]}
        />
      </Form.Item>
      <Form.Item
        name="has_practice_schedule"
        label="Do you have a practice schedule?"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Select
          options={[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ]}
        />
      </Form.Item>
      <Form.Item
        name="has_approach_for_learning_songs"
        label="Do you have an approach that you use when learning songs?"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Select
          options={[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ]}
        />
      </Form.Item>
      <Form.Item
        name="approach_for_learning_songs"
        label="If yes, please elaborate your approach for learning songs"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="music_listening_frequency"
        label="If yes, How often do you listen to music?"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        {/* <Select
          options={[
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" },
            { value: "sometimes", label: "Sometimes" },
            { value: "rarely", label: "Rarely" },
            { value: "never", label: "Never" },
          ]}
        /> */}
        <Select options={shared_frequency_options} />
      </Form.Item>
      <Form.Item
        name="has_vocal_exercises"
        label="Do you do vocal warm ups/exercises?"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Select
          options={[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ]}
        />
      </Form.Item>
      <Form.Item
        name="vocal_exercises_frequency"
        label="If yes, how often do vocal warm ups/exercises?"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        {/* <Select
          options={[
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" },
            { value: "sometimes", label: "Sometimes" },
            { value: "rarely", label: "Rarely" },
            { value: "never", label: "Never" },
          ]}
        /> */}
        <Select options={shared_frequency_options} />
      </Form.Item>
      <Form.Item
        name="is_praying_for_choir"
        label="Do you pray for the worship team?"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Select
          options={[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ]}
        />
      </Form.Item>

      <Title level={2}>Part 2</Title>
      <Form.Item
        // name=""
        name="confortable_harmony"
        label="Which harmony are you comfortable with?"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Select
          mode="multiple"
          options={shared_harmony_options}
          // options={[
          //   { value: "soprano", label: "Soprano" },
          //   { value: "alto", label: "Alto" },
          //   { value: "tenor", label: "Tenor" },
          //   { value: "bass", label: "Bass" },
          // ]}
        />
      </Form.Item>
      <Form.Item
        // name=""
        name="vocal_range"
        label="What is your vocal range?"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Select mode="multiple" options={shared_vocal_range} />
      </Form.Item>
      <Form.Item
        //
        name="define_background_vocal"
        label="Define background vocal?"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Input.TextArea />
      </Form.Item>
      <Form.Item
        //
        name="define_worship_leader"
        label="Define a worship leader"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Input.TextArea />
      </Form.Item>
      <Form.Item
        //
        name="define_worship"
        label="Define Worship"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Input.TextArea />
      </Form.Item>
      <Form.Item
        //
        hidden
        name="define_worshipper"
        label="Define a Worshipper"
        // rules={[{ required: true, message: "Please this is required" }]}
      >
        <Input.TextArea />
      </Form.Item>
      <Form.Item
        //
        name="struggle_in_choir"
        label="What do you struggle with the most in the choir"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        //
        name="instruments_able_to_play"
        label="Which instrument(s) do you play?"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Select
          mode="multiple"
          options={shared_instruments}
          onChange={(value) => {
            setSelectedInstruments(value !== null ? value : []);
            // console.log("instruments_able_to_play->Changed");
            // setSelectedInstruments(value);
          }}
        />
      </Form.Item>
      {/* <Form.Item
        //
        name="instruments_able_to_play_level"
        label="What is your level in this/these instrument(s)?"
      >
        <Select options={shared_instruments_levels} />
      </Form.Item> */}
      {selectedInstruments.map((instrument) => (
        <Form.Item
          // key={instrument.value}
          key={instrument}
          name={["instruments_able_to_play_level", instrument]}
          label={`Instrument skill level for ${instrument}`}
          rules={[{ required: true, message: "Please enter instrument level" }]}
        >
          <Select>
            {/* {selectedInstrumentsLevels[instrument] &&
              selectedInstrumentsLevels[instrument].map((level) => (
                <Option key={level.value} value={level.value}>
                  {level.label}
                </Option>
              ))}
            {!selectedInstrumentsLevels[instrument] &&
              shared_instruments_levels.map((level) => (
                <Option key={level.value} value={level.value}>
                  {level.label}
                </Option>
              ))} */}
            {shared_instruments_levels.map((level) => (
              <Option key={level.value} value={level.value}>
                {level.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
      ))}
      <Form.Item
        //
        name="knows_instruments_roles_in_band"
        label="Do you know the role of your instrument in a band?"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Select
          options={[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ]}
        />
      </Form.Item>
      <Form.Item
        //
        name="knows_number_system"
        label="Do you know the number system?"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Select
          options={[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ]}
        />
      </Form.Item>
      <Form.Item
        //
        name="work_ethic_with_others"
        label="How good is your work ethic with others in a worship setting?"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Select
          options={[
            { value: "poor", label: "Poor" },
            { value: "fair", label: "Fair" },
            { value: "good", label: "Good" },
            { value: "very Good", label: "Very Good" },
            { value: "excellent", label: "Excellent" },
          ]}
        />
      </Form.Item>
      <Form.Item
        //
        name="is_regular_workshop_willing"
        label="If the choir were to have regular workshops/courses to equip us, would you be willing to learn and participate?"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Select
          options={[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ]}
        />
      </Form.Item>
      <Form.Item
        //
        name="choir_improvement_request"
        label="What improvements would you like to see in the choir?"
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <Input />
      </Form.Item>
      <Paragraph
        css={css`
          width: 100%;
          padding: 15px 0px;
          text-align: center;
        `}
      >
        Thank you very much and may God richly bless you.
      </Paragraph>
      <Form.Item
        css={css`
          display: flex;
          // border: 1px solid red;
          align-items: center;
          justify-content: center;
        `}
        rules={[{ required: true, message: "Please this is required" }]}
      >
        <div
          css={css`
            // flex: 1;
            display: flex;
            // border: 1px solid red;
            align-items: center;
            justify-content: center;
            gap: 0px 10px;
            // column-gap: 2px;
            width: 100%;
          `}
        >
          <Button
            type="primary"
            css={css`
              width: 200px;
            `}
            htmlType="submit"
          >
            {"Update"}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
}

export default FormComponent;

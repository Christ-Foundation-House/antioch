/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { type_options } from "@/shared/shared_countries";
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Form,
  Button,
  Card,
  Modal,
  Badge,
  Input,
  Select,
  DatePicker,
  Switch,
  FormInstance,
  AutoComplete,
  Radio,
} from "antd";
import { sessionUserType } from "@/shared/shared_actions";
import {
  TypeBoolState,
  TypeDatesState,
  TypeFetchMethods,
  TypeFormValuesChanged,
  TypeSession,
} from "@/shared/shared_types";
import { $Res } from "@/shared/shared_classes";
import useUserAgent from "@/hooks/useUserAgent";

export const dateFormat = "YYYY-MM-DD";
export interface SettingAction {
  name: string;
  label: string;
  onClick: () => void;
}
export interface SettingProperty {
  name: string;
  title: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "boolean_old"
    | "dateTime"
    | "image"
    | "options"
    | "phoneNumber"
    | "email"
    | "password"
    // | "passwordConfirm"
    | "verify"
    | "buttons";
  isEditable?: boolean;
  options?: {
    list: type_options[];
    selectMultiple?: {
      labelKey: string;
      valueKey: string;
    };
    allowOther?: boolean;
  };
  buttons?: { label: string; onClick: () => void }[];
  isRequired?: boolean;
  isHidden?: boolean;
  actions?: SettingAction[];
  forceValue?: string;
  ruleMessage?: string;
  boolean?: {
    text?:
      | {
          true?: React.ReactNode;
          false?: React.ReactNode;
        }
      | boolean;
  };
}
export interface SettingsOnSubmitValues extends SettingProperty {
  value: SettingProperty["type"];
}
export interface SettingsChangeProps {
  ref?: MutableRefObject<undefined>;
  name: string;
  title: string;
  properties: SettingProperty[];
  isEditable?: boolean;
  isHidden?: boolean;
  editButtonText?: string;
  // userData?: sessionUserType;
  userData?: TypeSession["user"];
  initialData?: {};
  setData?: (values: { key: string }[]) => void;
  getData?: {
    getDataUrl: string;
    getDataKeys: string[];
    getDataThen?: (data: any) => void;
    getDataOveride?: ({
      setData,
    }: {
      setData: SettingsChangeProps["setData"];
    }) => void;
  };
  onSubmit?: {
    onSubmitUrl?: {
      url: string;
      method: TypeFetchMethods;
      onSubmitCondition?: (args: {
        data: any;
        setIsEditing: Dispatch<SetStateAction<boolean>>;
      }) => {
        overideFetchMethod?: TypeFetchMethods;
        overideFetchUrl?: string;
      } | null;
      onSuccess?: (args: {
        message: string;
        data: $Res;
        setIsEditing: Dispatch<SetStateAction<boolean>>;
      }) => void;
      onFailed?: (args: {
        message: string;
        data?: $Res;
        setIsEditing: Dispatch<SetStateAction<boolean>>;
      }) => void;
    };
    onSubmitOveride?: ({
      values,
    }: {
      values: any;
      setIsEditing: Dispatch<SetStateAction<boolean>>;
    }) => void;
  };
  form: FormInstance<any>;
  isEditing?: {
    isEditing: boolean | undefined;
    setIsEditing: Dispatch<SetStateAction<boolean | undefined>>;
  };
  onFormValuesChange?: (args: TypeFormValuesChanged) => void; // stops data from auto updating
  startEditable?: boolean;
  // startSaveble?: boolean;
  hasExtras?: boolean;
  hasBorders?: boolean;
  // hasCancel?: boolean;
  hasBadge?: boolean;
  buttonsReverse?: boolean;

  saveButton?: {
    label?: string;
    onClickOveride?: (values: any) => void;
    isDisabled?: boolean;
    isHidden?: boolean;
  };

  secondaryButton?: {
    label?: string;
    onClickOveride?: () => void;
    isDisabled?: boolean;
    isHidden?: boolean;
  };

  isLoading?: boolean;
  errorProperties?: string[];
}
function getValue(obj, path) {
  if (!path && typeof path !== "object") return;
  let result = obj;
  if (!result) return;
  for (let element of path) {
    if (!result[element]) return;
    result = result[element];
    if (result === undefined) {
      return undefined;
    }
  }
  return result;
}

export const SettingsChange = (props: SettingsChangeProps) => {
  const userAgent = useUserAgent();
  const [errorProperties, setErrorProperties] = useState<string[]>([]);
  const [editItem, setEditItem] = useState("");
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [isEditing, setIsEditingReal] = useState(false);
  // const [form] = Form.useForm();
  const [formValuesPrevious, setFormValuesPrevious] = useState(
    props.form?.getFieldsValue(),
  );
  const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
  // const [birthday, setBirthday] = useState<dayjs.Dayjs | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dates, setDatesReal] = useState<TypeDatesState>({});
  const [bools, setBoolsReal] = useState<TypeBoolState>({});
  const [propertiesWithOther, setPropertiesWithOther] = useState<string[]>([]);
  // const setDates = useCallback(
  //   ({ date, name }: { date: dayjs.Dayjs | string | null; name: string }) => {
  //     let datesNew = { ...dates };
  //     datesNew[name] = date ? dayjs(date, dateFormat) : null;
  //     setDatesReal(datesNew);
  //   },
  //   [dates],
  // );
  const setDates = useCallback(
    ({ date, name }: { date: dayjs.Dayjs | string | null; name: string }) => {
      setDatesReal((prevDates) => ({
        ...prevDates,
        [name]: date ? dayjs(date) : null,
      }));
    },
    [],
  );
  const setBools = useCallback(
    ({ value, name }: { value: boolean | null; name: string }) => {
      setBoolsReal((prevBools) => {
        let valueNew = { ...prevBools };
        valueNew[name] = value ?? false;
        return valueNew;
      });
      props.form?.setFieldValue(name, value);
    },
    [],
  );
  function setIsEditing(state: boolean) {
    if (props.isEditable === false) {
      toast.error("You are not allowed to edit this");
    } else {
      setIsEditingReal(state);
    }
  }
  function setFormValuesByProperties(data: any) {
    let has_nested_props = false;
    props.properties.map((property) => {
      if (typeof property.name === "object") has_nested_props = true;
    });
    if (has_nested_props) props.form.setFieldsValue(data);

    props.properties.map((property) => {
      const { name, type, forceValue } = property;
      if (typeof name === "object") {
        return;
      }
      switch (type) {
        case "dateTime":
          setDates({ name, date: forceValue ?? data[name] });
          break;
        case "boolean":
          // console.log({ data, bools });
          setBools({ name, value: forceValue ?? data[name] });
          break;
        case "options":
          const dataMultiple: { label: string; value: string }[] = [];
          if (data[name] && property.options?.selectMultiple) {
            // const { labelKey, valueKey } = property.options?.selectMultiple;
            let parsedData = [];
            try {
              parsedData = data[name] ? JSON.parse(data[name]) : [];
            } catch {
              console.error(`Failed to parse ${data[name]}`);
            }
            if (Array.isArray(parsedData)) {
              parsedData.map((item) => {
                if (item) dataMultiple.push(item);
              });
            }
          }
          if (dataMultiple.length > 0) {
            props.form?.setFieldValue(name, dataMultiple);
          } else {
            props.form?.setFieldValue(name, forceValue ?? data[name]);
          }
          // props.form?.setFieldValue(name, forceValue ?? dataMultiple);
          break;
        default:
          props.form?.setFieldValue(name, forceValue ?? data[name]);
      }
    });
  }
  async function handleGetData() {
    if (!props.getData) return;
    const { getDataUrl } = props.getData;
    if (!getDataUrl) return;
    setIsLoading(true);
    const response = await toast.promise(fetch(getDataUrl), {
      error: "Request failed",
    });
    const res = await response.json();
    setIsLoading(false);
    if (!res) {
      // on connection failed
      toast.error(`Failed to get connection for ${props.title}`);
      return;
    }
    if (!res || !res.data) {
      // on data return failed
      toast.error(
        `[${props.title}] - ${res.message}` ??
          `Failed to get Data for ${props.title}`,
      );
      return;
    }
    const data = getValue(res, props.getData?.getDataKeys);
    if (!data) {
      toast.error(`Necessary Data was not found for ${props.title}`);
      return;
    }
    setFormValuesByProperties(data);
    props.getData?.getDataThen && props.getData?.getDataThen(data);
  }
  async function handleSubmit(values: any) {
    console.log("handleSubmit", values);
    // let submitValues = {};
    let submitValues = values;
    props.properties.map((property) => {
      const { name, type } = property;
      switch (type) {
        case "dateTime":
          submitValues[name] =
            dates[name] !== null
              ? dates[name]?.format("YYYY-MM-DD") + "T00:00:00.000Z"
              : null;
          break;
        case "options":
          if (property.options?.selectMultiple) {
            const data = submitValues[name];
            let dataArray = Array.isArray(data) ? data : null;
            if (dataArray && dataArray.length <= 0) {
              dataArray = null;
            }
            if (dataArray) {
              if (property.options?.selectMultiple) {
                submitValues[name] = JSON.stringify(dataArray);
              }
            } else {
              submitValues[name] = null;
            }
          }
          break;
        default:
          submitValues[name] = values[name];
      }
    });
    // console.log("submitValues", submitValues);
    if (!props.onSubmit) {
      toast.error("No submit functionality");
      return;
    }
    if (props.onSubmit.onSubmitOveride) {
      props.onSubmit.onSubmitOveride({
        values: submitValues,
        setIsEditing: setIsEditingReal,
      });
      return;
    }
    if (!props.onSubmit.onSubmitUrl) {
      toast.error("No submitUrl or submitOveride");
      return;
    }
    let { url, method, onSuccess, onFailed, onSubmitCondition } =
      props.onSubmit.onSubmitUrl;
    // if (
    //   onSubmitCondition &&
    //   !onSubmitCondition({ data: submitValues, setIsEditing }).continue
    // ) {
    //   console.error(`SettingChange failed condition`);
    //   return;
    // }
    if (onSubmitCondition) {
      const continueSubmit = onSubmitCondition({
        data: submitValues,
        setIsEditing,
      });
      if (continueSubmit === null) {
        console.error(`SettingChange failed condition`);
        return;
      } else {
        const { overideFetchMethod, overideFetchUrl } = continueSubmit;
        if (overideFetchMethod) method = overideFetchMethod;
        if (overideFetchUrl) url = overideFetchUrl;
      }
    }
    setIsLoading(true);
    const bodyType = method === "GET" ? "query" : "body";
    const response = await toast
      .promise(
        fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          [bodyType]: JSON.stringify(submitValues),
        }),
        {
          error: "Request failed",
        },
      )
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
        return handleFailed({
          message: `Failed to update connection for ${props.title}`,
        });
      });
    if (!response) {
      handleFailed({
        message: `Failed to update connection for ${props.title}`,
      });
    }
    // console.log("response", response);
    let res: any = {};
    try {
      res = await response?.json();
    } catch {
      setIsLoading(false);
      handleFailed({
        message: `Failed to update connection for ${props.title}`,
      });
    }
    setIsLoading(false);
    function handleFailed(args: { message?: string }) {
      const message =
        args.message ??
        `[${props.title}] - ${res.message}` ??
        `Failed to update Data for ${props.title}`;
      toast.error(message);
      onFailed && onFailed({ message, setIsEditing });
    }
    if (!res) {
      // on connection failed
      handleFailed({
        message: `Failed to update connection for ${props.title}`,
      });
      return;
    }
    if (!res || !res.data) {
      // on data return failed
      handleFailed({});
      return;
    }
    // on success
    const message = `Successfully updated ${props.title}`;
    setFormValuesByProperties(res.data);
    onSuccess && onSuccess({ message, data: res.data, setIsEditing });
    toast.success(message);
    setIsEditing(false);
    setSettingsChanged(false);
  }
  function ItemEditButton({ itemName }: { itemName: string }) {
    return (
      <Button
        onClick={() => {
          setEditItem(itemName);
        }}
        css={css`
          color: skyblue;
        `}
        type="text"
      >
        {editItem === itemName ? "Save" : "Edit"}
      </Button>
    );
  }
  function EditButton() {
    return (
      <Button
        onClick={async () => {
          if (settingsChanged === true && isEditing === true) {
            setCancelModalIsOpen(true);
          } else {
            if (isEditing == false) {
              // save current settings as formValuesPrevious
              switch (props.name) {
                case "wicf_membership":
                  if (props?.userData?.wicf_member?.id) {
                    // is wicf member
                    setFormValuesPrevious(props.form?.getFieldsValue());
                    setIsEditing(true);
                    return;
                  }
                  if (!props?.userData?.phone_number) {
                    toast.error("Please set your phone number first");
                    return;
                  }
                  setIsLoading(true);
                  const response = await toast.promise(
                    fetch(
                      `/api/wicf/member?phone_number=${props.userData?.phone_number}`,
                    ),
                    {
                      pending: `Checking for your data`,
                      success: "Your Data was found",
                      error: "Request failed",
                    },
                  );
                  const res = (await response.json()) as $Res;
                  if (!res || res.isError === true) {
                    toast.error(
                      res?.message ??
                        "You are not registered, please register first",
                    );
                    setIsEditing(true);
                    setIsLoading(false);
                    return;
                  }
                  const _user = res?.data?.user as sessionUserType;
                  console.log("MAP-USER", res);
                  const confirmed = Modal.confirm({
                    title: `Are you ${_user?.first_name} ${_user?.last_name}?`,
                    content:
                      "Would you like to link this information with your account?",
                    onOk: () => {
                      // console.log("confirmed?", confirmed);
                      setFormValuesByProperties(_user);
                      setIsEditing(true);
                      setSettingsChanged(true);
                      Modal.info({
                        title: "Reminder",
                        content:
                          "Please dont forget to save the information to successfully register",
                      });
                      confirmed.destroy();
                    },
                    onCancel: () => {
                      Modal.info({
                        title: "Reminder",
                        content:
                          "Please fill the fields and save the information to successfully register",
                      });
                      setIsEditing(true);
                      confirmed.destroy();
                    },
                  });
                  setIsLoading(false);
                  break;
                default:
                  setFormValuesPrevious(props.form?.getFieldsValue());
                  setIsEditing(true);
              }
            } else {
              setIsEditing(false);
            }
          }
        }}
        css={css`
          color: ${isEditing ? "unset" : "skyblue"};
          display: ${props.isEditable === false ? "none" : "flex"};
        `}
        type={
          isEditing
            ? "default"
            : props.editButtonText === "Join"
              ? "primary"
              : "text"
        }
      >
        {isEditing ? "Cancel" : props.editButtonText ?? "Edit"}
      </Button>
    );
  }
  useEffect(() => {
    if (props.initialData) {
      // props.form?.setFieldsValue(props.initialData);
      setFormValuesByProperties(props.initialData);
    }
  }, [props.initialData, props.properties]);
  useEffect(() => {
    if (!props.getData) return;
    const { getDataOveride } = props.getData;
    if (getDataOveride) {
      getDataOveride({ setData: props.form?.setFieldsValue });
    } else {
      handleGetData();
    }
  }, [props.getData]);
  useEffect(() => {
    if (props.startEditable) setIsEditing(true);
  }, [props.startEditable]);

  useEffect(() => {
    if (props.isEditing) {
      props.isEditing.setIsEditing(isEditing);
    }
  }, [isEditing]);
  useEffect(() => {
    if (props.isEditing?.isEditing) {
      setIsEditing(props.isEditing?.isEditing);
    }
  }, [props.isEditing?.isEditing]);
  useEffect(() => {
    if (props.isLoading !== undefined) {
      setIsLoading(props.isLoading);
    }
  }, [props.isLoading]);
  useEffect(() => {
    props.errorProperties && setErrorProperties(props.errorProperties);
  }, [props.errorProperties]);
  const handleValuesChange = (changedValues, allValues) => {
    // setSettingsChanged(true);
    // console.log("changedValues", changedValues);
    // console.log("allValues", allValues);
    const values = props.form.getFieldsValue();
    if (props.onFormValuesChange) {
      props.onFormValuesChange({
        changedValues,
        allValues,
        form_name: props.name,
        values,
      });
    }
  };
  return (
    <Card
      hidden={props.isHidden}
      title={props.title}
      extra={props.hasExtras === false ? undefined : <EditButton />}
      bordered={false}
      color="black"
      css={css`
        // margin-top: 20px;
        width: 100%;
        background-color: transparent;
        color: white;
        border: ${props.hasBorders !== undefined
          ? `${props.hasBorders === true ? `1px solid white` : "0px"}`
          : `${isEditing ? `1px solid white` : "0px"}`};
        overflow: hidden;
      `}
      loading={isLoading}
    >
      <Modal
        title="Cancel without saving?"
        centered
        open={cancelModalIsOpen}
        okText="Yes"
        cancelText="No"
        onOk={() => {
          // replace with formValuesPrevious
          // props.form?.setFieldsValue(formValuesPrevious);
          setFormValuesByProperties(formValuesPrevious);
          setSettingsChanged(false);
          setIsEditing(false);
          setCancelModalIsOpen(false);
        }}
        onCancel={() => {
          setCancelModalIsOpen(false);
        }}
      >
        Are you sure you want to cancel without saving?
      </Modal>
      <Badge.Ribbon
        text={"Unsaved"}
        css={css`
          display: ${props.hasBadge === undefined
            ? `${settingsChanged ? "flex" : "none"}`
            : props.hasBadge
              ? "flex"
              : "none"};
        `}
      >
        <Form
          form={props.form}
          scrollToFirstError={true}
          onChange={() => {
            setSettingsChanged(true);
          }}
          onValuesChange={handleValuesChange}
          disabled={!isEditing}
          layout="vertical"
          onFinish={(values) => {
            handleSubmit(values);
          }}
          css={css({
            display: "flex",
            flexDirection: "column",
          })}
        >
          {props.properties.map((property) => {
            const sharedProps: any = {
              bordered: property.isEditable === false ? false : isEditing,
              disabled: property.isEditable === false ? true : undefined,
            };
            const rulesByNames = {
              phone_number: {
                min: 11,
                max: 11,
              },
              passwordNew: {
                min: 6,
              },
              passwordConfirm: {
                min: 6,
              },
            };
            const isRequired = {
              required: true,
              message:
                property.ruleMessage ??
                `Please enter a valid ${property.title}`,
            };
            let rulesTemp = {};
            if (property.isRequired === true)
              rulesTemp = { ...rulesTemp, ...isRequired };
            if (rulesByNames[property.name])
              rulesTemp = { ...rulesTemp, ...rulesByNames[property.name] };
            switch (property.type) {
              case "boolean":
                delete sharedProps.bordered;
                break;
              default:
            }
            let isValueOther = propertiesWithOther.some(
              (prop) => prop === property.name,
            );
            let allowOther =
              property.type === "options" && property.options?.allowOther;

            return (
              <>
                <Form.Item
                  key={property.name}
                  name={
                    property.type === "dateTime" ? undefined : property.name
                  }
                  label={
                    <span
                      style={{
                        color: errorProperties.some(
                          (prop) => prop === property.name,
                        )
                          ? "#FF5733"
                          : "white",
                      }}
                    >
                      {property.title}
                    </span>
                  }
                  rules={
                    Object.keys(rulesTemp).length > 0 ? [rulesTemp] : undefined
                  }
                  hidden={property.isHidden}
                  style={{
                    marginBottom: allowOther ? 0 : undefined,
                  }}
                >
                  {property.type === "string" ? (
                    <Input
                      {...sharedProps}
                      onBlur={() => {
                        setEditItem("");
                      }}
                    />
                  ) : null}
                  {property.type === "buttons" ? (
                    <div
                      style={{
                        display: "flex",
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      {property?.buttons?.map((button, index) => {
                        return (
                          <Button key={index} onClick={button.onClick}>
                            {button.label}
                          </Button>
                        );
                      })}
                    </div>
                  ) : null}
                  {property.type === "options" ? (
                    <>
                      {!isValueOther ? (
                        <Select
                          {...sharedProps}
                          allowClear
                          showSearch
                          filterOption={(input, option) =>
                            String(option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          mode={
                            property.options?.selectMultiple
                              ? "tags"
                              : undefined
                          }
                          options={property.options?.list}
                          css={css({
                            [".ant-select-selection-item"]: {
                              color: "#00FFFF !important",
                              backgroundColor:
                                userAgent === "wechat" || userAgent === "iphone"
                                  ? "#19212B !important"
                                  : "transparent !important",
                            },
                          })}
                        />
                      ) : (
                        <AutoComplete
                          {...sharedProps}
                          allowClear
                          css={css({
                            ["*"]: {
                              color:
                                userAgent === "wechat" || userAgent === "iphone"
                                  ? "black !important"
                                  : "white",
                              backgroundColor: "transparent !important",
                            },
                          })}
                          options={property.options?.list}
                          filterOption={(input, option) =>
                            String(option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        />
                      )}
                    </>
                  ) : null}
                  {property.type === "dateTime" ? (
                    <DatePicker
                      // defaultValue={dayjs("2000-01-0T00:00:00.000Z", dateFormat)}
                      {...sharedProps}
                      format={dateFormat}
                      value={dates[property.name]}
                      onChange={(date, dateString) => {
                        setDates({
                          name: property.name,
                          date: String(dateString),
                        });
                        setSettingsChanged(true);
                      }}
                      css={css`
                        width: 100%;
                      `}
                    />
                  ) : null}
                  {property.type === "boolean_old" ||
                  (property.type === "boolean" && !isEditing) ? (
                    <Switch
                      {...sharedProps}
                      checked={bools[property.name]}
                      onChange={(value) => {
                        setBools({ name: property.name, value: value });
                        setSettingsChanged(true);
                      }}
                      // checkedChildren={
                      //   property.boolean?.text
                      //     ? property.boolean?.text?.true ?? "Yes"
                      //     : undefined
                      // }
                      checkedChildren={
                        property.boolean?.text
                          ? typeof property.boolean?.text === "boolean"
                            ? "Yes"
                            : property.boolean?.text?.true
                          : undefined
                      }
                      unCheckedChildren={
                        property.boolean?.text
                          ? typeof property.boolean?.text === "boolean"
                            ? "No"
                            : property.boolean?.text?.false
                          : undefined
                      }
                    />
                  ) : null}
                  {property.type === "boolean" ? (
                    isEditing ? (
                      <Radio.Group
                        {...sharedProps}
                        defaultValue={false}
                        buttonStyle="solid"
                      >
                        <Radio.Button value={true}>Yes</Radio.Button>
                        <Radio.Button value={false}>No</Radio.Button>
                      </Radio.Group>
                    ) : undefined
                  ) : null}
                  {property.type === "number" ? (
                    <Input {...sharedProps} type="number" />
                  ) : null}
                  {property.type === "phoneNumber" ? (
                    <Input {...sharedProps} type="number" />
                  ) : null}
                  {property.type === "email" ? (
                    <Input {...sharedProps} type="email" />
                  ) : null}
                  {property.type === "password" ? (
                    <Input.Password
                      {...sharedProps}
                      type="password"
                      visibilityToggle
                    />
                  ) : null}
                  {/* {property.type === "passwordConfirm" ? (
                  <Input.Password
                    {...sharedProps}
                    type="password"
                    visibilityToggle
                  />
                ) : null} */}
                </Form.Item>
                {allowOther ? (
                  <span style={{ color: "grey", marginBottom: 24 }}>
                    {isValueOther
                      ? "Write custom answer above or select "
                      : "Option not available? Select "}
                    <Button
                      type="link"
                      onClick={() => {
                        const newArray = JSON.parse(
                          JSON.stringify(propertiesWithOther),
                        );

                        // Remove all occurrences of property.name
                        const filteredArray = newArray.filter(
                          (item) => item !== property.name,
                        );

                        // Optionally add property.name back if !isValueOther
                        if (!isValueOther) {
                          filteredArray.push(property.name);
                        }

                        console.log({ isValueOther, filteredArray });
                        setPropertiesWithOther(filteredArray);
                      }}
                      style={{ margin: 0, padding: 0 }}
                    >
                      {isValueOther ? "Options" : "Other"}
                    </Button>
                  </span>
                ) : null}
              </>
            );
          })}
          <Form.Item
            css={css`
              display: ${isEditing ? `flex` : `none`};
              align-items: center;
              justify-content: center;
            `}
          >
            <div
              css={css`
                display: flex;
                flex-direction: ${props.buttonsReverse ? "row-reverse" : "row"};
                align-items: center;
                justify-content: center;
                gap: 0px 10px;
                width: 100%;
              `}
            >
              <Button
                disabled={props.saveButton?.isDisabled ?? !settingsChanged}
                type="primary"
                css={css`
                  width: 200px;
                  display: ${props.saveButton?.isHidden ? "none" : undefined};
                `}
                htmlType={
                  props.saveButton?.onClickOveride ? undefined : "submit"
                }
                onClick={() => {
                  if (props.saveButton?.onClickOveride) {
                    props.saveButton.onClickOveride(
                      props.form.getFieldsValue(),
                    );
                  }
                }}
              >
                {props.saveButton?.label ?? `Save`}
              </Button>
              {/* <Button
                type="primary"
                css={css`
                  width: 200px;
                `}
                onClick={() => {
                  console.log(props.form.getFieldsValue());
                }}
              >
                Form
              </Button> */}
              {props.secondaryButton?.isHidden === true ? null : (
                <Button
                  disabled={props.secondaryButton?.isDisabled}
                  type="primary"
                  css={css`
                    width: 200px;
                  `}
                  onClick={() => {
                    if (props.secondaryButton?.onClickOveride) {
                      props.secondaryButton?.onClickOveride();
                    } else {
                      props.form.resetFields();
                    }
                  }}
                >
                  {props.secondaryButton?.label ?? `Clear`}
                </Button>
              )}
            </div>
          </Form.Item>
        </Form>
      </Badge.Ribbon>
    </Card>
  );
};

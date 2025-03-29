/** @jsxImportSource @emotion/react */
import {
  SettingsChange,
  SettingsChangeProps,
} from "@/components/SettingsChange";
import { shared_countries_options } from "@/shared/shared_countries";
import { shared_provinces_options } from "@/shared/shared_provinces";
import { shared_gender, shared_gender_options } from "@/shared/shared_gender";
import { shared_marital_status } from "@/shared/shared_marital_status";
import { shared_ministries_options } from "@/shared/shared_ministries";
import {
  shared_occupation_options,
  typeSharedOccupation,
} from "@/shared/shared_occupation";
import { shared_study_level_options } from "@/shared/shared_study_level";
import { TypeFormValuesChanged, TypeSession } from "@/shared/shared_types";
// import { shared_universities_options } from "@/shared/shared_universities";
import { shared_universities2_options } from "@/shared/shared_universities2";
import { DeviceScreen } from "@/styles/theme";
import { css } from "@emotion/react";
import {
  Button,
  // Carousel,
  Form,
  // Input,
  Progress,
  // message,
} from "antd";
import { useForm } from "antd/es/form/Form";
import { Montserrat } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { shared_bible_study_group_options } from "@/shared/shared_bible_study_group";
import { shared_membership_self_options } from "@/shared/shared_membership_self";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  getSession,
  signIn as signInOriginal,
  useSession,
} from "next-auth/react";
import { GetErrorMessage, GetErrorMessage2 } from "@/lib/errors";
import { StorageReadItem, storageWriteItem } from "@/utils/localStorage";
// import { setLazyProp } from "next/dist/server/api-utils";
import { wicf_member } from "@prisma/client";
import { NextSeo } from "next-seo";
import { permissionReturnRedirectionOrProps } from "@/utils/permission";
import useUserAgent from "@/hooks/useUserAgent";
import ReportButton from "@/components/ReportButton";

const font = Montserrat({ subsets: ["latin"] });
function Title(args: { text: string }) {
  return (
    <h3
      className={font.className}
      css={css`
        color: white;
        font-size: 32px;
        font-weight: 700;
        // max-width: 650px;
        margin-bottom: 5px;
        // border: 1px solid red;
        text-align: center;
        ${DeviceScreen.mobile} {
          font-size: 18px;
        }
      `}
    >
      {args.text}
    </h3>
  );
}

function SubTitle(args: { text: string }) {
  return (
    <span
      className={font.className}
      css={css`
        color: white;
        font-size: 24px;
        font-weight: 400;
        // max-width: 650px;
        margin-bottom: 5px;
        // border: 1px solid red;
        text-align: center;
        // line-height: 1.5; /* Adjust line height as needed */
        // height: calc(1.5em * 2);
        // overflow: hidden; /* Prevent overflow if text exceeds two lines */
        // white-space: nowrap; /* Prevent text wrapping */
        // display: inline-block;
        ${DeviceScreen.mobile} {
          // font-weight: 500;
          font-size: 16px;
        }
      `}
    >
      {args.text}
    </span>
  );
}

function ProgressBar(args: { indexCurrent: number; indexMax: number }) {
  return (
    <div
      style={
        {
          // border: "1px solid red"
        }
      }
    >
      <Progress
        // steps={10}
        // percent={50}
        showInfo={false}
        percent={Math.round(((args.indexCurrent + 1) / args.indexMax) * 100)}
        percentPosition={{ align: "center", type: "outer" }}
        size={["100%", 20]}
        strokeColor="white"
        style={{
          color: "red",
        }}
        css={css({
          ".ant-progress-text": {
            color: "white",
          },
        })}
      />
      <div
        style={{
          display: "flex",
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          // border: "1px solid red"
        }}
      >
        <span>
          Step {args.indexCurrent + 1} of {args.indexMax}
        </span>
        <span>
          {Math.round(((args.indexCurrent + 1) / args.indexMax) * 100)}%
        </span>
      </div>
    </div>
  );
}

export interface typeSteps {
  name:
    | "introduction"
    | "name"
    | "login"
    | "contact"
    | "password"
    | "personal"
    | "spiritual_journey"
    | "my_stay"
    | "school"
    | "work"
    | "service"
    | "complete";
  title: string;
  description: string;
  type: "reactNode" | "form" | "both" | "both-reverse";
  reactNode?: React.ReactNode;
  form?: Omit<SettingsChangeProps, "name" | "title">;
}

const contentStyle: React.CSSProperties = {
  margin: 0,
  // height: "100%",
  flexGrow: 1,
  color: "#fff",
  lineHeight: "160px",
  textAlign: "center",
  background: "#364d79",
};

const errorMessages = {
  user_data_update_failed: "Failed to update, try again / refresh the page",
};
export default function Page() {
  const isDebugging = false;
  const userAgent = useUserAgent();
  const session = useSession();

  const [error, setErrorReal] = useState<string>();
  const [errorProperties, setErrorProperties] = useState<string[] | undefined>(
    [],
  );
  const [stepsCurrentIndex, setStepsCurrentIndex] = useState(0);
  const allowScroll = false;
  // const [steps] = useState<typeSteps[]>(Steps);
  const [formName] = useForm();
  const [formContact] = useForm();
  const [formPassword] = useForm();
  const [formLogin] = useForm();
  // const [formWicfMembership1] = Form.useForm();
  const [formPersonal] = Form.useForm();
  const [formSpiritualJourney] = Form.useForm();
  const [formMyStay] = Form.useForm();
  const [formSchool] = Form.useForm();
  const [formWork] = Form.useForm();
  const [formService] = Form.useForm();

  // const [accountExists, setAccountExists] = useState(false);
  const [userId, setUserId] = useState<string>();
  const [formValuesChanged, setFormValuesChanged] = useState<
    TypeFormValuesChanged | undefined
  >(undefined);
  const api_is_account_exist = api.registration.is_account_exist.useMutation();
  const api_user_create = api.registration.user_create.useMutation();
  const api_user_update_info = api.registration.user_update_info.useMutation();
  const api_user_membership_create =
    api.registration.user_membership_create.useMutation();

  const api_user_wicf_membership_update =
    api.registration.user_wicf_membership_update.useMutation();
  // const api_user_get = api.registration.user_get.useQuery(undefined, {
  //   enabled: user ? true : false,
  //   refetchOnWindowFocus: false,
  //   refetchOnMount: false,
  //   refetchOnReconnect: false,
  // });
  const api_user_get = api.registration.user_get.useMutation();
  const user = session?.data?.user as TypeSession["user"];
  const [userData, setUserData] = useState<typeof api_user_get.data>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const [accountNoMembership, setAccountNoMembership] = useState(false);
  const [membershipCreateFailed, setMembershipCreateFailed] = useState(false);

  // function onFormValuesChanged(args: TypeFormValuesChanged) {
  //   console.log(args);
  //   setFormValuesChanged(args);
  // }
  function setError(
    args:
      | { message: string | undefined; errorProperties?: string[] }
      | undefined,
  ) {
    if (args) {
      if (stepsCurrentIndex > 4 && !user) {
        setErrorReal("Please login first, start from here");
        stepGoTo({ name: "introduction" });
        return;
      }
      args.message && setErrorReal(args.message);
      args.errorProperties && setErrorProperties(args.errorProperties);
    } else {
      setErrorReal(undefined);
      setErrorProperties([]);
    }
  }
  async function signIn(args: {
    phone_number: string;
    password: string;
    onSuccess?: () => void;
    onFailed?: (args: { errorCode?: string; errorMessage?: string }) => void;
  }) {
    const { phone_number, password } = args;
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          phone_number,
        },
      },
      undefined,
      { shallow: true },
    );
    storageWriteItem("phone_number", phone_number);
    storageWriteItem("password", password);
    setError(undefined);
    if (!args.phone_number || !args.password)
      return toast.error("Please enter your phone number and password");
    // setIsLoading(true);
    setIsLoggingIn(true);
    toast
      .promise(
        signInOriginal("credentials", {
          redirect: false,
          phone_number,
          password,
        }),
        {
          pending: "Logging in.... Please wait",
          error: "Request failed",
          // success: "Logged in successfully",
        },
      )
      .then((res) => {
        console.log(res);
        if (res?.error) {
          throw res.error;
        } else {
          setError(undefined);
          args.onSuccess && args.onSuccess();
        }
      })
      .catch((e) => {
        console.log({ e });
        if (e) {
          const errorMessage = GetErrorMessage(e, "Failed to login", e);
          args.onFailed && args.onFailed({ errorCode: e, errorMessage });
          // return e;
        }
      })
      .finally(() => {
        // setIsLoading(false);
        setIsLoggingIn(false);
      });
  }
  async function stepGoToIndex(args: { index: number; params?: any }) {
    if (args.index <= 0 || args.index > Steps.length) {
      return;
    }
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          ...args.params,
          step: args.index,
        },
      },
      undefined,
      { shallow: true },
    );
  }
  interface argsStepGoTo {
    name: typeSteps["name"];
    params?: any;
    isGoingPrevious?: boolean;
  }
  async function stepGoTo(args: argsStepGoTo) {
    const stepIndex = Steps.findIndex((step) => step.name === args.name);
    if (stepIndex >= 0) {
      // setStepsCurrentIndex(stepIndex);
      stepGoToIndex({
        index: stepIndex + 1,
        params: {
          ...args.params,
          previous_step: args.isGoingPrevious
            ? Steps[stepsCurrentIndex - 1].name
            : Steps[stepsCurrentIndex].name,
        },
      });
    }
  }

  async function userUpdateInfo(args: {
    onSuccess?: (args: { res?: any }) => void;
    onFailed?: (args: { message?: string; error?: any }) => void;
    userData?: typeof api_user_get.data;
    is_complete?: boolean;
    membershipData: {
      values: any;
      updateUserData?: boolean;
    };
  }) {
    // Fetch the current user data
    // const currentUserData = (await api_user_get.data) ?? userData;
    const currentUserData =
      userData ?? api_user_get.data ?? user ?? args.userData;
    const changedProperties = [] as string[];
    const registration_last_step = Steps[stepsCurrentIndex].name;
    try {
      if (!currentUserData) {
        throw new Error("User data not found");
      }
      if (!currentUserData?.wicf_member) {
        throw new Error(
          GetErrorMessage2({ errorCode: "account_no_membership" }),
        );
      }
      const hasChanges = (newValues: any, currentValues: any) => {
        let isChanged = false;

        for (const key in newValues) {
          const type = Steps[stepsCurrentIndex].form?.properties.find(
            (prop) => prop.name === key,
          )?.type;
          let newValue = newValues[key];
          let currentValue = currentValues[key];

          if (newValue !== currentValue) {
            if (newValue !== undefined) {
              if (type === "dateTime") {
                // Ensure both dates are in the same format
                newValue = new Date(newValue).toISOString();
                currentValue = new Date(currentValue).toISOString();
              }
              if (newValue !== currentValue) {
                isChanged = true;
                console.log({
                  key,
                  type,
                  currentValue,
                  newValue,
                });
                changedProperties.push(key);
                break;
              }
            }
          }
        }
        return isChanged;
      };
      const onSuccess = ({ res }: { res?: any }) => {
        args.onSuccess && args.onSuccess({ res });
        setError(undefined);
      };

      // if (args.membershipData) {
      let { values } = args.membershipData;

      // Check if values are different
      if (
        hasChanges(values, currentUserData?.wicf_member) ||
        args.is_complete
      ) {
        values = {
          ...values,
          registration_start_time:
            currentUserData?.wicf_member?.registration_start_time,
          registration_completion_time:
            currentUserData?.wicf_member?.registration_completion_time,
          registration_last_step,
        };
        if (args.is_complete) {
          values = { ...values, is_complete: true };
        }

        const res = await api_user_wicf_membership_update.mutateAsync({
          ...values,
        });
        if (res) {
          if (args.membershipData.updateUserData !== false) {
            setUserData({
              ...userData,
              wicf_member: { ...res },
            } as any);
          }
          onSuccess({ res });
        }
      } else {
        console.log("No changes detected in membership data.");
        if (error && Steps[stepsCurrentIndex]?.name !== "login") {
          const message = "Please solve the error first";
          console.error(message);
          toast.error(message);
        } else {
          onSuccess({});
        }

        // api_user_wicf_membership_update.mutateAsync({
        //   registration_last_step,
        // });
      }
      // } else {
      //   const values = {
      //     first_name:
      //       formName.getFieldValue("first_name") ?? router.query.first_name,
      //     last_name:
      //       formName.getFieldValue("last_name") ?? router.query.last_name,
      //     phone_number:
      //       formName.getFieldValue("phone_number") ?? router.query.phone_number,
      //     email: formContact.getFieldValue("email") ?? router.query.email,
      //     gender: formName.getFieldValue("gender") ?? router.query.gender,
      //     whatsapp_number:
      //       formContact.getFieldValue("whatsapp_number") ??
      //       router.query.whatsapp_number ??
      //       undefined,
      //   };

      //   // Check if values are different
      //   if (hasChanges(values, currentUserData)) {
      //     await toast
      //       .promise(api_user_update_info.mutateAsync({ ...values }), {
      //         pending: "Updating your information",
      //       })
      //       .then((res) => {
      //         onSuccess({ res });
      //       })
      //       .catch((e) => {
      //         toast.error(e.message);
      //         setError({
      //           message: e.message,
      //           errorProperties: changedProperties,
      //         });
      //         args.onFailed && args.onFailed({ message: e.message, error: e });
      //       });
      //   } else {
      //     console.log("No changes detected in user info.");
      //     if (!error) {
      //       onSuccess({});
      //     } else {
      //       const message = "Please solve the error first";
      //       toast.error(message);
      //     }
      //   }
      // }
    } catch (error) {
      console.error(error);
      const msg = error?.message ?? "Failed to fetch user data";
      // mark properties with error
      onError({ message: msg, errorProperties: changedProperties });
      // reset to previous user data
      currentUserData &&
        setUserData({
          ...currentUserData,
          wicf_member: {
            ...currentUserData.wicf_member,
            ...args.membershipData?.values,
          },
        } as any);

      args.onFailed && args.onFailed({ message: msg, error });
    }
  }

  async function userGet() {
    if (user && !api_user_get.isPending) {
      await api_user_get
        .mutateAsync()
        .then((res) => {
          // console.log(res);
        })
        .catch((e) => {
          console.error(e);
          setError({ message: e.message ?? "Failed to Save" });
        })
        .finally(() => {});
    }
  }
  const onError = (args: {
    message: string;
    errorProperties?: string[];
    stepGoTo?: argsStepGoTo;
  }) => {
    if (args.stepGoTo) {
      stepGoTo(args.stepGoTo);
    }
    setError({ message: args.message, errorProperties: args.errorProperties });
    // throw new Error(args.message);
    console.error(args.message);
  };
  async function onSubmit(values: any) {
    let { phone_number, email } = values;
    const occupation = values.occupation as typeSharedOccupation["value"];
    const is_new_member: boolean =
      router.query["new_member"] === "true" ? true : false;

    try {
      const stepCurrent = Steps[stepsCurrentIndex];
      phone_number = phone_number ?? router.query["phone_number"];

      if (user) {
        if (!userData?.wicf_member) {
          const message = GetErrorMessage2({
            errorCode: "account_no_membership",
          });
          toast.error(message);
          setError({ message });
          return;
        }
      }

      switch (stepCurrent.name) {
        case "introduction":
          stepGoTo({ name: "name", params: { ...values } });
          return;
        case "name":
          if (user) {
            userUpdateInfo({
              membershipData: { values },
              onSuccess: (res) => {
                // console.log("goto contact", res);
                stepGoTo({ name: "contact", params: { ...values } });
                return;
              },
              onFailed: ({ message, error }) => {
                error && console.error(error);
                errorSet({ message: message ?? "Failed to save" });
                return;
              },
            });
            return;
          }
          if (phone_number) {
            api_is_account_exist
              .mutateAsync({ phone_number, email })
              .then((res) => {
                console.log(res);
                if (res.phone_number_exists) {
                  console.log("goto login");
                  stepGoTo({ name: "login", params: { ...values } });
                } else {
                  stepGoTo({
                    name: "contact",
                    params: { ...values },
                  });
                }
              })
              .catch(() => {
                toast.error("Failed to check phone number");
              });
          } else {
            toast.error("Please provide a phone number");
          }
          break;
        case "contact":
          // stepGoTo({
          //   name: "contact",
          //   params: {
          //     ...router.query,
          //     ...values,
          //   },
          // });
          if (user) {
            await userUpdateInfo({
              membershipData: {
                values,
              },
              onSuccess: () => {
                console.log("contact - success");
                stepGoTo({ name: "personal" });
                return;
              },
              onFailed: ({ message, error }) => {
                error && console.error(error);
                errorSet({ message: message ?? "Failed to save" });
                return;
              },
            });
            return;
          }
          await formName.validateFields().catch((e) => {
            onError({
              message: "Please fill the first Step",
              stepGoTo: { name: "name" },
            });
          });

          if (!phone_number)
            onError({
              message: "Please fill the phonenumber",
            });
          if (!email) {
            // setError("Please fill the email");
            // throw new Error("Please fill the email");
            onError({
              message: "Please fill the email",
            });
          }
          await toast.promise(
            api_is_account_exist
              .mutateAsync({
                phone_number,
                email,
              })
              .then((res) => {
                if (res.phone_number_exists) {
                  stepGoTo({
                    name: "login",
                    params: {
                      phone_number:
                        values?.phone_number ?? router.query.phone_number,
                    },
                  });
                } else {
                  if (res.email_exists) {
                    setError({
                      message:
                        "Email is already Registered with another phone number please use another one",
                    });
                    // formContact.setFields([
                    //   { name: "email", errors: ["Email already used"] },
                    // ]);
                    return;
                  }
                  stepGoTo({
                    name: "password",
                    params: {
                      ...router.query,
                      ...values,
                    },
                  });
                }
              }),
            {
              pending: "Verifying you ....",
              error: "Request failed",
            },
          );

          break;
        case "password":
          const { password, password_confirm } = values;
          if (password === password_confirm) {
            try {
              const first_name: string =
                router.query["first_name"] ??
                formName.getFieldValue("first_name");
              const last_name: string =
                formName.getFieldValue("last_name") ??
                router.query["last_name"];
              const email: string =
                formContact.getFieldValue("email") ?? router.query["email"];
              const phone_number: string =
                formContact.getFieldValue("phone_number") ??
                router.query["phone_number"];
              const wechat_id: string =
                formContact.getFieldValue("wechat_id") ??
                router.query["wechat_id"];
              const whatsapp_number: string =
                formContact.getFieldValue("whatsapp_number") ??
                router.query["whatsapp_number"];

              if (!first_name || !last_name || !email || !phone_number) {
                setError({ message: "Please fill all required fields" });
                return;
              }
              await toast
                .promise(
                  api_user_create.mutateAsync({
                    first_name,
                    last_name,
                    email,
                    phone_number,
                    whatsapp_number,
                    wechat_id,
                    password,
                    is_new_member,
                    registration_last_step: Steps[stepsCurrentIndex].name,
                  }),
                  {
                    pending: "Saving....",
                    error: "Request failed",
                  },
                )
                .then((res) => {
                  console.log("password-res", res);
                  if (res?.isError) {
                    if (res.code === "P2002") {
                      stepGoTo({ name: "login" });
                      throw res;
                    }
                    throw res;
                  } else {
                    setIsLoading(true);
                    signIn({
                      phone_number,
                      password,
                      onSuccess: async () => {
                        stepGoTo({ name: "personal" });
                      },
                      onFailed: (e) => {
                        const message =
                          e.errorMessage ??
                          "Failed to auto login, please login manually";
                        toast.error(message);
                        setError({ message });
                        stepGoTo({ name: "login" });
                      },
                    });
                  }
                })
                .catch((e) => {
                  const { message } = e;
                  console.log("password-error", e);
                  if (message) {
                    errorSet({ message });
                  }
                  // setIsLoading(false);
                })
                .finally(() => {
                  // setIsLoading(false);
                });
            } catch (error) {
              console.error(error);
            }
          } else {
            errorSet({ message: "Please make sure password match" });
          }
          break;
        case "login":
          await signIn({
            ...values,
            onSuccess: async () => {
              console.log("Login - Success");
              toast.success("Logged in successfully");
              await api_user_get.mutateAsync().then(async (res) => {
                // console.log("userData", res);
                const first_name =
                  formName.getFieldValue("first_name") ??
                  router.query.first_name;
                const last_name =
                  formName.getFieldValue("last_name") ?? router.query.last_name;
                // console.log({ name: "login", first_name, last_name });
                await userUpdateInfo({
                  userData: res,
                  membershipData: {
                    values: {
                      first_name,
                      last_name,
                    },
                  },
                  onSuccess: () => {
                    console.log("Success to update data");
                    stepGoTo({ name: "personal" });
                  },
                  onFailed: () => {
                    console.error("failed to update data");
                    stepGoTo({ name: "personal" });
                  },
                });
              });
            },
            onFailed: ({ errorMessage }) => {
              console.log("Login - Failed", errorMessage);
              setError({ message: errorMessage });
            },
          });
          break;
        case "personal":
          await userUpdateInfo({
            membershipData: { values },
            onSuccess: ({ res }) => {
              stepGoTo({ name: "spiritual_journey" });
            },
            onFailed: (res) => {
              onError({
                message: errorMessages["user_data_update_failed"],
              });
            },
          });
          return;
        case "spiritual_journey":
          await userUpdateInfo({
            membershipData: { values },
            onSuccess: ({ res }) => {
              console.log("sj-res", res);
              stepGoTo({ name: "my_stay" });
            },
            onFailed: (res) => {
              onError({ message: errorMessages["user_data_update_failed"] });
            },
          });
          return;
        case "my_stay":
          console.log({ name: "school", occupation });
          await userUpdateInfo({
            membershipData: { values },
            onSuccess: ({ res }) => {
              switch (occupation) {
                case "worker":
                  stepGoTo({ name: "work", params: { occupation } });
                  break;
                case "student":
                  stepGoTo({ name: "school", params: { occupation } });
                  break;
                default:
                  stepGoTo({ name: "service", params: { occupation } });
              }
            },
            onFailed: (res) => {
              onError({ message: errorMessages["user_data_update_failed"] });
            },
          });
          return;
        case "school":
          await userUpdateInfo({
            membershipData: { values },
            onSuccess: ({ res }) => {
              stepGoTo({ name: "service" });
            },
            onFailed: (res) => {
              onError({ message: errorMessages["user_data_update_failed"] });
            },
          });
          return;
        case "work":
          await userUpdateInfo({
            membershipData: { values },
            onSuccess: ({ res }) => {
              stepGoTo({ name: "service" });
            },
            onFailed: (res) => {
              onError({ message: errorMessages["user_data_update_failed"] });
            },
          });
          return;
        case "service":
          await userUpdateInfo({
            is_complete: true,
            membershipData: { values },
            onSuccess: ({ res }) => {
              stepGoTo({ name: "complete" });
            },
            onFailed: (res) => {
              onError({ message: errorMessages["user_data_update_failed"] });
            },
          });
          return;
        default:
          console.log("default", values);
          break;
      }
      userGet();
    } catch (e) {
      const message = e.message;
      if (message) {
        toast.error(message);
        setError({ message });
      }
      console.error(e);
    } finally {
    }
  }
  // const [Steps, setSteps] = useState<typeSteps[]>([]);
  function errorSet(args: { message: string }) {
    toast.error(args.message);
    setError({ message: args.message });
  }
  const refContainer = useRef<HTMLDivElement>(null);
  const Steps: typeSteps[] = [
    {
      name: "introduction",
      title: "WICF information update",
      description: "",
      type: "reactNode",
      reactNode: (
        <div
          style={{
            padding: "10px 10px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            alignItems: "center",
          }}
        >
          <p className={font.className}>
            Welcome to WICF!
            <br />
            <br />
            We are delighted to have you with us. Whether you are a new visitor
            or a long-time attendee, we invite you to share a bit about yourself
            so we can better connect with you and support your spiritual
            journey.
            <br />
            <br />
            Your involvement helps us build a stronger, more vibrant fellowship,
            and we look forward to growing together in faith and friendship.
          </p>
          <Button
            size="large"
            style={{
              width: "70%",
              display: user ? "none" : isLoading ? "none" : "flex",
              transition: "1s",
            }}
            onClick={() => {
              onSubmit({
                new_member: true,
              });
            }}
            loading={isLoading}
            type={isLoading ? "default" : "default"}
          >
            {"First time visitor"}
          </Button>
          <Button
            size="large"
            style={{ width: "70%" }}
            onClick={() => {
              onSubmit({});
            }}
            loading={isLoading}
            type={isLoading ? "default" : "primary"}
          >
            {isLoading
              ? "Welcome, Please wait..."
              : user
                ? "Let's begin"
                : "Existing member"}
          </Button>
        </div>
      ),
    },
    {
      name: "name",
      title: "Welcome",
      description: "Welcome, what is your name?",
      type: "form",
      form: {
        initialData: user
          ? {
              ...userData?.wicf_member,
            }
          : {
              ...router.query,
            },
        properties: [
          {
            name: "first_name",
            title: "First Name",
            type: "string",
            isRequired: true,
          },
          {
            name: "last_name",
            title: "Last Name",
            type: "string",
            isRequired: true,
          },
          {
            name: "phone_number",
            title: "Phone",
            type: "phoneNumber",
            isRequired: true,
            // isEditable: user ? false : true,
          },
        ],
        form: formName,
      },
    },
    {
      name: "login",
      title: "You already have an Account",
      description: "Login to save your info",
      type: "both-reverse",
      reactNode: (
        <div style={{ textAlign: "center" }}>
          Forgot Password? <Link href="/forgot-password">Click to reset</Link>
        </div>
      ),
      form: {
        initialData: {
          ...router.query,
          password:
            router.query["phone_number"] === StorageReadItem("phone_number")
              ? StorageReadItem("password")
              : undefined,
        },
        properties: [
          {
            name: "phone_number",
            title: "Phone Number",
            type: "phoneNumber",
            isRequired: true,
          },
          {
            name: "password",
            title: "Password",
            type: "password",
            isRequired: true,
          },
        ],
        saveButton: {
          label: "Login",
        },
        form: formLogin,
      },
    },
    {
      name: "contact",
      title: "Contact",
      description: "How may we contact you?",
      type: "form",
      form: {
        initialData: user
          ? {
              ...userData?.wicf_member,
            }
          : { ...router.query },
        properties: [
          {
            name: "email",
            title: "Email",
            type: "email",
            isRequired: true,
          },
          {
            name: "wechat_id",
            title: "Wechat ID",
            type: "string",
          },
          {
            name: "whatsapp_number",
            title: "Whatsapp Number e.g (+861234567890)",
            type: "string",
          },
        ],
        form: formContact,
      },
    },
    {
      name: "password",
      title: "Password",
      description: "Set a password, to save your information",
      type: "both",
      form: {
        properties: [
          {
            name: "password",
            title: "Set Password",
            type: "password",
            isRequired: true,
          },
          {
            name: "password_confirm",
            title: "Confirm Password",
            type: "password",
            isRequired: true,
          },
        ],
        form: formPassword,
      },
    },
    // {
    //   name: "wicf_membership",
    //   title: "Wicf Membership",
    //   description: "Update your information",
    //   type: "form",
    //   form: {
    //     initialData: {
    //       ...userData?.wicf_member,
    //     },
    //     properties: [],
    //     form: formWicfMembership1,
    //   },
    // },
    {
      name: "personal",
      title: "We would like to know you",
      description: "",
      type: "both",
      form: {
        initialData: {
          ...userData?.wicf_member,
        },
        properties: [
          {
            name: "wicf_membership_self",
            title: "Are you a member / Joining WICF?",
            type: "options",
            options: { list: shared_membership_self_options },
          },
          {
            name: "gender",
            title: "Gender",
            type: "options",
            isRequired: true,
            options: { list: shared_gender_options },
          },
          { name: "birthday", title: "Birthday", type: "dateTime" },
          {
            name: "marital_status",
            title: "Marital_status ",
            type: "options",
            options: { list: shared_marital_status },
          },
          {
            name: "nationality",
            title: "Nationality",
            type: "options",
            isRequired: true,
            options: { list: shared_countries_options, allowOther: true },
          },
          {
            name: "passport_number",
            title: "Passport Number",
            type: "string",
          },
          {
            name: "visa_expiry_date",
            title: "Visa Expiry Date",
            type: "dateTime",
          },
        ],
        form: formPersonal,
      },
    },
    {
      name: "spiritual_journey",
      title: "My Spiritual Journey",
      description: "",
      type: "both",
      form: {
        initialData: {
          ...userData?.wicf_member,
        },
        properties: [
          {
            name: "is_born_again",
            title: "Are you Born again",
            type: "boolean",
            boolean: { text: true },
          },
          {
            name: "is_baptised",
            title: "Are you Baptised by immersion",
            type: "boolean",
            boolean: { text: true },
          },
          {
            name: "denomination",
            title: "Denomination",
            type: "string",
          },
          {
            name: "bible_study_group",
            title: "Which Bible study group do you attend?",
            type: "options",
            options: {
              list: shared_bible_study_group_options,
              allowOther: true,
            },
          },
        ],
        form: formSpiritualJourney,
      },
    },
    {
      name: "my_stay",
      title: "My stay in china",
      description: "",
      type: "both",
      form: {
        initialData: {
          ...userData?.wicf_member,
        },
        properties: [
          {
            name: "is_in_china",
            title: "Are you in China",
            type: "boolean",
            isRequired: true,
            // boolean: { text: true },
          },
          {
            name: "china_arrival_date",
            title: "When did you come to China?",
            type: "dateTime",
          },
          {
            name: "province",
            title: "Province",
            type: "options",
            options: { list: shared_provinces_options },
          },
          {
            name: "city",
            title: "City",
            type: "string",
          },
          {
            name: "address",
            title: "Address",
            type: "string",
          },
          {
            name: "occupation",
            title: "Occupation",
            type: "options",
            isRequired: true,
            options: { list: shared_occupation_options },
          },
        ],
        form: formMyStay,
      },
    },
    {
      name: "school",
      title: "School",
      description: "What are you studying",
      type: "both",
      form: {
        initialData: {
          ...userData?.wicf_member,
        },
        properties: [
          {
            name: "study_major",
            title: "Study Major",
            type: "string",
          },
          {
            name: "study_level",
            title: "Study Level",
            type: "options",
            options: { list: shared_study_level_options, allowOther: true },
          },
          {
            name: "university",
            title: "University",
            type: "options",
            options: { list: shared_universities2_options, allowOther: true },
          },
          {
            name: "university_campus",
            title: "University Campus",
            type: "string",
          },
          {
            name: "graduation_date",
            title: "Graduation Date",
            type: "dateTime",
          },
          {
            name: "leaving_date",
            title: "Expected Leaving Date",
            type: "dateTime",
          },
        ],
        form: formSchool,
      },
    },
    {
      name: "work",
      title: "Work",
      description: "What work do you do?",
      type: "both",
      form: {
        initialData: {
          ...userData?.wicf_member,
        },
        properties: [
          {
            name: "work_type",
            title: "Work Profession",
            type: "string",
          },
          {
            name: "work_place",
            title: "Work Place / Company",
            type: "string",
          },
        ],
        form: formWork,
      },
    },
    {
      name: "service",
      title: "Service",
      description:
        "Which Ministries have you served and would like to serve in",
      type: "both",
      form: {
        initialData: {
          ...userData?.wicf_member,
        },
        properties: [
          {
            name: "ministry_of_interest",
            title: "Ministries I'm interest in (Can select multiple)",
            type: "options",
            options: {
              selectMultiple: {
                labelKey: "label",
                valueKey: "value",
              },
              list: shared_ministries_options,
            },
          },
          {
            name: "ministries_involved",
            title: "Ministries already joined (Can select multiple)",
            type: "options",
            options: {
              selectMultiple: {
                labelKey: "label",
                valueKey: "value",
              },
              list: shared_ministries_options,
            },
          },
        ],
        form: formService,
      },
    },
    {
      name: "complete",
      title: "Update Complete",
      description: "",
      type: "reactNode",
      reactNode: (
        <div
          style={{
            padding: "10px 10px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: 15,
            alignItems: "center",
          }}
        >
          <p className={font.className}>
            Thank you for completing!
            <br />
            <br />
            Your information helps us to create a welcoming and supportive
            community where everyone feels connected and valued. It also allows
            us to better plan and organize events, ministries and activities for
            the members of the fellowship.
            <br />
            <br />
            If you have any questions or need assistance, please don't hesitate
            to reach out. We look forward to getting to know you better and to
            walking together on this journey of faith.
            <br />
            <br />
            Blessings to you!
          </p>
          <div style={{ width: "100%", display: "flex", gap: 10 }}>
            <Button
              type="primary"
              size="large"
              style={{ width: "70%" }}
              onClick={() => {
                router.push("/dashboard/account");
              }}
            >
              Dashboard
            </Button>
            <Button
              size="large"
              style={{ width: "70%" }}
              onClick={() => {
                router.push("/forms/feedback");
              }}
            >
              Give us Feedback
            </Button>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    setIsLoading(
      api_is_account_exist.isPending ||
        api_user_create.isPending ||
        api_user_update_info.isPending ||
        api_user_membership_create.isPending ||
        api_user_wicf_membership_update.isPending ||
        api_user_get.isPending ||
        isLoggingIn,
      // (user && api_user_get.isPending),
      // api_user_get.isFetching,
    );
  }, [
    api_is_account_exist.isPending,
    api_user_create.isPending,
    api_user_update_info.isPending,
    api_user_membership_create.isPending,
    api_user_wicf_membership_update.isPending,
    api_user_get.isPending,
    // api_user_get.isFetching,
    user,
    isLoggingIn,
  ]);

  useEffect(() => {
    // console.log("formValuesChanged", formValuesChanged);
    // setSteps();
  }, [formValuesChanged]);
  // useEffect(() => {
  //   console.log(
  //     "stepsCurrentIndex change",
  //     formWicfMembership1.getFieldsValue(),
  //   );
  // }, [formWicfMembership1]);
  useEffect(() => {
    // scroll snap to next
    const container = refContainer.current;
    if (container) {
      const newScrollPosition = stepsCurrentIndex * container.offsetWidth;
      container.scrollTo({
        left: newScrollPosition,
        // behavior: "smooth",
      });
    }
  }, [stepsCurrentIndex]);

  useEffect(() => {
    console.log("router.query.step", router.query.step);
    if (router.query.step !== undefined) {
      const stepIndex = parseInt(router.query.step as string);
      if (stepIndex >= 0 && stepIndex <= Steps.length) {
        setStepsCurrentIndex(stepIndex - 1);
      }
      const step = Steps[stepIndex - 1];
      switch (step.name) {
        case "login":
          if (user) {
            // stepGoTo({ name: "wicf_membership" });
            return;
          }
          let phone_number = "";
          const phone_number_form = formContact.getFieldValue("phone_number");
          if (phone_number_form !== "" && phone_number_form !== undefined) {
            console.log({ phone_number });
            phone_number = phone_number_form;
          } else {
            phone_number = String(router.query.phone_number);
          }
          formLogin.setFieldsValue({
            phone_number,
            password: StorageReadItem("password"),
          });
          break;
        default:
      }
    }
  }, [router.query]);

  // useEffect(() => {
  //   if (user) {
  //     console.log({ user });
  //     formName.setFieldsValue({
  //       first_name: user.first_name,
  //       last_name: user.last_name,
  //       gender: user?.wicf_member?.gender ?? undefined,
  //     });
  //     formContact.setFieldsValue({
  //       email: user.email,
  //       phone_number: user.phone_number,
  //       wechat: user?.wicf_member?.wechat_id,
  //       whatsapp_number: user?.wicf_member?.whatsapp_number,
  //     });
  //     // formWicfMembership1.setFieldsValue({ ...user.wicf_member });
  //   }
  // }, [user]);

  useEffect(() => {
    if (!user && stepsCurrentIndex + 1 >= 5) {
      // stepGoTo({ name: "name" });
    }
  }, [user, stepsCurrentIndex]);
  useEffect(() => {
    // only get data once loaded first time when empty
    if (user && !userData) {
      userGet();
    }
  }, [user, userData]);
  useEffect(() => {
    if (api_user_get.data) {
      setUserData(api_user_get.data);
    }
  }, [api_user_get.data]);
  useEffect(() => {
    if (userData && !userData?.wicf_member) {
      setAccountNoMembership(true);
      setError({
        message: GetErrorMessage2({ errorCode: "account_no_membership" }),
      });
      api_user_membership_create
        .mutateAsync({})
        .then((res) => {
          console.log(res);
          setError(undefined);
          toast.success(
            "There was an issue with your account, it has been resolved, you can continue",
          );
          userGet();
        })
        .catch((e) => {
          console.error(e);
          const message = GetErrorMessage2({
            errorCode: "account_no_membership",
          });
          toast.error(message);
          setError({ message });
          setMembershipCreateFailed(true);
        });
    } else {
      setAccountNoMembership(false);
    }
  }, [userData]);
  return (
    <>
      <NextSeo
        title={`WICF Information Update - ${Steps[stepsCurrentIndex].title}`}
      />
      <div
        css={css({
          // flex: 1,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignContent: "center",
          height: "90dvh",
          width: "100%",
          maxWidth: 768,
          padding: 10,
          [".ant-progress-inner"]: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          border: "1px solid white",
          borderRadius: 15,
          alignSelf: "flex-start",
        })}
      >
        <div>
          {isDebugging
            ? JSON.stringify(
                `
          api_is_account_exist:           ${api_is_account_exist.isPending}
          api_user_create:                ${api_user_create.isPending}
          api_user_update_info:           ${api_user_update_info.isPending}
          api_user_membership_create:     ${api_user_membership_create.isPending}
          api_user_wicf_membership_update:${api_user_wicf_membership_update.isPending}
          api_user_get-isPending:   ${api_user_get.isPending}
          userAgent: ${userAgent}
          scrollWidth: ${refContainer.current?.scrollWidth}
          offsetWidth: ${refContainer.current?.offsetWidth}
          clientWidth: ${refContainer.current?.clientWidth}
        `,
              )
            : null}
        </div>
        <div>{api_is_account_exist.isPending}</div>
        <ProgressBar indexCurrent={stepsCurrentIndex} indexMax={Steps.length} />
        <Title
          // text={!isLoading ? Steps[stepsCurrentIndex]?.title : "Loading..."}
          text={Steps[stepsCurrentIndex]?.title}
        />
        <SubTitle
          text={
            isLoading && stepsCurrentIndex === 1
              ? "Loading Please wait"
              : Steps[stepsCurrentIndex]?.description
          }
        />
        <ReportButton type="bug" clickTextColor="#FFD700" />
        {/* </div> */}
        {error && !isLoading && (
          <div
            className={font.className}
            style={{
              textAlign: "center",
              color: "#FF5733",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              // overflowWrap: "break-word",
              // wordWrap: "break-word",
              // wordBreak: "break-all",
              // border: "1px solid white",
            }}
          >
            {error}
          </div>
        )}
        <div
          // dotPosition="top"
          // arrows
          // infinite={false}
          ref={refContainer}
          style={{
            // flexGrow: 1,
            display: "flex",
            flexDirection: "row",
            alignContent: "center",
            // minHeight: "100%",
            width: "100%",
            maxWidth: 768,
            // padding: 25,
            // paddingTop: 25,
            // border: "1px solid green",
            borderRadius: 25,
            overflow: "auto",
            overflowX: allowScroll ? "auto" : "hidden",
            scrollSnapType:
              "x mandatory" /* Enables horizontal snap scrolling */,
            scrollPadding: "0px",
            gap: 0,
            // touchAction: "none",
            // pointerEvents: "none",
            // msTouchAction: "none",
          }}
          css={css({
            minHeight: "calc(90dvh - 190px)",
            scrollbarWidth: "none",
            [DeviceScreen.mobile]: {
              minHeight: "calc(90dvh - 150px)",
            },
          })}
          onScroll={(e) => {
            e.preventDefault();
          }}
        >
          {Steps.map((step, index) => (
            <div
              key={index}
              style={{
                // border: "1px solid red",
                width: "100%",
                flex: "none",
                scrollSnapAlign: "center",
                height: "100%",
                overflow: "auto",
                // display: "flex",
                flexDirection:
                  step.type === "both-reverse" ? "column-reverse" : "column",
                // flexDirection: "column",
                // alignContent: "center",
                justifyContent:
                  step.type === "both-reverse" ? "flex-end" : "flex-start",
              }}
              css={css({
                // width: "calc(100vw - 90px)",
              })}
            >
              {(step.type === "form" || step.type?.includes("both")) &&
              step.form ? (
                <SettingsChange
                  {...step.form}
                  name={step.name}
                  title=""
                  onSubmit={{
                    onSubmitOveride: ({ values }) => {
                      onSubmit(values);
                    },
                  }}
                  // hasCancel={false}
                  // onFormValuesChange={onFormValuesChanged}
                  hasBorders={false}
                  hasBadge={false}
                  startEditable={stepsCurrentIndex === index}
                  // isEditable={stepsCurrentIndex === index}
                  isEditable={true}
                  // startEditable={!api_is_account_exist.isPending}
                  // startEditable={false}
                  isLoading={isLoading}
                  hasExtras={false}
                  buttonsReverse={true}
                  saveButton={{
                    isDisabled: false,
                    label:
                      stepsCurrentIndex + 1 !== Steps.length
                        ? step.form?.saveButton?.label ?? "Next"
                        : "Finish",
                  }}
                  secondaryButton={{
                    // isHidden: true,
                    label: "Previous",
                    isDisabled:
                      stepsCurrentIndex - 1 < 0
                        ? true
                        : // : Steps[stepsCurrentIndex - 1].name === "password" ? true
                          false,
                    onClickOveride: () => {
                      const currentStep = Steps[stepsCurrentIndex];
                      const previousStep = Steps[stepsCurrentIndex - 1];
                      const previousStepQuery = router.query[
                        "previous_step"
                      ] as typeSteps["name"];
                      setError(undefined);
                      switch (currentStep.name) {
                        case "contact":
                          stepGoTo({ name: "name" });
                          return;
                        case "personal":
                          stepGoTo({ name: "contact" });
                          return;
                        case "work":
                        case "school":
                          stepGoTo({ name: "my_stay" });
                          return;
                        case "service":
                          if (previousStepQuery) {
                            stepGoTo({ name: previousStepQuery });
                            return;
                          } else {
                            stepGoTo({ name: "my_stay" });
                            return;
                          }
                        default:
                          if (previousStep) {
                            stepGoTo({ name: previousStep.name });
                          } else {
                          }
                      }

                      // setStepsCurrentIndex(stepsCurrentIndex - 1);
                    },
                  }}
                  errorProperties={errorProperties}
                />
              ) : null}
              {step.type === "reactNode" || step.type?.includes("both")
                ? step.reactNode
                : undefined}
            </div>
          ))}
        </div>
        <div
          style={{
            position: "fixed",
            left: 0,
            bottom: 0,
            display: "none",
            gap: 20,
            width: "100vw",
            padding: 10,
            justifyContent: "space-around",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <Button
            disabled={stepsCurrentIndex <= 0}
            onClick={() => {
              const nextIndex = stepsCurrentIndex - 1;
              if (nextIndex > 0) {
                // setStepsCurrentIndex(nextIndex);
                stepGoToIndex({ index: nextIndex });
              }
            }}
          >
            Prev
          </Button>
          <Button
            onClick={() => {
              const nextIndex = stepsCurrentIndex + 2;
              if (nextIndex < Steps.length) {
                // setStepsCurrentIndex(nextIndex);
                stepGoToIndex({ index: nextIndex });
              }
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}

import { TypeErrorCode } from "@/shared/shared_types";

export interface ArgsGetErrorMessage {
  errorCode: TypeErrorCode;
  defaultMessage?;
  errorObject?;
}
export function GetErrorMessage2(args: {
  errorCode: TypeErrorCode;
  defaultMessage?;
  errorObject?;
}) {
  return GetErrorMessage(args.errorCode, args.defaultMessage, args.errorObject);
}

export function GetErrorMessage(
  errorCode: ArgsGetErrorMessage["errorCode"],
  defaultMessage?: ArgsGetErrorMessage["defaultMessage"],
  errorObject?: ArgsGetErrorMessage["errorObject"],
): string {
  let errorMessage = "";
  switch (errorCode) {
    // case null:
    //   errorMessage = "Unknown";
    //   break;
    case "EmailSignin":
      errorMessage = "Email link error, please try again";
      break;
    case "e1":
      errorMessage = "E1";
      break;
    case "e2":
      errorMessage = "Delete not allowed";
      break;
    case "e3":
      errorMessage = "Delete id is required";
      break;
    case "e4":
      errorMessage = "You are not permitted to use this api endpoint";
      break;
    case "invalid_params":
      errorMessage = "Please provide all required valid parameters";
      break;
    case "action_error":
      errorMessage = "Action finished with error";
      break;
    case "action_no_result":
      errorMessage = "Action finished with no error but no result";
      break;
    case "login_require":
      errorMessage = "Please login and try again2";
      break;
    case "live-no-get-action":
      errorMessage = "No live get action";
      break;
    case "live-no-post-action":
      errorMessage = "No live post action";
      break;
    case "unSupportedRequestType":
      errorMessage = "The request type is unsupported";
      break;
    case "signInFailed":
      errorMessage = "Error Signing in";
      break;
    case "OAuthAccountNotLinked":
      errorMessage =
        "Third party login failed, Email may already be registered with";
      break;
    case "CredentialsSignin":
      errorMessage = "Wrong Username or Password";
      break;
    case "CredentialsSignup":
      errorMessage =
        "Please make sure you provide the phone number and password";
      break;
    case "P1000":
      errorMessage = "Database Authentication failed, Please Contact Admin";
      break;
    case "P1001":
      errorMessage = "Database Connection Failed, Please Contact Admin";
      break;
    case "P2002":
      switch (errorObject.meta.target) {
        case "user_email_key":
          return "Email is already registered with, please login or register with another email";
        case "user_phone_number_key":
          return "Your phone number is already registered with, please try another";
        default:
          return "The property you are trying to use is already registered with, please try another";
      }
    case "P2003":
      return "Invalid Phone number or User Id";
    case "P2025":
      return "The record(s) you are trying to update doesnt exists";
    // case "database_connection_failed":
    //   errorMessage = "Database Connection Failed, Contact Admin";
    //   break;
    case "P2024":
      return "Connection issue, please try again";
    case "noAuth":
      return "you are not permitted to use api endpoint";
    case "noMembers":
    case "membersNotFound":
      return "Members were not found";
    case "noMinistry":
      return "Ministry does not exist, or is not available for request";
    case "live-no-action":
      return "no action type given for live data";
    case "role_no_basic":
      return "There is no basic role, failed to create one, contact admin";
    case "general":
      return "General Error, Contact Admin";
    case "account_no_membership":
      return "You have an account but no WICF Membership, please refresh or contact report problem";
    default:
      // errorMessage = "General Error, Contact Admin";
      if (errorObject) {
        const code = errorObject.code ?? null;
        const message = errorObject.message;
        console.log("GetError", message, code);
        const word = "Please make sure your database server is running";
        if (message.indexOf(word) !== -1) {
          console.log("Database issue", message);
          // GetErrorMessage("P1001", "Database issue, Contact Admin");
          errorMessage = "Database Connection Failed, Please Contact Admin";
          // return;
        } else if (message.indexOf("Unknown arg") !== -1) {
          console.log("Invalid Arguments", message);
          errorMessage =
            "Please check the request arguments correctly, or Contact Admin";
        } else if (
          message.indexOf(
            "Expected Int or IntFieldUpdateOperationsInput, provided String.",
          ) !== -1
        ) {
          console.log("Invalid Arguments", message);
          errorMessage = "please provide correct type of arguments";
        } else if (code !== null) {
          errorMessage = GetErrorMessage(
            code,
            "Database issue, Contact Admin or Refresh the page and try again",
          );
        } else if (message !== null) {
          errorMessage = GetErrorMessage(
            message,
            "Database issue, Contact Admin",
          );
        } else {
          console.log("NOT database issue");
          errorMessage = "Unknown Error, Contact Admin";
        }
      } else {
        errorMessage = defaultMessage ?? "General Error, Contact Admin";
      }
  }
  // return `${errorMessage}${extraMessage ? " || " + extraMessage : null}`;
  return errorMessage;
}

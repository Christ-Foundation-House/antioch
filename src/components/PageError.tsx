import { FontMontserrat } from "@/styles/theme";
import { useEffect, useState } from "react";

export interface PropsError {
  type?: "no_reach_server";
  message?: string;
}

export function PageError(props: PropsError) {
  const [message, setMessage] = useState(
    "General Error, please try again or contact admin",
  );
  useEffect(() => {
    if (props.message) {
      setMessage(props.message);
      return;
    }
    switch (props.type) {
      case "no_reach_server":
        setMessage("Could not Reach server please try again");
        break;
      default:
    }
  }, [props.message, props.type]);
  return (
    <div
      className={FontMontserrat.className}
      style={{
        width: "100%",
        height: "100%",
        // border: "1px solid red",
        textAlign: "center",
      }}
    >
      <h1>Error:</h1>
      <h1>{message}</h1>
    </div>
  );
}

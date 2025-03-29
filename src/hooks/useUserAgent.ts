import { useEffect, useState } from "react";

type UserAgentType =
  | "wechat"
  | "iphone"
  | "android"
  | "firefox"
  | "chrome"
  | "safari"
  | "unknown";

const useUserAgent = (): UserAgentType => {
  const [userAgent, setUserAgent] = useState<UserAgentType>("unknown");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent.toLowerCase();
      let detectedAgent: UserAgentType = "unknown";

      switch (true) {
        case ua.includes("micromessenger"):
          detectedAgent = "wechat";
          break;
        case ua.includes("iphone"):
          detectedAgent = "iphone";
          break;
        case ua.includes("android"):
          detectedAgent = "android";
          break;
        case ua.includes("firefox"):
          detectedAgent = "firefox";
          break;
        case ua.includes("chrome"):
          detectedAgent = "chrome";
          break;
        case ua.includes("safari"):
          detectedAgent = "safari";
          break;
        default:
          detectedAgent = "unknown";
          break;
      }

      setUserAgent(detectedAgent);
    }
  }, []);

  return userAgent;
};

export default useUserAgent;

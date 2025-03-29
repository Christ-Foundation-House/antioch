// pages/index.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";

const IndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("register2/1");
  }, [router]);

  return null;
};

export default IndexPage;

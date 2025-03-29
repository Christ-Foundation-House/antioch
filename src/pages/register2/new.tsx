// pages/index.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";

const IndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/register2/1?new_member=true");
  }, [router]);

  return null;
};

export default IndexPage;

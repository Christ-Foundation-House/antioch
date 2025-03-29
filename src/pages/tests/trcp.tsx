// import { trpc } from "@/utils/trpc";
import { api } from "@/utils/api";
import { useEffect } from "react";

export default function IndexPage() {
  const hello = api.post.hello.useQuery({ text: "world" });
  const hello2 = api.post.hello2.useQuery();
  useEffect(() => {
    console.log("hello", hello.data);
    console.log("hello2", hello2.data);
  }, [hello, hello2]);
  return (
    <div>
      <div>{hello.data?.greeting ?? `Loading...`}</div>
      <div>{hello2.data?.greeting ?? `Loading2...`}</div>
    </div>
  );
}

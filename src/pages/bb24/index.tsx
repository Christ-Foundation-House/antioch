import { Button, Typography } from "antd";
// import Link from "next/link";
import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: "1200px",
      }}
    >
      <Typography.Title style={{ fontWeight: 800 }}>
        Welcome to BrownBag24
      </Typography.Title>
      <Button
        style={{ width: "100%", height: "100px", fontSize: 50 }}
        onClick={() => {
          router.push("/forms/brown_bag");
        }}
      >
        {`Register`}
      </Button>
      <Button
        style={{ width: "100%", height: "100px", fontSize: 50 }}
        onClick={() => {
          router.push("/bb24/sort");
        }}
      >
        {`Teams`}
      </Button>
    </div>
  );
}

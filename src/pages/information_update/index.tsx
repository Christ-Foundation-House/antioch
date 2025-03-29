import { NextSeo } from "next-seo";

const title = "WICF Information update";
export async function getServerSideProps() {
  return {
    redirect: {
      title: title,
      destination: "/register2",
      permanent: false,
    },
  };
}

export default function Home() {
  return <NextSeo title={title} />; // or your component JSX
}

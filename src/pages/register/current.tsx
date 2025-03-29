export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/register2/new",
      permanent: false,
    },
  };
}

export default function Home() {
  return null; // or your component JSX
}

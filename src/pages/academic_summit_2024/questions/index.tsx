export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/academic_summit_2024",
      permanent: false,
    },
  };
}

export default function Home() {
  return <></>; // or your component JSX
}

import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();
  const { form_id } = router.query;
  return <div>{`Form Id: ${form_id}`}</div>;
}

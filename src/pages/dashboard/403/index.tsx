import LayoutDashboard from "@/layouts/layoutDashboard";
import { useRouter } from "next/router";
import NoAccess from "@/pages/403";
export default function Page() {
  // props: { code: string }
  const router = useRouter();
  const { query } = router;
  const code =
    typeof query.code === "string" ? query.code : JSON.stringify(query.code);
  return (
    <LayoutDashboard title="No Access">
      <NoAccess code={code} />
    </LayoutDashboard>
  );
}

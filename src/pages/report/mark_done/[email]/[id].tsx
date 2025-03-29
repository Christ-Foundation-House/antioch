import { api } from "@/utils/api";
import { CheckCircleFilled, LoadingOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function Page() {
  const router = useRouter();
  const { id, email } = router.query;
  const api_reports_acknowledge_fixed =
    api.report.acknowledge_fixed.useMutation({});

  useEffect(() => {
    if (id && email) {
      toast.promise(
        api_reports_acknowledge_fixed
          .mutateAsync({
            reportId: Number(id),
            email: email as string,
            value: true,
          })
          .catch((e) => {
            console.error(e);
            toast.error;
          }),
        {
          pending: "Marking Report Complete",
        },
      );
    }
  }, [id, email]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
      }}
    >
      <h2>{`Marking Report as Done`}</h2>
      <h2>{`Report Id: #${id} by email: ${email}`}</h2>
      <div>
        {api_reports_acknowledge_fixed.isPending ? (
          <LoadingOutlined />
        ) : api_reports_acknowledge_fixed.isSuccess ? (
          <>
            Thank you very much <CheckCircleFilled style={{ color: "green" }} />
          </>
        ) : (
          "We could not mark the report as done"
        )}
      </div>
      <div style={{ color: "red" }}>
        {api_reports_acknowledge_fixed.error?.message
          ? "Error:" + api_reports_acknowledge_fixed.error?.message
          : ""}
      </div>
    </div>
  );
}

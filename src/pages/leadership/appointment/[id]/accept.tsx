import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";

export default function AcceptAppointmentPage() {
  const router = useRouter();
  const { id } = router.query;
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  const acceptAppointmentMutation =
    api.leadershipTenure.acceptAppointment.useMutation({
      onSuccess: () => {
        setStatus("success");
      },
      onError: (error) => {
        setStatus("error");
        setErrorMessage(error.message);
      },
    });

  useEffect(() => {
    if (id && typeof id === "string") {
      acceptAppointmentMutation.mutate({ id });
    }
  }, [id]);

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Leadership Appointment Acceptance</CardTitle>
          <CardDescription>
            Processing your leadership appointment acceptance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          )}

          {status === "success" && (
            <Alert className="bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Your leadership appointment has been successfully accepted.
                Thank you for your commitment to serve.
              </AlertDescription>
              <div className="mt-4">
                <Button
                  onClick={() => router.push("/leadership")}
                  variant="outline"
                >
                  Go to Leadership Dashboard
                </Button>
              </div>
            </Alert>
          )}

          {status === "error" && (
            <Alert className="bg-red-50">
              <XCircle className="h-5 w-5 text-red-600" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {errorMessage ||
                  "There was an error accepting your appointment. Please try again or contact support."}
              </AlertDescription>
              <div className="mt-4">
                <Button
                  onClick={() => router.push("/leadership")}
                  variant="outline"
                >
                  Go to Leadership Dashboard
                </Button>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import React from "react";
import { useRouter } from "next/router";
import { Button } from "antd";

const Success: React.FC = () => {
  const router = useRouter();

  const handleBack = () => {
    router.push("/qa/ask");
  };
  const handleViewQuestions = () => {
    router.push("/qa");
  };

  return (
    <div
      className="flex flex-col align-middle text-center justify-center"
      style={{ textAlign: "center", marginTop: "50px" }}
    >
      <h1>Submission Successful!</h1>
      <p>Your submission has been received successfully.</p>
      <div className="flex gap-2 align-middle justify-center p-2">
        <Button
          onClick={handleBack}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Go Back
        </Button>
        <Button
          onClick={handleViewQuestions}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          View Questions
        </Button>
      </div>
    </div>
  );
};

export default Success;

import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";

const QuestionList = () => {
  const router = useRouter();
  const allowedControl = true;

  const { data: topics, isLoading } = api.qa.getTopics.useQuery();
  return (
    <div className="container mx-auto p-4" style={{ height: "100%" }}>
      <h1 className="text-2xl font-bold mb-4">Questions And Answers</h1>
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => router.push("/qa/ask")}>
          Ask a New Question
        </Button>
        {allowedControl && (
          <Button onClick={() => router.push("/dashboard/questions")}>
            Manage Topics
          </Button>
        )}
      </div>
      <br />
      <br />
      <h1 className="text-2xl font-bold mb-4">View Topic Questions</h1>
      <div className="flex flex-wrap gap-4">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          topics?.map((topic) => (
            <Button
              key={topic.id}
              onClick={() => router.push(`/qa/${topic.name}`)}
            >
              {topic.Label}
            </Button>
          ))
        )}
      </div>
    </div>
  );
};

export default QuestionList;
